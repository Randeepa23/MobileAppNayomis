const express = require('express');
const { ingestReading } = require('../controllers/sensorReadingController');
const { authenticateSensorDevice } = require('../middleware/sensorAuth');
const { deviceSensorRateLimit } = require('../middleware/deviceSensorRateLimit');

const router = express.Router();

// Friendly status page when opened in a web browser
router.get('/sensor-readings', (req, res) => {
  res.json({
    success: true,
    service: "Nayomi's Smart Delivery Box Telemetry API",
    status: "active",
    expected_method: "POST",
    required_header: "x-device-token: nayomi_box_001_token_2026_esp32",
    message: "This endpoint is live and waiting for sensor data. The hardware must send an HTTP POST request with JSON sensor data to this URL."
  });
});

router.post('/sensor-readings', deviceSensorRateLimit, authenticateSensorDevice, ingestReading);

module.exports = router;
