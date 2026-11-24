const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./customerAuth');
const Student = require('../models/Student');

const requireDriver = async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Driver authentication required.' });
  }

  try {
    const token = authorization.slice('Bearer '.length).trim();
    const payload = jwt.verify(token, getJwtSecret());

    // Allow admin or driver role
    if (payload.type === 'admin') {
      req.driver = { kind: 'admin', email: payload.email, name: 'Admin Dispatcher' };
      return next();
    }

    if (payload.studentId) {
      const student = await Student.findById(payload.studentId);
      if (!student || (student.role !== 'driver' && student.role !== 'admin' && student.role !== 'user')) {
        return res.status(403).json({ success: false, message: 'Driver privileges required.' });
      }
      req.driver = {
        kind: 'driver',
        driverId: student._id,
        name: student.name,
        email: student.email,
        phone: student.whatsapp,
      };
      return next();
    }

    return res.status(403).json({ success: false, message: 'Invalid driver token.' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
};

module.exports = { requireDriver };

