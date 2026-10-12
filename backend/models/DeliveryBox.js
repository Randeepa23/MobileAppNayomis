const mongoose = require('mongoose');

const deliveryBoxSchema = new mongoose.Schema({
  boxId: {
    type: String,
    required: true,
    unique: true
  },
  // HMAC digest only. The device token itself must never be stored.
  deviceTokenHash: {
    type: String,
    select: false,
    unique: true,
    sparse: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  status: {
    type: String,
    enum: ['idle', 'assigned', 'in-transit', 'delivered', 'returned'],
    default: 'idle'
  },
  temperature: {
    current: { type: Number, default: null },
    min: { type: Number, default: 4 },
    max: { type: Number, default: 60 },
    lastUpdated: { type: Date, default: null }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // [longitude, latitude]
    },
    address: { type: String, default: '' },
    lastUpdated: { type: Date, default: null }
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  alerts: [{
    type: {
      type: String,
      enum: ['temperature', 'tampering', 'battery', 'delay', 'other']
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],
  assignedDate: Date,
  deliveredDate: Date
}, {
  timestamps: true
});

deliveryBoxSchema.index({ boxId: 1 });
deliveryBoxSchema.index({ orderId: 1 });
deliveryBoxSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('DeliveryBox', deliveryBoxSchema);
