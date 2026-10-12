const express = require('express');
const { ingestReading } = require('../controllers/sensorReadingController');
const { authenticateSensorDevice } = require('../middleware/sensorAuth');
const { deviceSensorRateLimit } = require('../middleware/deviceSensorRateLimit');

const router = express.Router();

router.post('/sensor-readings', deviceSensorRateLimit, authenticateSensorDevice, ingestReading);

module.exports = router;
