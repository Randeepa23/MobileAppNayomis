const Student = require('../models/Student');
const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../middleware/customerAuth');

const CUSTOMER_JWT_EXPIRES_IN = process.env.CUSTOMER_JWT_EXPIRES_IN || '7d';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
const normalizeName = (value) => typeof value === 'string'
  ? value.trim().replace(/\s+/g, ' ').replace(/[\u0000-\u001f\u007f]/g, '')
  : '';

const safeStudent = (student) => {
  const phoneValue = student.phone || student.telephone || student.whatsapp || '';
  const result = {
    _id: student._id,
    id: student._id,
    name: student.name,
    email: student.email,
    phone: phoneValue,
    telephone: phoneValue,
    role: 'user',
    points: typeof student.points === 'number' ? student.points : 0,
    loyaltyPoints: typeof student.points === 'number' ? student.points : 0,
    school: student.school || '',
    grade: student.grade || '',
    address: student.address || '',
    whatsapp: student.whatsapp || phoneValue,
    orders: student.orders || [],
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
  return result;
};

const safeDriver = (driver) => {
  return {
    _id: driver._id,
    id: driver._id,
    name: driver.name,
    email: driver.email,
    role: 'driver',
    phone: driver.phone || driver.whatsapp || '+94 77 123 4567',
    whatsapp: driver.whatsapp || driver.phone || '+94 77 123 4567',
    licenseNumber: driver.licenseNumber || 'B-8492011',
    vehicleModel: driver.vehicleModel || "Nayomi's Waterfront Delivery Van #1",
    vehicleNumber: driver.vehicleNumber || 'WP NB-4521',
    assignedBox: driver.assignedBox || 'BOX-001',
    assignedRoute: driver.assignedRoute || 'Ave Maria Convent & Negombo Distribution Route',
    dispatchHub: driver.dispatchHub || "Nayomi's Waterfront Kitchen Dispatch, Negombo",
    dutyStatus: driver.dutyStatus || 'available',
    points: 0,
    loyaltyPoints: 0,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  };
};

const validationResponse = (res, errors) => res.status(400).json({
  success: false,
  code: 'VALIDATION_ERROR',
  message: 'Please correct the highlighted fields.',
  errors,
});

const validateRegistration = ({ name, email, password }) => {
  const errors = {};
  if (name.length < 2 || name.length > 100) errors.name = 'Full name must be between 2 and 100 characters.';
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = 'Enter a valid email address.';
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
    errors.password = 'Password must be between 6 and 128 characters.';
  }
  return errors;
};

const registerStudent = async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  const phone = typeof req.body.phone === 'string'
    ? req.body.phone.trim()
    : (typeof req.body.telephone === 'string'
      ? req.body.telephone.trim()
      : (typeof req.body.whatsapp === 'string' ? req.body.whatsapp.trim() : ''));
  const errors = validateRegistration({ name, email, password });
  if (Object.keys(errors).length) return validationResponse(res, errors);

  try {
    const existingStudent = await Student.findOne({ email }).select('_id').lean();
    if (existingStudent) {
      return res.status(400).json({ success: false, code: 'EMAIL_ALREADY_EXISTS', message: 'An account already exists with this email.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      phone: phone || undefined,
      telephone: phone || undefined,
      school: typeof req.body.school === 'string' ? req.body.school.trim() : undefined,
      grade: typeof req.body.grade === 'string' ? req.body.grade.trim() : undefined,
      address: typeof req.body.address === 'string' ? req.body.address.trim() : undefined,
      whatsapp: phone || (typeof req.body.whatsapp === 'string' ? req.body.whatsapp.trim() : undefined),
    });
    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: { student: safeStudent(student) },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ success: false, code: 'EMAIL_ALREADY_EXISTS', message: 'An account already exists with this email.' });
    }
    console.error('Customer registration failed');
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Unable to create the account right now.' });
  }
};

const loginStudent = async (req, res) => {
  const loginInput = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  const errors = {};
  if (!loginInput) errors.email = 'Email or username is required.';
  if (typeof password !== 'string' || !password) errors.password = 'Password is required.';
  if (Object.keys(errors).length) return validationResponse(res, errors);

  try {
    const student = await Student.findOne({
      $or: [
        { email: loginInput },
        { name: { $regex: new RegExp(`^${loginInput.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } }
      ]
    }).select('+password');
    const valid = student ? await bcrypt.compare(password, student.password) : false;
    if (!valid) {
      return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { studentId: student._id.toString(), email: student.email, role: 'user' },
      getJwtSecret(),
      { expiresIn: CUSTOMER_JWT_EXPIRES_IN },
    );
    return res.json({
      success: true,
      message: 'Login successful',
      data: { token, student: safeStudent(student) },
    });
  } catch (error) {
    console.error('Customer login failed');
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Unable to sign in right now.' });
  }
};

const findAndReturnStudent = async (id, res, role = 'user', nested = true) => {
  try {
    if (role === 'driver') {
      const driver = await Driver.findById(id);
      if (driver) {
        const data = safeDriver(driver);
        return res.json({ success: true, data: nested ? { student: data } : data });
      }
    }
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, code: 'CUSTOMER_NOT_FOUND', message: 'User not found' });
    }
    const data = safeStudent(student);
    return res.json({ success: true, data: nested ? { student: data } : data });
  } catch (error) {
    return res.status(404).json({ success: false, code: 'CUSTOMER_NOT_FOUND', message: 'User not found' });
  }
};

const getCurrentStudent = (req, res) => {
  const role = req.customer.role || 'user';
  const id = req.customer.driverId || req.customer.studentId;
  return findAndReturnStudent(id, res, role);
};

const getStudentById = (req, res) => {
  if (String(req.customer.studentId) !== String(req.params.id)) {
    return res.status(403).json({ success: false, code: 'PROFILE_ACCESS_DENIED', message: 'You can only access your own profile.' });
  }
  return findAndReturnStudent(req.params.id, res, 'user', false);
};

const updateStudentProfile = async (req, res) => {
  const id = req.customer.studentId;
  if (!id) {
    return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, code: 'CUSTOMER_NOT_FOUND', message: 'User not found' });
    }

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      student.name = normalizeName(req.body.name);
    }
    const phoneInput = typeof req.body.phone === 'string'
      ? req.body.phone.trim()
      : (typeof req.body.telephone === 'string' ? req.body.telephone.trim() : undefined);
    if (typeof phoneInput !== 'undefined') {
      student.phone = phoneInput;
      student.telephone = phoneInput;
      student.whatsapp = phoneInput;
    }
    if (typeof req.body.whatsapp === 'string') {
      student.whatsapp = req.body.whatsapp.trim();
    }
    if (typeof req.body.address === 'string') {
      student.address = req.body.address.trim();
    }
    if (typeof req.body.school === 'string') {
      student.school = req.body.school.trim();
    }
    if (typeof req.body.grade === 'string') {
      student.grade = req.body.grade.trim();
    }

    await student.save();
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { student: safeStudent(student) },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Failed to update profile' });
  }
};

module.exports = {
  CUSTOMER_JWT_EXPIRES_IN,
  normalizeEmail,
  registerStudent,
  loginStudent,
  getCurrentStudent,
  getStudentById,
  updateStudentProfile,
};
