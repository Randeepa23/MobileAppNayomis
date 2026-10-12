const express = require('express');
const {
  listSensorOrders,
  getLatestReading,
  getReadingHistory,
} = require('../controllers/sensorReadingController');
const { authenticateSensorViewer } = require('../middleware/sensorAuth');

const router = express.Router();

router.use(authenticateSensorViewer);
router.get('/sensor-orders', listSensorOrders);
router.get('/:orderId/sensor-readings/latest', getLatestReading);
router.get('/:orderId/sensor-readings', getReadingHistory);

module.exports = router;
