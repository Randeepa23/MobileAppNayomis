const express = require('express');
const router = express.Router();
const advancedOrderController = require('../controllers/advancedOrderController');

// Order placement and management
router.post('/place', advancedOrderController.placeAdvancedOrder);
router.post('/validate-checkout', advancedOrderController.validateCheckout);
router.get('/student/:studentId', advancedOrderController.getStudentOrders);
router.get('/student/:studentId/pickup-points', advancedOrderController.getPickupPointsForStudent);
router.post('/:orderId/cancel', advancedOrderController.cancelOrder);
router.patch('/:id/status', advancedOrderController.updateOrderStatus);

// Wallet operations
router.get('/wallet/:studentId', advancedOrderController.getWalletInfo);
router.post('/wallet/:studentId/topup', advancedOrderController.topUpWallet);

// Admin operations
router.get('/admin/preparation', advancedOrderController.getPreparationSummary);
router.get('/admin/exceptions', advancedOrderController.getUnresolvedExceptions);

module.exports = router;
