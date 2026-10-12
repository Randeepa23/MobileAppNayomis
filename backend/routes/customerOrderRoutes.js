const express = require('express');
const { authenticateCustomer } = require('../middleware/customerAuth');
const { placeOrder, getOrders } = require('../controllers/customerOrderController');

const router = express.Router();
router.use(authenticateCustomer);
router.get('/orders', getOrders);
router.post('/orders', placeOrder);

module.exports = router;
