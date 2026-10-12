const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayomis-food-app';

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@nayomis.com';
    const newPassword = 'admin123';

    const admin = await Student.findOne({ email: adminEmail });

    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and role
    admin.password = hashedPassword;
    admin.role = 'admin';
    await admin.save();

    console.log('✅ Admin password reset successfully');
    console.log('\n📋 Admin Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', newPassword);
    console.log('Role:', admin.role);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
