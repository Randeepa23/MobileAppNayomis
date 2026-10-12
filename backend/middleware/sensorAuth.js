const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const DeliveryBox = require('../models/DeliveryBox');
const { getJwtSecret } = require('./customerAuth');

const DEVICE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

const getDeviceTokenPepper = () => {
  const pepper = process.env.DEVICE_TOKEN_PEPPER;
  if (!pepper) throw new Error('DEVICE_TOKEN_PEPPER is required');
  return pepper;
};

const hashDeviceToken = (token) => crypto
  .createHmac('sha256', getDeviceTokenPepper())
  .update(token, 'utf8')
  .digest('hex');

const safeTokenMatch = (token, storedHash) => {
  if (typeof token !== 'string' || !token || !/^[a-f0-9]{64}$/i.test(storedHash || '')) return false;
  const supplied = Buffer.from(hashDeviceToken(token), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return supplied.length === stored.length && crypto.timingSafeEqual(supplied, stored);
};

const readDeviceToken = (req) => {
  const customHeader = req.get('x-device-token');
  if (customHeader) return customHeader.trim();
  const authorization = req.get('authorization') || '';
  if (!authorization.startsWith('Device ')) return null;
  return authorization.slice('Device '.length).trim();
};

const logRejectedDeviceRequest = (req, reason) => {
  const rawDeviceId = req.body && req.body.device_id;
  const deviceId = typeof rawDeviceId === 'string' && DEVICE_ID_PATTERN.test(rawDeviceId)
    ? rawDeviceId
    : 'invalid-or-missing';
  console.warn('Rejected sensor request', { reason, deviceId, ip: req.ip });
};

const authenticateSensorDevice = async (req, res, next) => {
  const deviceId = req.body && req.body.device_id;
  if (typeof deviceId !== 'string' || !DEVICE_ID_PATTERN.test(deviceId)) {
    logRejectedDeviceRequest(req, 'invalid_device_id');
    return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'A valid device_id is required.' });
  }

  const token = readDeviceToken(req);
  if (!token) {
    logRejectedDeviceRequest(req, 'token_required');
    return res.status(401).json({ success: false, code: 'DEVICE_TOKEN_REQUIRED', message: 'Device authentication is required.' });
  }

  try {
    const device = await DeliveryBox.findOne({ boxId: deviceId }).select('+deviceTokenHash');
    if (!device || !safeTokenMatch(token, device.deviceTokenHash)) {
      logRejectedDeviceRequest(req, 'invalid_credentials');
      return res.status(401).json({ success: false, code: 'INVALID_DEVICE_CREDENTIALS', message: 'Invalid device credentials.' });
    }
    req.sensorDevice = device;
    return next();
  } catch (error) {
    if (error && error.message === 'DEVICE_TOKEN_PEPPER is required') {
      console.error('Sensor device authentication is not configured.');
      return res.status(503).json({ success: false, code: 'DEVICE_AUTH_UNAVAILABLE', message: 'Device authentication is temporarily unavailable.' });
    }
    console.error('Sensor device authentication failed.');
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Unable to authenticate the device right now.' });
  }
};

const authenticateSensorViewer = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, code: 'TOKEN_REQUIRED', message: 'Access token required' });
  }

  try {
    const payload = jwt.verify(authorization.slice('Bearer '.length).trim(), getJwtSecret());
    if (payload.type === 'admin') {
      req.sensorViewer = { kind: 'admin', email: payload.email };
      return next();
    }
    if (payload.studentId && payload.role === 'user') {
      req.sensorViewer = { kind: 'customer', studentId: payload.studentId };
      return next();
    }
    return res.status(403).json({ success: false, code: 'SENSOR_ACCESS_DENIED', message: 'Sensor access is not permitted for this account.' });
  } catch (error) {
    const expired = error && error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      code: expired ? 'SESSION_EXPIRED' : 'INVALID_TOKEN',
      message: expired ? 'Session expired' : 'Invalid token',
    });
  }
};

module.exports = {
  DEVICE_ID_PATTERN,
  authenticateSensorDevice,
  authenticateSensorViewer,
  hashDeviceToken,
  safeTokenMatch,
};
