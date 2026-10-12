const attempts = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

const deviceSensorRateLimit = (req, res, next) => {
  const now = Date.now();
  const deviceId = typeof req.body?.device_id === 'string' ? req.body.device_id.slice(0, 64) : 'unknown';
  const key = `${req.ip}:${deviceId}`;
  const entry = attempts.get(key);

  if (!entry || now - entry.startedAt >= WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 1 });
    return next();
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      code: 'DEVICE_RATE_LIMITED',
      message: 'Too many sensor requests. Please retry shortly.',
    });
  }
  return next();
};

const resetDeviceSensorRateLimitForTests = () => attempts.clear();

module.exports = { deviceSensorRateLimit, resetDeviceSensorRateLimitForTests };
