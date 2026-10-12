const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);