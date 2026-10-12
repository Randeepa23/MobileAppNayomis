const mongoose = require('mongoose');
const Order = require('../models/Order');
const SensorReading = require('../models/SensorReading');

const TERMINAL_ORDER_STATUSES = ['delivered', 'completed', 'cancelled', 'rejected'];
const ACTIVE_BOX_STATUSES = ['assigned', 'in-transit'];
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const ALLOWED_FIELDS = new Set([
  'device_id',
  'order_id',
  'temperature_c',
  'humidity_percent',
  'latitude',
  'longitude',
  'motion_detected',
  'acceleration_x',
  'acceleration_y',
  'acceleration_z',
  'box_open',
  'battery_percent',
  'device_recorded_at',
]);

const statusForReceivedAt = (receivedAt, serverNow = new Date()) => {
  if (!receivedAt) return 'waiting_for_data';
  const ageMs = Math.max(0, serverNow.getTime() - new Date(receivedAt).getTime());
  if (ageMs <= 60 * 1000) return 'online';
  if (ageMs <= 5 * 60 * 1000) return 'stale';
  return 'offline';
};

const isoOrNull = (value) => value ? new Date(value).toISOString() : null;

const serializeReading = (reading) => {
  if (!reading) return null;
  const value = typeof reading.toObject === 'function' ? reading.toObject() : reading;
  return {
    id: String(value._id || value.id),
    temperature_c: value.temperatureC ?? null,
    humidity_percent: value.humidityPercent ?? null,
    latitude: value.latitude ?? null,
    longitude: value.longitude ?? null,
    motion_detected: value.motionDetected ?? null,
    acceleration_x: value.accelerationX ?? null,
    acceleration_y: value.accelerationY ?? null,
    acceleration_z: value.accelerationZ ?? null,
    box_open: value.boxOpen ?? null,
    battery_percent: value.batteryPercent ?? null,
    device_recorded_at: isoOrNull(value.deviceRecordedAt),
    received_at: isoOrNull(value.receivedAt),
  };
};

const validateNumber = (body, key, min, max, errors) => {
  const value = body[key];
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    errors[key] = `Must be a number between ${min} and ${max}, or null.`;
    return null;
  }
  return value;
};

const validateBoolean = (body, key, errors) => {
  const value = body[key];
  if (value === undefined || value === null) return null;
  if (typeof value !== 'boolean') {
    errors[key] = 'Must be true, false, or null.';
    return null;
  }
  return value;
};

const validateReadingPayload = (body = {}) => {
  const errors = {};
  const unexpected = Object.keys(body).filter((key) => !ALLOWED_FIELDS.has(key));
  if (unexpected.length) errors.unexpected_fields = `Unsupported fields: ${unexpected.join(', ')}`;
  if (!mongoose.Types.ObjectId.isValid(body.order_id)) errors.order_id = 'A valid MongoDB order ID is required.';

  let deviceRecordedAt = null;
  if (body.device_recorded_at !== undefined && body.device_recorded_at !== null) {
    if (typeof body.device_recorded_at !== 'string'
      || !ISO_TIMESTAMP_PATTERN.test(body.device_recorded_at)
      || Number.isNaN(Date.parse(body.device_recorded_at))) {
      errors.device_recorded_at = 'Must be an ISO 8601 timestamp, or null.';
    } else {
      deviceRecordedAt = new Date(body.device_recorded_at);
    }
  }

  const value = {
    temperatureC: validateNumber(body, 'temperature_c', -50, 125, errors),
    humidityPercent: validateNumber(body, 'humidity_percent', 0, 100, errors),
    latitude: validateNumber(body, 'latitude', -90, 90, errors),
    longitude: validateNumber(body, 'longitude', -180, 180, errors),
    motionDetected: validateBoolean(body, 'motion_detected', errors),
    accelerationX: validateNumber(body, 'acceleration_x', -2000, 2000, errors),
    accelerationY: validateNumber(body, 'acceleration_y', -2000, 2000, errors),
    accelerationZ: validateNumber(body, 'acceleration_z', -2000, 2000, errors),
    boxOpen: validateBoolean(body, 'box_open', errors),
    batteryPercent: validateNumber(body, 'battery_percent', 0, 100, errors),
    deviceRecordedAt,
  };

  return { errors, value };
};

