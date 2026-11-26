require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const DeliveryBox = require('../models/DeliveryBox');
const Order = require('../models/Order');

async function seedDriver() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set in backend/.env');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for driver seeding.');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const driverEmail = 'driver@nayomis.com';

    let driver = await Student.findOne({ email: driverEmail });
    if (!driver) {
      driver = await Student.create({
        name: 'Sunimal Perera',
        email: driverEmail,
        password: hashedPassword,
        role: 'driver',
        school: 'Ave Maria Convent & Negombo Distribution Route',
        grade: 'Assigned Unit: BOX-001',
        whatsapp: '+94 77 123 4567',
        address: "Nayomi's Waterfront Kitchen Dispatch, Negombo",
        accountStatus: 'active',
      });
      console.log('Created driver account:', driver.name, driver.email);
    } else {
      driver.name = 'Sunimal Perera';
      driver.password = hashedPassword;
      driver.role = 'driver';
      driver.school = 'Ave Maria Convent & Negombo Distribution Route';
      driver.grade = 'Assigned Unit: BOX-001';
      driver.whatsapp = '+94 77 123 4567';
      driver.address = "Nayomi's Waterfront Kitchen Dispatch, Negombo";
      driver.accountStatus = 'active';
      await driver.save();
      console.log('Updated driver account:', driver.name, driver.email);
    }

    // Link driver to BOX-001
    const boxUpdate = await DeliveryBox.updateOne(
      { boxId: 'BOX-001' },
      { $set: { driver: driver._id, status: 'assigned' } },
      { upsert: false }
    );
    console.log('BOX-001 linked to driver:', boxUpdate.modifiedCount ? 'Updated' : 'Already set');

    // Link driver to active orders assigned to BOX-001
    const orderUpdate = await Order.updateMany(
      { 'delivery.boxId': 'BOX-001', status: { $in: ['confirmed', 'preparing', 'ready', 'dispatched'] } },
      {
        $set: {
          'delivery.driver': driver._id,
          'delivery.driverName': driver.name,
          'delivery.driverPhone': driver.whatsapp,
        },
      }
    );
    console.log(`Updated ${orderUpdate.modifiedCount} active orders with driver details.`);

    console.log('Driver seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding driver:', err);
    process.exit(1);
  }
}

seedDriver();
