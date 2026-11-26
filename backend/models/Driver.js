const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    default: 'driver',
    immutable: true,
  },
  phone: {
    type: String,
    default: '+94 77 123 4567',
  },
  whatsapp: {
    type: String,
    default: '+94 77 123 4567',
  },
  licenseNumber: {
    type: String,
    default: 'B-8492011',
  },
  vehicleModel: {
    type: String,
    default: "Nayomi's Waterfront Delivery Van #1",
  },
  vehicleNumber: {
    type: String,
    default: 'WP NB-4521',
  },
  assignedBox: {
    type: String,
    default: 'BOX-001',
  },
  assignedRoute: {
    type: String,
    default: 'Ave Maria Convent & Negombo Distribution Route',
  },
  dispatchHub: {
    type: String,
    default: "Nayomi's Waterfront Kitchen Dispatch, Negombo",
  },
  dutyStatus: {
    type: String,
    enum: ['available', 'on_delivery', 'off_duty'],
    default: 'available',
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

driverSchema.index({ email: 1 });
driverSchema.index({ assignedBox: 1 });

module.exports = mongoose.model('Driver', driverSchema);
