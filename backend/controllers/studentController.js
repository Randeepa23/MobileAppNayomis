const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../middleware/customerAuth');

const CUSTOMER_JWT_EXPIRES_IN = process.env.CUSTOMER_JWT_EXPIRES_IN || '24h';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
const normalizeName = (value) => typeof value === 'string'
  ? value.trim().replace(/\s+/g, ' ').replace(/[\u0000-\u001f\u007f]/g, '')
  : '';

const safeStudent = (student, includeOptional = false) => {
  const result = {
    _id: student._id,
    id: student._id,
    name: student.name,
    email: student.email,
    role: student.role,
    points: student.points || 0,
    loyaltyPoints: student.points || 0,
    orders: student.orders || [],
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
  if (includeOptional) {
    result.school = student.school;
    result.grade = student.grade;
  }
  return result;
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
      school: typeof req.body.school === 'string' ? req.body.school.trim() : undefined,
      grade: typeof req.body.grade === 'string' ? req.body.grade.trim() : undefined,
      address: typeof req.body.address === 'string' ? req.body.address.trim() : undefined,
      whatsapp: typeof req.body.whatsapp === 'string' ? req.body.whatsapp.trim() : undefined,
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
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  const errors = {};
  if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';
  if (typeof password !== 'string' || !password) errors.password = 'Password is required.';
  if (Object.keys(errors).length) return validationResponse(res, errors);

  try {
    const student = await Student.findOne({ email }).select('+password');
    const valid = student ? await bcrypt.compare(password, student.password) : false;
    if (!valid) {
      return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }
    if (student.role !== 'user') {
      return res.status(403).json({ success: false, code: 'CUSTOMER_ACCOUNT_REQUIRED', message: 'Use the appropriate account sign-in.' });
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

const findAndReturnStudent = async (id, res, nested = true) => {
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, code: 'CUSTOMER_NOT_FOUND', message: 'Student not found' });
    }
    const data = safeStudent(student, true);
    return res.json({ success: true, data: nested ? { student: data } : data });
  } catch (error) {
    return res.status(404).json({ success: false, code: 'CUSTOMER_NOT_FOUND', message: 'Student not found' });
  }
};

const getCurrentStudent = (req, res) => findAndReturnStudent(req.customer.studentId, res);

const getStudentById = (req, res) => {
  if (String(req.customer.studentId) !== String(req.params.id)) {
    return res.status(403).json({ success: false, code: 'PROFILE_ACCESS_DENIED', message: 'You can only access your own profile.' });
  }
  return findAndReturnStudent(req.params.id, res, false);
};

module.exports = {
  CUSTOMER_JWT_EXPIRES_IN,
  normalizeEmail,
  registerStudent,
  loginStudent,
  getCurrentStudent,
  getStudentById,
};
