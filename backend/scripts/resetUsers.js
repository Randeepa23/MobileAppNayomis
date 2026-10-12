const mongoose = require('mongoose');
require('../config/db');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

const resetAndCreateTestUsers = async () => {
  try {
    console.log('Clearing existing students...');
    await Student.deleteMany({});
    
    console.log('Creating test users with hashed passwords...');
    
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        points: 150
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        points: 75
      },
      {
        name: 'Test User',
        email: 'test@test.com',
        password: 'test123',
        points: 0
      }
    ];

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const student = new Student({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        points: userData.points
      });
      
      await student.save();
      console.log(`Created user: ${userData.name} (${userData.email}) - Password: ${userData.password}`);
    }

    console.log('\n✅ Test users created successfully!');
    console.log('You can now login with:');
    console.log('- john@example.com / password123');
    console.log('- jane@example.com / password123');
    console.log('- test@test.com / test123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetAndCreateTestUsers();