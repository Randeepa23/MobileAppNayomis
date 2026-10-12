#!/usr/bin/env node

/**
 * Quick Admin Access Script
 * This script provides admin login credentials and dashboard access information
 * Run: node scripts/adminAccess.js
 */

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function showAdminAccess() {
  try {
    console.log('\n🔐 Admin Dashboard Access Information\n');
    console.log('=====================================\n');

    // Connect to MongoDB
    const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayomis_waterfront';
    await mongoose.connect(dbURI);

    // Find all admins
    const admins = await Admin.find({}).select('-password');

    if (admins.length === 0) {
      console.log('❌ No admin accounts found in the database.\n');
      console.log('📝 To create an admin account, run:');
      console.log('   node scripts/createAdminInteractive.js\n');
      console.log('Or:');
      console.log('   node scripts/createAdmin.js\n');
    } else {
      console.log(`✅ Found ${admins.length} admin account(s):\n`);
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin Account`);
        console.log(`   Username: ${admin.username || 'N/A'}`);
        console.log(`   Email: ${admin.email || 'N/A'}`);
        console.log(`   Role: ${admin.role || 'admin'}`);
        console.log(`   Created: ${admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log();
      });

      console.log('🌐 Access Information:');
      console.log('=====================\n');
      console.log('Login URL (Development):');
      console.log('   http://localhost:5173/admin/login\n');
      console.log('Dashboard URL:');
      console.log('   http://localhost:5173/admin/dashboard\n');
      
      console.log('📋 Steps to Access:');
      console.log('==================\n');
      console.log('1. Make sure your backend server is running:');
      console.log('   cd backend && npm start\n');
      console.log('2. Make sure your frontend is running:');
      console.log('   npm run dev\n');
      console.log('3. Navigate to: http://localhost:5173/admin/login\n');
      console.log('4. Enter your admin email and password\n');
      console.log('5. Click "Sign In"\n');
      
      console.log('🔑 Password Reset:');
      console.log('=================\n');
      console.log('If you forgot your password, run:');
      console.log('   node scripts/resetAdminPassword.js\n');
    }

    console.log('📚 For detailed admin dashboard guide:');
    console.log('   See ADMIN_DASHBOARD_GUIDE.md\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
showAdminAccess();
