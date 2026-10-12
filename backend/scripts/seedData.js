const mongoose = require('mongoose');
require('../config/db');

const Student = require('../models/Student');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Admin = require('../models/Admin');

const seedData = async () => {
  try {
    console.log('Starting database seed...');

    // Clear existing data
    await Student.deleteMany({});
    await FoodItem.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Admin.deleteMany({});

    console.log('Cleared existing data...');

    // Create admin account
    const admin = new Admin({
      username: 'admin',
      password: 'admin123'
    });
    await admin.save();
    console.log('Admin account created: admin/admin123');

    // Create sample students
    const students = await Student.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        school: 'Central High School',
        grade: '10',
        address: '123 Beach Road, Paradise Island',
        whatsapp: '+1234567890',
        loyaltyPoints: 45
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        school: 'East Side Academy',
        grade: '11',
        address: '456 Ocean View Drive, Paradise Island',
        whatsapp: '+0987654321',
        loyaltyPoints: 32
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        school: 'West Valley School',
        grade: '9',
        address: '789 Sunset Boulevard, Paradise Island',
        whatsapp: '+1122334455',
        loyaltyPoints: 18
      }
    ]);
    console.log(`Created ${students.length} students`);

    // Create sample food items
    const foodItems = await FoodItem.insertMany([
      {
        name: 'Grilled Fish with Rice',
        price: 250,
        description: 'Fresh grilled fish served with coconut rice and vegetables',
        category: 'Main Course',
        availableDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        available: true
      },
      {
        name: 'Tropical Fruit Bowl',
        price: 120,
        description: 'Fresh mixed tropical fruits with yogurt and honey',
        category: 'Breakfast',
        availableDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true
        },
        available: true
      },
      {
        name: 'Coconut Water',
        price: 80,
        description: 'Fresh coconut water served chilled',
        category: 'Beverage',
        availableDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true
        },
        available: true
      },
      {
        name: 'Fish Curry',
        price: 300,
        description: 'Traditional fish curry with rice and papadum',
        category: 'Main Course',
        availableDays: {
          monday: false,
          tuesday: true,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: true,
          sunday: true
        },
        available: true
      },
      {
        name: 'Mango Smoothie',
        price: 150,
        description: 'Refreshing mango smoothie with ice cream',
        category: 'Dessert',
        availableDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: false
        },
        available: true
      }
    ]);
    console.log(`Created ${foodItems.length} food items`);

    // Create sample orders
    const orders = await Order.insertMany([
      {
        student: students[0]._id,
        items: [
          { foodItem: foodItems[0]._id, quantity: 1 },
          { foodItem: foodItems[2]._id, quantity: 2 }
        ],
        total: 410,
        status: 'completed',
        pickupLocation: 'Main Beach Counter',
        pickupTime: '2025-12-23T12:30:00Z',
        loyaltyPointsEarned: 41
      },
      {
        student: students[1]._id,
        items: [
          { foodItem: foodItems[1]._id, quantity: 1 },
          { foodItem: foodItems[4]._id, quantity: 1 }
        ],
        total: 270,
        status: 'confirmed',
        pickupLocation: 'Pool Side Counter',
        pickupTime: '2025-12-23T14:00:00Z',
        loyaltyPointsEarned: 27
      },
      {
        student: students[2]._id,
        items: [
          { foodItem: foodItems[3]._id, quantity: 1 }
        ],
        total: 300,
        status: 'pending',
        pickupLocation: 'Restaurant Counter',
        pickupTime: '2025-12-23T19:00:00Z',
        loyaltyPointsEarned: 30
      }
    ]);
    console.log(`Created ${orders.length} orders`);

    // Create sample reviews
    const reviews = await Review.insertMany([
      {
        student: students[0]._id,
        foodItem: foodItems[0]._id,
        order: orders[0]._id,
        rating: 5,
        comment: 'Absolutely delicious! The fish was perfectly grilled and the rice was amazing.'
      },
      {
        student: students[1]._id,
        foodItem: foodItems[1]._id,
        order: orders[1]._id,
        rating: 4,
        comment: 'Fresh fruits and great portion size. Will order again!'
      },
      {
        student: students[0]._id,
        foodItem: foodItems[2]._id,
        order: orders[0]._id,
        rating: 5,
        comment: 'Best coconut water on the island! Very refreshing.'
      }
    ]);
    console.log(`Created ${reviews.length} reviews`);

    console.log('Database seeded successfully!');
    console.log('You can now access:');
    console.log('- Student app: http://localhost:5000/frontend/index.html');
    console.log('- Admin dashboard: http://localhost:5000/frontend/admin.html');
    console.log('- Admin login: admin/admin123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();