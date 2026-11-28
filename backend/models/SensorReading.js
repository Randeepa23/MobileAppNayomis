const mongoose = require('mongoose');

const nullableNumber = (min, max) => ({
  type: Number,
  default: null,
  min,
  max,
});

const sensorReadingSchema = new mongoose.Schema({
  smartBox: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBox',
    required: true,
    index: true,
  },
  deviceId: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false,
    default: null,
    index: true,
  },
  temperatureC: nullableNumber(-50, 125),
  humidityPercent: nullableNumber(0, 100),
  gasRaw: nullableNumber(0, 10000),
  gasAlert: { type: Boolean, default: null },
  latitude: nullableNumber(-90, 90),
  longitude: nullableNumber(-180, 180),
  motionDetected: { type: Boolean, default: null },
  accelerationX: nullableNumber(-2000, 2000),
  accelerationY: nullableNumber(-2000, 2000),
  accelerationZ: nullableNumber(-2000, 2000),
  boxOpen: { type: Boolean, default: null },
  batteryPercent: nullableNumber(0, 100),
  observationId: { type: String, default: null, trim: true },
  sequenceNumber: { type: Number, default: null },
  deviceRecordedAt: { type: Date, default: null },
  receivedAt: {
    type: Date,
    required: true,
    default: Date.now,
    immutable: true,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'sensor_readings',
});

sensorReadingSchema.index({ order: 1, receivedAt: -1 });
sensorReadingSchema.index({ smartBox: 1, receivedAt: -1 });
sensorReadingSchema.index({ deviceId: 1, receivedAt: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
