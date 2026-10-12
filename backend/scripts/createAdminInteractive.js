#!/usr/bin/env node

/**
 * Interactive Admin Account Creation Script
 * Run: node scripts/createAdminInteractive.js
 */

const readline = require('readline');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminInteractive() {
  try {
    console.log('\n🔧 Admin Account Creation Wizard\n');
    console.log('=================================\n');

    // Connect to MongoDB
    const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayomis_waterfront';
    await mongoose.connect(dbURI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmins = await Admin.find({});
    if (existingAdmins.length > 0) {
      console.log('⚠️  Existing admin accounts found:');
      existingAdmins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email || admin.username}`);
      });
      console.log();
      
      const proceed = await question('Do you want to create another admin? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('\n❌ Admin creation cancelled.\n');
        rl.close();
        process.exit(0);
      }
    }

    // Get admin details
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 8 characters): ');
    const confirmPassword = await question('Confirm password: ');

    // Validate inputs
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      throw new Error('An admin with this email or username already exists');
    }

    // Create admin
    const newAdmin = new Admin({
      username,
      email,
      password, // In production, this should be hashed
      role: 'admin',
      createdAt: new Date()
    });

    await newAdmin.save();

    console.log('\n✅ Admin account created successfully!\n');
    console.log('Admin Details:');
    console.log('==============');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);
    console.log('\n🔐 Login URL: http://localhost:5173/admin/login\n');
    console.log('⚠️  IMPORTANT: Keep your credentials secure!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
createAdminInteractive();
