const mongoose = require('mongoose');
const DeliveryBox = require('../models/DeliveryBox');
const Order = require('../models/Order');
const { DEVICE_ID_PATTERN } = require('../middleware/sensorAuth');

const TERMINAL_ORDER_STATUSES = ['delivered', 'completed', 'cancelled', 'rejected'];
const ELIGIBLE_ORDER_STATUSES = ['confirmed', 'preparing', 'ready', 'dispatched'];
const ASSIGNED_BOX_STATUSES = ['assigned', 'in-transit'];

const normalizeDeviceId = (value) => {
  if (typeof value !== 'string') {
    throw new Error('Set DEVICE_ID to a valid delivery box ID.');
  }
  const deviceId = value.trim();
  if (!deviceId || !DEVICE_ID_PATTERN.test(deviceId)) {
    throw new Error('Set DEVICE_ID to a valid delivery box ID.');
  }
  return deviceId;
};

const normalizeOrderId = (value) => {
  if (typeof value !== 'string') {
    throw new Error('Set ORDER_ID to a valid MongoDB ObjectId.');
  }
  const orderId = value.trim();
  if (!mongoose.isValidObjectId(orderId) || String(new mongoose.Types.ObjectId(orderId)) !== orderId.toLowerCase()) {
    throw new Error('Set ORDER_ID to a valid MongoDB ObjectId.');
  }
  return orderId.toLowerCase();
};

const idString = (value) => value == null ? null : String(value);
const orderBoxId = (order) => order?.delivery?.boxId || null;

const assignmentAgrees = (box, order, deviceId, orderId) => Boolean(
  box
  && order
  && idString(box.orderId) === idString(orderId)
  && orderBoxId(order) === deviceId
  && ELIGIBLE_ORDER_STATUSES.includes(order.status)
  && ASSIGNED_BOX_STATUSES.includes(box.status)
);

const unassignmentAgrees = (box, order) => Boolean(
  box
  && order
  && box.orderId == null
  && !orderBoxId(order)
  && box.status === 'idle'
);

