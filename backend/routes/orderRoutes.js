const express = require('express');
const { placeOrder, completeOrder, getOrdersByStudent, updateOrderStatus } = require('../controllers/orderController');

const router = express.Router();

router.post('/place', placeOrder);
router.put('/complete/:id', completeOrder);
router.put('/:id/status', updateOrderStatus);
router.get('/student/:studentId', getOrdersByStudent);

module.exports = router;
