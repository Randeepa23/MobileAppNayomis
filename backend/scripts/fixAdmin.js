const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const MONGODB_URI = 'mongodb://localhost:27017/nayomis-food-app';

async function fixAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete old admin if exists
    await Student.deleteMany({ email: 'admin@nayomis.com' });
    console.log('🗑️ Deleted old admin accounts');

    // Create fresh admin account
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Student({
      name: 'Admin',
      email: 'admin@nayomis.com',
      password: hashedPassword,
      role: 'admin',
      points: 0
    });

    await admin.save();
    console.log('✅ Created fresh admin account');
    console.log('\n📋 Admin Details:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Password: admin123');

    await mongoose.connection.close();
    console.log('\n✅ Done - restart backend server now');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdmin();
