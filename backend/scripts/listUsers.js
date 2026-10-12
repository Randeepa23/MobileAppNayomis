const mongoose = require('mongoose');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayomis-food-app';

async function listUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', MONGODB_URI);
    console.log('\n');

    const users = await Student.find({}).select('name email role createdAt');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers();
