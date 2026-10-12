const buckets = new Map();

const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxAttempts = Number(process.env.AUTH_RATE_LIMIT_MAX || 10);

const authRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.baseUrl}${req.path}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;
  bucket.count += 1;
  buckets.set(key, bucket);

  res.set('X-RateLimit-Limit', String(maxAttempts));
  res.set('X-RateLimit-Remaining', String(Math.max(0, maxAttempts - bucket.count)));
  if (bucket.count > maxAttempts) {
    res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again later.',
    });
  }
  return next();
};

const resetAuthRateLimitForTests = () => buckets.clear();

module.exports = { authRateLimit, resetAuthRateLimitForTests };
