const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayomis-food-app';

async function verifyAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await Student.findOne({ email: 'admin@nayomis.com' });

    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    console.log('\n📋 Admin User in Database:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Password hash:', admin.password);

    // Test password
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    console.log('\n🔐 Password Test:');
    console.log('Testing password:', testPassword);
    console.log('Password matches:', isMatch ? '✅ YES' : '❌ NO');

    if (!isMatch) {
      console.log('\n🔧 Resetting password to admin123...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Password reset complete');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyAdmin();
