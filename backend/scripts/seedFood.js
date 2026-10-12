require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('../models/FoodItem');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodapp');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const seedFoodItems = async () => {
  try {
    await connectDB();
    
    // Clear existing food items
    await FoodItem.deleteMany();
    console.log('Cleared existing food items');
    
    const weekdayAvailability = {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    };

    const foodItems = [
      {
        name: 'Fish Roll',
        price: 150,
        description: 'Crispy, golden-fried roll filled with spiced fish and aromatic Sri Lankan herbs',
        category: 'Rolls'
      },
      {
        name: 'Fish Bun',
        price: 120,
        description: 'Soft, fluffy bun stuffed with deliciously seasoned fish filling',
        category: 'Buns'
      },
      {
        name: 'Fish Pastry',
        price: 130,
        description: 'Flaky pastry pocket filled with savory fish mixture and spices',
        category: 'Pastries'
      },
      {
        name: 'Chicken Burger',
        price: 280,
        description: 'Juicy chicken patty with fresh vegetables and special sauce in a toasted bun',
        category: 'Burgers'
      },
      {
        name: 'Chicken Pastry',
        price: 140,
        description: 'Golden pastry filled with tender chicken and aromatic spices',
        category: 'Pastries'
      },
      {
        name: 'Sausage Pastry',
        price: 135,
        description: 'Buttery pastry with succulent sausage and herbs',
        category: 'Pastries'
      },
      {
        name: 'Seeni Sambol Bun',
        price: 110,
        description: 'Traditional Sri Lankan sweet and spicy caramelized onion filling in a soft bun',
        category: 'Buns'
      },
      {
        name: 'Tea Bun',
        price: 90,
        description: 'Classic sweet bun perfect for pairing with Ceylon tea',
        category: 'Buns'
      }
    ].map(item => ({
      ...item,
      available: true,
      availableDays: weekdayAvailability
    }));
    
    await FoodItem.insertMany(foodItems);
    console.log('✅ Food items seeded successfully!');
    
    console.log('\\n🎉 Database seeded successfully!');
    console.log('Food items added:', foodItems.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedFoodItems();
