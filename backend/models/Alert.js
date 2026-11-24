const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  boxId: {
    type: String,
    required: true,
    index: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'temperature_breach',
      'gas_anomaly',
      'unusual_motion',
      'tampering',
      'gps_lost',
      'device_disconnected',
      'low_battery',
      'delivery_delay',
      'other',
    ],
    required: true,
    index: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  message: {
    type: String,
    required: true,
  },
  triggerValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  triggerReading: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SensorReading',
    default: null,
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  resolvedBy: {
    type: String,
    default: null,
  },
  incidentNotes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  collection: 'alerts',
});

alertSchema.index({ orderId: 1, resolved: 1 });
alertSchema.index({ boxId: 1, resolved: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);

