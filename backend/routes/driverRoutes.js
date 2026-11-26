const express = require('express');
const {
  getDriverDeliveries,
  confirmDispatch,
  completeHandover,
  reportIncident,
  getDriverProfile,
} = require('../controllers/driverController');
const { requireDriver } = require('../middleware/driverAuth');

const router = express.Router();

router.use(requireDriver);

router.get('/profile', getDriverProfile);
router.get('/deliveries', getDriverDeliveries);
router.post('/deliveries/:orderId/dispatch', confirmDispatch);
router.post('/deliveries/:orderId/complete', completeHandover);
router.post('/deliveries/:orderId/incident', reportIncident);

module.exports = router;