const ingestReading = async (req, res) => {
  const { errors, value } = validateReadingPayload(req.body);
  if (Object.keys(errors).length) {
    console.warn('Rejected sensor request', { reason: 'invalid_payload', deviceId: req.body.device_id, ip: req.ip });
    return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'The sensor reading is invalid.', errors });
  }

  try {
    const device = req.sensorDevice;
    const orderId = req.body.order_id;
    const assignedOrderId = device.orderId ? String(device.orderId) : null;
    if (assignedOrderId !== orderId || !ACTIVE_BOX_STATUSES.includes(device.status)) {
      console.warn('Rejected sensor request', { reason: 'device_not_assigned', deviceId: device.boxId, ip: req.ip });
      return res.status(409).json({ success: false, code: 'DEVICE_NOT_ASSIGNED', message: 'This device is not assigned to the requested active order.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn('Rejected sensor request', { reason: 'assigned_order_missing', deviceId: device.boxId, ip: req.ip });
      return res.status(404).json({ success: false, code: 'ORDER_NOT_FOUND', message: 'The assigned order was not found.' });
    }
    if (TERMINAL_ORDER_STATUSES.includes(order.status)
      || !order.delivery?.boxId
      || order.delivery.boxId !== device.boxId) {
      console.warn('Rejected sensor request', { reason: 'order_not_active', deviceId: device.boxId, ip: req.ip });
      return res.status(409).json({ success: false, code: 'ORDER_NOT_ACTIVE', message: 'The device is not assigned to an active delivery for this order.' });
    }

    const reading = await SensorReading.create({
      smartBox: device._id,
      deviceId: device.boxId,
      order: order._id,
      temperatureC: value.temperatureC,
      humidityPercent: value.humidityPercent,
      latitude: value.latitude,
      longitude: value.longitude,
      motionDetected: value.motionDetected,
      accelerationX: value.accelerationX,
      accelerationY: value.accelerationY,
      accelerationZ: value.accelerationZ,
      boxOpen: value.boxOpen,
      batteryPercent: value.batteryPercent,
      deviceRecordedAt: value.deviceRecordedAt,
      receivedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Sensor reading accepted.',
      data: { id: String(reading._id), received_at: isoOrNull(reading.receivedAt) },
    });
  } catch (error) {
    console.error('Unable to store sensor reading.');
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Unable to store the sensor reading right now.' });
  }
};

const orderNumber = (order) => `#${String(order._id).slice(-6).toUpperCase()}`;
const orderDeviceId = (order) => order.delivery?.boxId || null;

const verifyOrderAccess = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    res.status(400).json({ success: false, code: 'INVALID_ORDER_ID', message: 'A valid order ID is required.' });
    return null;
  }
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404).json({ success: false, code: 'ORDER_NOT_FOUND', message: 'Order not found.' });
    return null;
  }
  const ownerId = String(order.student?._id || order.student);
  if (req.sensorViewer.kind !== 'admin' && ownerId !== req.sensorViewer.studentId) {
    res.status(403).json({ success: false, code: 'ORDER_ACCESS_DENIED', message: 'You are not authorised to view this order.' });
    return null;
  }
  return order;
};

const listSensorOrders = async (req, res) => {
  try {
    const filter = { status: { $nin: TERMINAL_ORDER_STATUSES } };
    if (req.sensorViewer.kind !== 'admin') filter.student = req.sensorViewer.studentId;
    const orders = await Order.find(filter)
      .select('_id status delivery.boxId delivery.assignedAt deliveryDate createdAt')
      .sort({ createdAt: -1 })
      .lean();
    const serverNow = new Date();
    return res.json({
      success: true,
      message: 'Active sensor orders retrieved.',
      data: {
        orders: orders.map((order) => ({
          order_id: String(order._id),
          order_number: orderNumber(order),
          device_id: orderDeviceId(order),
          delivery_status: order.status,
          assigned_at: isoOrNull(order.delivery?.assignedAt),
          delivery_date: isoOrNull(order.deliveryDate),
        })),
        server_time: serverNow.toISOString(),
      },
    });
  } catch (error) {
    console.error('Unable to list sensor orders.');
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Unable to load active deliveries right now.' });
  }
};

const getLatestReading = async (req, res) => {
  try {
    const order = await verifyOrderAccess(req, res);
    if (!order) return undefined;
    const serverNow = new Date();
    const deviceId = orderDeviceId(order);
    const latest = deviceId
      ? await SensorReading.findOne({ order: order._id, deviceId }).sort({ receivedAt: -1 }).lean()
      : null;
    return res.json({
      success: true,
      message: 'Latest sensor reading retrieved.',
      data: {
        order_id: String(order._id),
        order_number: orderNumber(order),
        device_id: deviceId,
        delivery_status: order.status,
        assignment_status: deviceId ? (latest ? 'ready' : 'waiting_for_data') : 'unassigned',
        device_status: statusForReceivedAt(latest?.receivedAt, serverNow),
        latest: serializeReading(latest),
        server_time: serverNow.toISOString(),
      },
    });
  } catch (error) {
    console.error('Unable to retrieve latest sensor reading.');
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Unable to load the latest sensor reading right now.' });
  }
};

const getReadingHistory = async (req, res) => {
  try {
    const order = await verifyOrderAccess(req, res);
    if (!order) return undefined;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, Number.parseInt(req.query.per_page, 10) || 25));
    const deviceId = orderDeviceId(order);
    let readings = [];
    let total = 0;
    let newest = null;

    if (deviceId) {
      const filter = { order: order._id, deviceId };
      [readings, total, newest] = await Promise.all([
        SensorReading.find(filter).sort({ receivedAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
        SensorReading.countDocuments(filter),
        SensorReading.findOne(filter).sort({ receivedAt: -1 }).lean(),
      ]);
    }

    const serverNow = new Date();
    return res.json({
      success: true,
      message: 'Sensor reading history retrieved.',
      data: {
        order_id: String(order._id),
        order_number: orderNumber(order),
        device_id: deviceId,
        delivery_status: order.status,
        device_status: statusForReceivedAt(newest?.receivedAt, serverNow),
        readings: readings.map(serializeReading),
        pagination: {
          page,
          per_page: perPage,
          total,
          total_pages: Math.ceil(total / perPage),
        },
        server_time: serverNow.toISOString(),
      },
    });
  } catch (error) {
    console.error('Unable to retrieve sensor reading history.');
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Unable to load sensor history right now.' });
  }
};

module.exports = {
  ingestReading,
  listSensorOrders,
  getLatestReading,
  getReadingHistory,
  serializeReading,
  statusForReceivedAt,
  validateReadingPayload,
};
