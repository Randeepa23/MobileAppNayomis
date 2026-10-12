const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['order_placed', 'order_validated', 'order_rejected', 'payment_success', 'payment_failed',
           'cutoff_reached', 'preparation_started', 'delivery_assigned', 'delivery_completed',
           'temperature_alert', 'student_absent', 'order_cancelled', 'refund_issued', 'system_error'],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  entityType: {
    type: String,
    enum: ['order', 'student', 'delivery', 'payment', 'system'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

eventLogSchema.index({ eventType: 1, createdAt: -1 });
eventLogSchema.index({ entityId: 1 });
eventLogSchema.index({ userId: 1 });
eventLogSchema.index({ resolved: 1 });

module.exports = mongoose.model('EventLog', eventLogSchema);
