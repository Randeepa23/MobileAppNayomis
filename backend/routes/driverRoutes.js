const express = require('express');
const {
  getDriverDeliveries,
  confirmDispatch,
  completeHandover,
  reportIncident,
} = require('../controllers/driverController');
const { requireDriver } = require('../middleware/driverAuth');

const router = express.Router();

router.use(requireDriver);

router.get('/deliveries', getDriverDeliveries);
router.post('/deliveries/:orderId/dispatch', confirmDispatch);
router.post('/deliveries/:orderId/complete', completeHandover);
router.post('/deliveries/:orderId/incident', reportIncident);

module.exports = router;

