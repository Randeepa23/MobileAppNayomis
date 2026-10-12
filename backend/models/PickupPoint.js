const mongoose = require('mongoose');

const pickupPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  school: {
    name: { type: String, required: true },
    id: String,
    address: String
  },
  location: {
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    },
    landmarks: String
  },
  capacity: {
    dailyLimit: { type: Number, default: 100 },
    currentOrders: { type: Number, default: 0 }
  },
  timeSlots: [{
    slot: { 
      type: String, 
      required: true,
      // e.g., "07:00-07:30", "07:30-08:00"
    },
    capacity: { type: Number, default: 50 },
    currentBookings: { type: Number, default: 0 }
  }],
  deliverySchedule: {
    standardDeliveryTime: { type: String, default: '07:30 AM' },
    cutoffTime: { type: String, default: '20:00' }, // 8:00 PM previous day
    daysInAdvance: { type: Number, default: 1 } // Must order 1 day in advance
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'temporarily_closed'],
    default: 'active'
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  operatingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  specialInstructions: String,
  deliveryNotes: String
}, { timestamps: true });

// Index for efficient queries
pickupPointSchema.index({ 'school.name': 1, status: 1 });
pickupPointSchema.index({ code: 1 });

// Virtual for availability status
pickupPointSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.capacity.currentOrders < this.capacity.dailyLimit;
});

// Method to check if pickup point is available for a date
pickupPointSchema.methods.isAvailableForDate = function(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return this.operatingDays.includes(dayName) && this.status === 'active';
};

// Method to get available time slots
pickupPointSchema.methods.getAvailableTimeSlots = function() {
  return this.timeSlots.filter(slot => slot.currentBookings < slot.capacity);
};

// Method to reserve a slot
pickupPointSchema.methods.reserveSlot = async function(timeSlot) {
  const slot = this.timeSlots.find(s => s.slot === timeSlot);
  if (!slot) throw new Error('Time slot not found');
  if (slot.currentBookings >= slot.capacity) throw new Error('Time slot fully booked');
  
  slot.currentBookings += 1;
  this.capacity.currentOrders += 1;
  await this.save();
  return true;
};

// Method to release a slot
pickupPointSchema.methods.releaseSlot = async function(timeSlot) {
  const slot = this.timeSlots.find(s => s.slot === timeSlot);
  if (slot && slot.currentBookings > 0) {
    slot.currentBookings -= 1;
    this.capacity.currentOrders -= 1;
    await this.save();
  }
};

module.exports = mongoose.model('PickupPoint', pickupPointSchema);
