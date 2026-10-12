const express = require('express');
const { adminLogin, getAllStudents, getAllOrders, getLoyaltyPointsReport, getAllReviews, getDashboardStats } = require('../controllers/adminController');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/students', getAllStudents);
router.get('/orders', getAllOrders);
router.get('/loyalty', getLoyaltyPointsReport);
router.get('/reviews', getAllReviews);
router.get('/dashboard', getDashboardStats);

module.exports = router;