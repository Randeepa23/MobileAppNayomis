const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  return secret;
};

const authenticateCustomer = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, code: 'TOKEN_REQUIRED', message: 'Access token required' });
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ success: false, code: 'TOKEN_REQUIRED', message: 'Access token required' });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (!payload.studentId || payload.role !== 'user' || payload.type === 'admin') {
      return res.status(403).json({ success: false, code: 'CUSTOMER_TOKEN_REQUIRED', message: 'Customer access required' });
    }
    req.customer = payload;
    return next();
  } catch (error) {
    const expired = error && error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      code: expired ? 'SESSION_EXPIRED' : 'INVALID_TOKEN',
      message: expired ? 'Session expired' : 'Invalid token',
    });
  }
};

module.exports = { authenticateCustomer, getJwtSecret };
