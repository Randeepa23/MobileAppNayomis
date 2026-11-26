const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./customerAuth');
const Driver = require('../models/Driver');
const Student = require('../models/Student');

const requireDriver = async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Driver authentication required.' });
  }

  try {
    const token = authorization.slice('Bearer '.length).trim();
    const payload = jwt.verify(token, getJwtSecret());

    // Allow admin dispatcher
    if (payload.type === 'admin') {
      req.driver = { kind: 'admin', email: payload.email, name: 'Admin Dispatcher' };
      return next();
    }

    const driverId = payload.driverId || payload.studentId;
    if (driverId) {
      // 1. Check dedicated Driver collection
      const driver = await Driver.findById(driverId);
      if (driver && driver.accountStatus === 'active') {
        req.driver = {
          kind: 'driver',
          driverId: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.whatsapp || driver.phone,
          vehicleModel: driver.vehicleModel,
          vehicleNumber: driver.vehicleNumber,
          assignedBox: driver.assignedBox,
          assignedRoute: driver.assignedRoute,
        };
        return next();
      }

      // 2. Fallback check for admin
      const student = await Student.findById(driverId);
      if (student && (student.role === 'admin' || student.role === 'user')) {
        req.driver = {
          kind: 'driver',
          driverId: student._id,
          name: student.name,
          email: student.email,
          phone: student.whatsapp,
        };
        return next();
      }
    }

    return res.status(403).json({ success: false, message: 'Driver privileges required.' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
};

module.exports = { requireDriver };

