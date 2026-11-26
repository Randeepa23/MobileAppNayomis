const express = require('express');
const {
  getDriverDeliveries,
  confirmDispatch,
  completeHandover,
  reportIncident,
  getDriverProfile,
  updateDeliveryStatus,
} = require('../controllers/driverController');
const { requireDriver } = require('../middleware/driverAuth');

const router = express.Router();

router.use(requireDriver);

router.get('/profile', getDriverProfile);
router.get('/deliveries', getDriverDeliveries);
router.put('/deliveries/:orderId/status', updateDeliveryStatus);
router.patch('/deliveries/:orderId/status', updateDeliveryStatus);
router.post('/deliveries/:orderId/dispatch', confirmDispatch);
router.post('/deliveries/:orderId/complete', completeHandover);
router.post('/deliveries/:orderId/incident', reportIncident);

module.exports = router;

