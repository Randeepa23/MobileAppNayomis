const mongoose = require('mongoose');

const orderScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  school: {
    type: String,
    required: true,
    index: true
  },
  cutoffTime: {
    type: Date,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  aggregatedItems: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem'
    },
    foodName: String,
    quantity: Number,
    totalCost: Number
  }],
  preparationSchedule: {
    startTime: Date,
    packingStartTime: Date,
    dispatchTime: Date,
    deliveryTime: Date
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'packing', 'dispatched', 'delivered', 'completed'],
    default: 'pending'
  },
  deliveryLocations: [{
    location: String,
    orderCount: Number,
    estimatedTime: Date
  }],
  notes: String
}, {
  timestamps: true
});

orderScheduleSchema.index({ date: 1, school: 1 }, { unique: true });
orderScheduleSchema.index({ status: 1 });

module.exports = mongoose.model('OrderSchedule', orderScheduleSchema);
