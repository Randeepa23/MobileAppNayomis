const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  school: { type: String, required: false },
  grade: { type: String, required: false },
  ageGroup: {
    type: String,
    enum: ['5-7', '8-10', '11-13', '14-16', '17-18'],
    required: false
  },
  address: { type: String, required: false },
  whatsapp: { type: String, required: false },
  points: { type: Number, default: 0 },
  wallet: {
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'LKR' }
  },
  dietaryPreferences: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    halalOnly: { type: Boolean, default: false },
    lowSugar: { type: Boolean, default: false },
    lowFat: { type: Boolean, default: false }
  },
  allergies: [{
    type: String,
    enum: ['nuts', 'dairy', 'eggs', 'gluten', 'soy', 'seafood', 'shellfish', 'other']
  }],
  medicalNotes: { type: String, default: '' },
  parentContact: {
    name: String,
    phone: String,
    email: String,
    relation: { type: String, enum: ['mother', 'father', 'guardian'], default: 'guardian' }
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

studentSchema.index({ school: 1, grade: 1 });
studentSchema.index({ 'wallet.balance': 1 });

module.exports = mongoose.model('Student', studentSchema);
