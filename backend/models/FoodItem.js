const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
  available: { type: Boolean, default: true },
  availableDays: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: true }
  },
  
  // Nutritional Information (per serving)
  nutrition: {
    servingSize: { type: String, default: '1 serving' },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 }, // grams
    carbohydrates: { type: Number, default: 0 }, // grams
    fats: { type: Number, default: 0 }, // grams
    fiber: { type: Number, default: 0 }, // grams
    sugar: { type: Number, default: 0 }, // grams
    sodium: { type: Number, default: 0 }, // mg
    vitamins: Map,
    minerals: Map
  },
  
  // Dietary & Allergy Information
  dietary: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: true },
    isGlutenFree: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false }
  },
  
  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'eggs', 'gluten', 'soy', 'seafood', 'shellfish', 'other']
  }],
  
  // Age Appropriateness
  suitableAgeGroups: [{
    type: String,
    enum: ['5-7', '8-10', '11-13', '14-16', '17-18']
  }],
  
  // Preparation & Stock
  preparationTime: { type: Number, default: 15 }, // minutes
  stockQuantity: { type: Number, default: 0 },
  maxOrdersPerDay: { type: Number, default: 100 }
  
}, { timestamps: true });

foodItemSchema.index({ category: 1, available: 1 });
foodItemSchema.index({ 'nutrition.calories': 1 });

module.exports = mongoose.model('FoodItem', foodItemSchema);