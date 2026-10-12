const mongoose = require('mongoose');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayomis-food-app';

async function promoteToAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get email from command line argument
    const email = process.argv[2];

    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node promoteToAdmin.js user@example.com');
      process.exit(1);
    }

    // Find user by email
    const user = await Student.findOne({ email });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User promoted to admin successfully');
    console.log('\n📋 User Details:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

promoteToAdmin();
