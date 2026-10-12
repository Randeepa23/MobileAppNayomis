const express = require('express');
const { registerStudent, loginStudent, getCurrentStudent, getStudentById } = require('../controllers/studentController');
const { authenticateCustomer } = require('../middleware/customerAuth');
const { authRateLimit } = require('../middleware/authRateLimit');

const router = express.Router();

router.post('/register', authRateLimit, registerStudent);
router.post('/login', authRateLimit, loginStudent);
router.get('/me', authenticateCustomer, getCurrentStudent);
router.get('/:id', authenticateCustomer, getStudentById);

module.exports = router;
