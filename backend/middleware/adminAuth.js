const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./customerAuth');

const requireAdmin = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  try {
    const token = authorization.slice('Bearer '.length).trim();
    const payload = jwt.verify(token, getJwtSecret());
    if (payload.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: administrator privileges required.' });
    }
    req.admin = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token.' });
  }
};

module.exports = { requireAdmin };

