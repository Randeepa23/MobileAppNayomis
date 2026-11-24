const crypto = require('crypto');
const DeliveryBox = require('../models/DeliveryBox');
const Order = require('../models/Order');
const deliveryBoxAdminService = require('../services/deliveryBoxAdminService');
const { hashDeviceToken } = require('../middleware/sensorAuth');

const listDevices = async (req, res) => {
  try {
    const boxes = await DeliveryBox.find()
      .populate('orderId', 'pickupLocation deliveryDate pickupTime status total student')
      .populate('driver', 'name email whatsapp')
      .select('+deviceTokenHash')
      .sort({ boxId: 1 })
      .lean();

    const result = boxes.map((box) => ({
      boxId: box.boxId,
      status: box.status,
      assignedOrderId: box.orderId ? String(box.orderId._id || box.orderId) : null,
      order: box.orderId && typeof box.orderId === 'object' ? {
        id: String(box.orderId._id),
        orderNumber: `#${String(box.orderId._id).slice(-6).toUpperCase()}`,
        status: box.orderId.status,
        pickupLocation: box.orderId.pickupLocation,
        deliveryDate: box.orderId.deliveryDate,
      } : null,
      driver: box.driver ? {
        id: String(box.driver._id),
        name: box.driver.name,
        phone: box.driver.whatsapp || null,
      } : null,
      temperature: box.temperature,
      gasThreshold: box.gasThreshold || { max: 800 },
      location: box.location,
      batteryLevel: box.batteryLevel,
      lastReading: box.lastReading || null,
      activeAlertsCount: (box.alerts || []).filter((a) => !a.resolved).length,
      hasDeviceToken: Boolean(box.deviceTokenHash),
      firmwareVersion: box.firmwareVersion || '1.0.0',
      assignedDate: box.assignedDate,
      deliveredDate: box.deliveredDate,
      updatedAt: box.updatedAt,
    }));

    return res.json({ success: true, data: { devices: result } });
  } catch (error) {
    console.error('Failed to list delivery devices:', error);
    return res.status(500).json({ success: false, message: 'Unable to retrieve devices.' });
  }
};

const registerDevice = async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ success: false, message: 'A valid deviceId (e.g. BOX-001) is required.' });
    }
    const result = await deliveryBoxAdminService.registerDeliveryBox(deviceId);
    return res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created ? `Device ${result.deviceId} registered successfully.` : `Device ${result.deviceId} already registered.`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const assignDevice = async (req, res) => {
  try {
    const { deviceId, orderId } = req.body;
    if (!deviceId || !orderId) {
      return res.status(400).json({ success: false, message: 'deviceId and orderId are required.' });
    }
    const result = await deliveryBoxAdminService.assignDeliveryBox(deviceId, orderId);
    return res.json({
      success: true,
      message: `Device ${deviceId} assigned to order ${orderId}.`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const unassignDevice = async (req, res) => {
  try {
    const { deviceId, orderId } = req.body;
    if (!deviceId || !orderId) {
      return res.status(400).json({ success: false, message: 'deviceId and orderId are required.' });
    }
    const result = await deliveryBoxAdminService.unassignDeliveryBox(deviceId, orderId);
    return res.json({
      success: true,
      message: `Device ${deviceId} unassigned from order ${orderId}.`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const issueDeviceToken = async (req, res) => {
  try {
    const { boxId } = req.params;
    const box = await DeliveryBox.findOne({ boxId });
    if (!box) {
      return res.status(404).json({ success: false, message: `Device ${boxId} not found.` });
    }

    const rawToken = crypto.randomBytes(24).toString('hex'); // 48-char secure token
    box.deviceTokenHash = hashDeviceToken(rawToken);
    await box.save();

    return res.json({
      success: true,
      message: `New authentication token generated for ${boxId}. Store this token safely in firmware.`,
      data: {
        boxId,
        token: rawToken,
      },
    });
  } catch (error) {
    console.error('Failed to issue device token:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateDeviceSettings = async (req, res) => {
  try {
    const { boxId } = req.params;
    const { tempMin, tempMax, gasMax } = req.body;
    const box = await DeliveryBox.findOne({ boxId });
    if (!box) {
      return res.status(404).json({ success: false, message: `Device ${boxId} not found.` });
    }

    if (tempMin != null && !Number.isNaN(Number(tempMin))) box.temperature.min = Number(tempMin);
    if (tempMax != null && !Number.isNaN(Number(tempMax))) box.temperature.max = Number(tempMax);
    if (gasMax != null && !Number.isNaN(Number(gasMax))) {
      box.gasThreshold = box.gasThreshold || {};
      box.gasThreshold.max = Number(gasMax);
    }

    await box.save();
    return res.json({
      success: true,
      message: `Settings updated for ${boxId}.`,
      data: {
        boxId,
        temperature: box.temperature,
        gasThreshold: box.gasThreshold,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDevices,
  registerDevice,
  assignDevice,
  unassignDevice,
  issueDeviceToken,
  updateDeviceSettings,
};

