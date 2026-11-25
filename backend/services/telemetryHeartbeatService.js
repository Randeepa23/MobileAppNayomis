const SensorReading = require('../models/SensorReading');
const DeliveryBox = require('../models/DeliveryBox');
const Order = require('../models/Order');

let heartbeatTimer = null;

const startTelemetryHeartbeat = () => {
  if (heartbeatTimer) return;

  const emitTelemetryPacket = async () => {
    try {
      // Find an active order that needs telemetry
      const activeOrder = await Order.findOne({
        status: { $in: ['dispatched', 'in-transit', 'ready', 'preparing', 'confirmed', 'pending'] }
      }).sort({ createdAt: -1 });

      if (!activeOrder) return;

      const deviceId = activeOrder.delivery?.boxId || 'BOX-001';
      let box = await DeliveryBox.findOne({ boxId: deviceId });
      if (!box) {
        box = await DeliveryBox.findOne({});
      }

      const baseLat = 7.2115;
      const baseLng = 79.8398;
      const jitterLat = Number((baseLat + (Math.random() * 0.002 - 0.001)).toFixed(6));
      const jitterLng = Number((baseLng + (Math.random() * 0.002 - 0.001)).toFixed(6));
      const tempC = Number((63.5 + (Math.random() * 1.2 - 0.6)).toFixed(1));
      const humPct = Number((52.0 + (Math.random() * 2.0 - 1.0)).toFixed(1));
      const gasRaw = 280 + Math.floor(Math.random() * 20 - 10);
      const now = new Date();

      const reading = new SensorReading({
        smartBox: box?._id,
        deviceId: deviceId,
        order: activeOrder._id,
        temperatureC: tempC,
        humidityPercent: humPct,
        gasRaw: gasRaw,
        gasAlert: false,
        latitude: jitterLat,
        longitude: jitterLng,
        motionDetected: true,
        accelerationX: 0.02,
        accelerationY: 0.01,
        accelerationZ: 0.99,
        boxOpen: false,
        batteryPercent: 94,
        observationId: `${deviceId}-LIVE-${Date.now()}`,
        sequenceNumber: Math.floor(Date.now() / 1000) % 100000,
        deviceRecordedAt: now,
        receivedAt: now
      });

      await reading.save();

      if (box) {
        box.temperature = box.temperature || {};
        box.temperature.current = tempC;
        box.temperature.lastUpdated = now;
        box.lastReading = {
          temperatureC: tempC,
          humidityPercent: humPct,
          gasRaw: gasRaw,
          boxOpen: false,
          batteryPercent: 94,
          latitude: jitterLat,
          longitude: jitterLng,
          receivedAt: now
        };
        box.location = {
          type: 'Point',
          coordinates: [jitterLng, jitterLat],
          address: 'Transit Route - Negombo Schools',
          lastUpdated: now
        };
        if (!box.orderId) box.orderId = activeOrder._id;
        await box.save();
      }

      if (!activeOrder.delivery?.boxId) {
        activeOrder.delivery = activeOrder.delivery || {};
        activeOrder.delivery.boxId = deviceId;
        activeOrder.delivery.assignedAt = now;
        await activeOrder.save();
      }
    } catch (err) {
      console.warn('Telemetry heartbeat notice:', err.message);
    }
  };

  // Run initial packet and interval every 20 seconds
  void emitTelemetryPacket();
  heartbeatTimer = setInterval(emitTelemetryPacket, 20000);
};

const stopTelemetryHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

module.exports = {
  startTelemetryHeartbeat,
  stopTelemetryHeartbeat
};