const createDeliveryBoxAdminService = ({
  DeliveryBoxModel = DeliveryBox,
  OrderModel = Order,
} = {}) => {
  const registerDeliveryBox = async (rawDeviceId) => {
    const deviceId = normalizeDeviceId(rawDeviceId);
    const existing = await DeliveryBoxModel.findOne({ boxId: deviceId });
    if (existing) {
      return {
        created: false,
        deviceId: existing.boxId,
        status: existing.status,
        assignedOrderId: idString(existing.orderId),
      };
    }

    try {
      const box = await DeliveryBoxModel.create({
        boxId: deviceId,
        orderId: null,
        status: 'idle',
        assignedDate: null,
        deliveredDate: null,
      });
      return {
        created: true,
        deviceId: box.boxId,
        status: box.status,
        assignedOrderId: null,
      };
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const concurrentlyCreated = await DeliveryBoxModel.findOne({ boxId: deviceId });
      if (!concurrentlyCreated) throw error;
      return {
        created: false,
        deviceId: concurrentlyCreated.boxId,
        status: concurrentlyCreated.status,
        assignedOrderId: idString(concurrentlyCreated.orderId),
      };
    }
  };

  const assignDeliveryBox = async (rawDeviceId, rawOrderId) => {
    const deviceId = normalizeDeviceId(rawDeviceId);
    const orderId = normalizeOrderId(rawOrderId);
    const [order, box] = await Promise.all([
      OrderModel.findById(orderId),
      DeliveryBoxModel.findOne({ boxId: deviceId }),
    ]);

    if (!order) throw new Error(`Order ${orderId} does not exist.`);
    if (!ELIGIBLE_ORDER_STATUSES.includes(order.status)) {
      throw new Error(`Order ${orderId} is not eligible for assignment (status: ${order.status}).`);
    }
    if (!box) throw new Error(`Delivery box ${deviceId} does not exist.`);

    const existingBoxOrderId = idString(box.orderId);
    const existingOrderBoxId = orderBoxId(order);
    if (existingBoxOrderId && existingBoxOrderId !== orderId) {
      throw new Error(`Delivery box ${deviceId} is already assigned to order ${existingBoxOrderId}.`);
    }
    if (existingOrderBoxId && existingOrderBoxId !== deviceId) {
      throw new Error(`Order ${orderId} is already assigned to delivery box ${existingOrderBoxId}.`);
    }
    if (!existingBoxOrderId && box.status !== 'idle') {
      throw new Error(`Delivery box ${deviceId} is not available (status: ${box.status}).`);
    }
    if (existingBoxOrderId && !ASSIGNED_BOX_STATUSES.includes(box.status)) {
      throw new Error(`Delivery box ${deviceId} has an inconsistent assignment state (status: ${box.status}).`);
    }
    if (assignmentAgrees(box, order, deviceId, orderId)) {
      return { deviceId, orderId, boxStatus: box.status, alreadyAssigned: true };
    }

    const assignedAt = box.assignedDate || order.delivery?.assignedAt || new Date();
    let boxChanged = false;

    if (!existingBoxOrderId) {
      const updatedBox = await DeliveryBoxModel.findOneAndUpdate(
        { _id: box._id, boxId: deviceId, orderId: null, status: 'idle' },
        {
          $set: {
            orderId: order._id,
            status: 'assigned',
            assignedDate: assignedAt,
            deliveredDate: null,
          },
        },
        { new: true, runValidators: true },
      );
      if (!updatedBox) {
        throw new Error(`Delivery box ${deviceId} changed while it was being assigned. No order changes were made.`);
      }
      boxChanged = true;
    }

    if (!existingOrderBoxId) {
      const updatedOrder = await OrderModel.findOneAndUpdate(
        {
          _id: order._id,
          status: { $in: ELIGIBLE_ORDER_STATUSES },
          $or: [
            { 'delivery.boxId': { $exists: false } },
            { 'delivery.boxId': null },
            { 'delivery.boxId': '' },
          ],
        },
        {
          $set: {
            'delivery.boxId': deviceId,
            'delivery.assignedAt': assignedAt,
          },
        },
        { new: true, runValidators: true },
      );

      if (!updatedOrder) {
        if (boxChanged) {
          const rollback = await DeliveryBoxModel.updateOne(
            {
              _id: box._id,
              orderId: order._id,
              status: 'assigned',
              assignedDate: assignedAt,
            },
            {
              $set: {
                orderId: null,
                status: 'idle',
                assignedDate: box.assignedDate || null,
                deliveredDate: box.deliveredDate || null,
              },
            },
            { runValidators: true },
          );
          if (rollback.matchedCount !== 1) {
            throw new Error(`Order ${orderId} changed during assignment and the delivery-box rollback could not be verified. Run the assignment check before taking further action.`);
          }
        }
        throw new Error(`Order ${orderId} changed while the delivery box was being assigned. The delivery box change was restored.`);
      }
    }

    const [verifiedBox, verifiedOrder] = await Promise.all([
      DeliveryBoxModel.findOne({ boxId: deviceId }),
      OrderModel.findById(orderId),
    ]);
    if (!assignmentAgrees(verifiedBox, verifiedOrder, deviceId, orderId)) {
      throw new Error('Assignment verification failed because the delivery box and order do not agree.');
    }

    return {
      deviceId,
      orderId,
      boxStatus: verifiedBox.status,
      alreadyAssigned: false,
    };
  };

  const checkDeliveryBoxAssignment = async (rawDeviceId, rawOrderId) => {
    const deviceId = normalizeDeviceId(rawDeviceId);
    const requestedOrderId = rawOrderId == null || String(rawOrderId).trim() === ''
      ? null
      : normalizeOrderId(rawOrderId);
    const boxQuery = DeliveryBoxModel.findOne({ boxId: deviceId });
    const box = typeof boxQuery?.select === 'function'
      ? await boxQuery.select('+deviceTokenHash')
      : await boxQuery;
    if (!box) throw new Error(`Delivery box ${deviceId} does not exist.`);

    const assignedOrderId = idString(box.orderId);
    const orderIdToCheck = requestedOrderId || assignedOrderId;
    const order = orderIdToCheck ? await OrderModel.findById(orderIdToCheck) : null;
    const agrees = requestedOrderId
      ? assignmentAgrees(box, order, deviceId, requestedOrderId)
      : assignedOrderId
        ? assignmentAgrees(box, order, deviceId, assignedOrderId)
        : box.status === 'idle';

    return {
      deviceId,
      boxStatus: box.status,
      assignedOrderId,
      orderStatus: order?.status || null,
      orderDeliveryBoxId: orderBoxId(order),
      agrees,
      deviceTokenConfigured: Boolean(box.deviceTokenHash),
    };
  };

  const unassignDeliveryBox = async (rawDeviceId, rawOrderId) => {
    const deviceId = normalizeDeviceId(rawDeviceId);
    const orderId = normalizeOrderId(rawOrderId);
    const [box, order] = await Promise.all([
      DeliveryBoxModel.findOne({ boxId: deviceId }),
      OrderModel.findById(orderId),
    ]);

    if (!box) throw new Error(`Delivery box ${deviceId} does not exist.`);
    if (!order) throw new Error(`Order ${orderId} does not exist.`);
    if (idString(box.orderId) !== orderId || orderBoxId(order) !== deviceId) {
      throw new Error('DEVICE_ID and ORDER_ID do not match the existing two-sided assignment. No changes were made.');
    }
    if (!ASSIGNED_BOX_STATUSES.includes(box.status)) {
      throw new Error(`Delivery box ${deviceId} cannot be unassigned safely from status ${box.status}.`);
    }

    const previousBoxState = {
      orderId: box.orderId,
      status: box.status,
      assignedDate: box.assignedDate || null,
      deliveredDate: box.deliveredDate || null,
    };
    const updatedBox = await DeliveryBoxModel.findOneAndUpdate(
      { _id: box._id, boxId: deviceId, orderId: order._id, status: box.status },
      {
        $set: {
          orderId: null,
          status: 'idle',
          assignedDate: null,
          deliveredDate: null,
        },
      },
      { new: true, runValidators: true },
    );
    if (!updatedBox) {
      throw new Error(`Delivery box ${deviceId} changed while it was being unassigned. No order changes were made.`);
    }

    const updatedOrder = await OrderModel.findOneAndUpdate(
      { _id: order._id, 'delivery.boxId': deviceId },
      { $unset: { 'delivery.boxId': '', 'delivery.assignedAt': '' } },
      { new: true, runValidators: true },
    );
    if (!updatedOrder) {
      const rollback = await DeliveryBoxModel.updateOne(
        { _id: box._id, orderId: null, status: 'idle', assignedDate: null },
        { $set: previousBoxState },
        { runValidators: true },
      );
      if (rollback.matchedCount !== 1) {
        throw new Error(`Order ${orderId} changed during unassignment and the delivery-box rollback could not be verified. Run the assignment check before taking further action.`);
      }
      throw new Error(`Order ${orderId} changed while the delivery box was being unassigned. The delivery box change was restored.`);
    }

    const [verifiedBox, verifiedOrder] = await Promise.all([
      DeliveryBoxModel.findOne({ boxId: deviceId }),
      OrderModel.findById(orderId),
    ]);
    if (!unassignmentAgrees(verifiedBox, verifiedOrder)) {
      throw new Error('Unassignment verification failed because the delivery box and order do not agree.');
    }

    return { deviceId, orderId, boxStatus: verifiedBox.status };
  };

  return {
    registerDeliveryBox,
    assignDeliveryBox,
    checkDeliveryBoxAssignment,
    unassignDeliveryBox,
  };
};

module.exports = {
  ...createDeliveryBoxAdminService(),
  ASSIGNED_BOX_STATUSES,
  ELIGIBLE_ORDER_STATUSES,
  TERMINAL_ORDER_STATUSES,
  assignmentAgrees,
  createDeliveryBoxAdminService,
  normalizeDeviceId,
  normalizeOrderId,
  unassignmentAgrees,
};
