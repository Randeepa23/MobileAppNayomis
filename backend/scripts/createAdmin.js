const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayomis-food-app';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@nayomis.com';
    const adminPassword = 'admin123'; // Change this to a secure password
    const adminName = 'System Administrator';

    // Check if admin already exists
    let admin = await Student.findOne({ email: adminEmail });

    if (admin) {
      console.log('ℹ️  Admin user already exists. Updating role...');
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin role updated successfully');
    } else {
      console.log('📝 Creating new admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      admin = new Student({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        points: 0
      });

      await admin.save();
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role:', admin.role);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
