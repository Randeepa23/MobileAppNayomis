const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    quantity: { type: Number, default: 1 }
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'validated', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'completed', 'cancelled', 'rejected'], 
    default: 'pending' 
  },
  pickupLocation: { type: String, required: true },
  pickupPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupPoint' },
  pickupTime: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  specialInstructions: { type: String, default: '' },
  pointsEarned: { type: Number, default: 0 },
  pointsUsed: { type: Number, default: 0 },
  
  // Validation & Constraints
  validation: {
    passed: { type: Boolean, default: false },
    checks: {
      menuAvailability: { passed: Boolean, message: String },
      cutoffTime: { passed: Boolean, message: String },
      dietaryCompliance: { passed: Boolean, message: String },
      allergyCheck: { passed: Boolean, message: String },
      ageAppropriate: { passed: Boolean, message: String }
    },
    validatedAt: Date,
    validatedBy: String
  },
  
  // Nutritional Analysis
  nutritionalInfo: {
    totalCalories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    isBalanced: { type: Boolean, default: false },
    warnings: [String],
    recommendations: [String]
  },
  
  // Payment & Accounting
  payment: {
    method: {
      type: String,
      enum: ['cash_on_delivery', 'online_payment', 'loyalty_points', 'wallet', 'credit', 'cash'],
      default: 'cash_on_delivery'
    },
    amount: Number,
    walletDeducted: { type: Number, default: 0 },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paidAt: Date
  },
  
  // IoT & Delivery Tracking
  delivery: {
    boxId: String,
    assignedAt: Date,
    dispatchedAt: Date,
    deliveredAt: Date,
    temperatureLog: [{
      temperature: Number,
      timestamp: Date,
      withinRange: Boolean
    }],
    locationLog: [{
      coordinates: [Number],
      timestamp: Date,
      address: String
    }],
    alerts: [{
      type: String,
      message: String,
      timestamp: Date
    }]
  },
  
  // Exception Handling
  exceptions: [{
    type: { type: String, enum: ['student_absent', 'delivery_delay', 'temperature_breach', 'cancelled', 'other'] },
    reason: String,
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolution: String
  }],
  
  // Schedule & Aggregation
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderSchedule' },
  batchNumber: String,
  preparationPriority: { type: Number, default: 0 },
  
  // Audit Trail
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  cancellationReason: String,

  // A customer-supplied key makes a retry of the same checkout safe.  It is
  // intentionally scoped to the customer rather than globally unique.
  request: {
    idempotencyKey: { type: String, trim: true },
    fingerprint: { type: String, trim: true }
  }
  
}, { timestamps: true });

orderSchema.index({ student: 1, deliveryDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryDate: 1, pickupLocation: 1 });
orderSchema.index({ scheduleId: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ student: 1, 'request.idempotencyKey': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Order', orderSchema);
