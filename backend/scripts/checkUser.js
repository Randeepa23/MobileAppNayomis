const mongoose = require('mongoose');
require('../config/db');
const Student = require('../models/Student');

const checkUser = async () => {
  try {
    console.log('Checking John Doe user data...');
    
    const john = await Student.findOne({ email: 'john@example.com' });
    if (john) {
      console.log('Found John Doe:');
      console.log('Name:', john.name);
      console.log('Email:', john.email);
      console.log('Loyalty Points:', john.loyaltyPoints);
      console.log('Created:', john.createdAt);
    } else {
      console.log('John Doe not found in database');
    }

    // Also check all students
    const allStudents = await Student.find({});
    console.log('\nAll students in database:');
    allStudents.forEach(student => {
      console.log(`- ${student.name} (${student.email}): ${student.loyaltyPoints} points`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUser();