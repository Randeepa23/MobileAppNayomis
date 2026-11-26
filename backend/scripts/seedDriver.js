require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Driver = require('../models/Driver');
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

    // 1. Clean up: Remove any legacy driver from students collection so students contains ONLY students
    const removedStudents = await Student.deleteMany({
      $or: [{ email: driverEmail }, { role: 'driver' }]
    });
    console.log(`Cleaned up ${removedStudents.deletedCount} driver records from students collection.`);

    // 2. Insert or update in dedicated Driver collection
    let driver = await Driver.findOne({ email: driverEmail });
    if (!driver) {
      driver = await Driver.create({
        name: 'Sunimal Perera',
        email: driverEmail,
        password: hashedPassword,
        role: 'driver',
        phone: '+94 77 123 4567',
        whatsapp: '+94 77 123 4567',
        licenseNumber: 'B-8492011',
        vehicleModel: "Nayomi's Waterfront Delivery Van #1",
        vehicleNumber: 'WP NB-4521',
        assignedBox: 'BOX-001',
        assignedRoute: 'Ave Maria Convent & Negombo Distribution Route',
        dispatchHub: "Nayomi's Waterfront Kitchen Dispatch, Negombo",
        dutyStatus: 'available',
        accountStatus: 'active',
      });
      console.log('Created dedicated driver in Driver collection:', driver.name, driver.email, driver._id);
    } else {
      driver.name = 'Sunimal Perera';
      driver.password = hashedPassword;
      driver.role = 'driver';
      driver.phone = '+94 77 123 4567';
      driver.whatsapp = '+94 77 123 4567';
      driver.licenseNumber = 'B-8492011';
      driver.vehicleModel = "Nayomi's Waterfront Delivery Van #1";
      driver.vehicleNumber = 'WP NB-4521';
      driver.assignedBox = 'BOX-001';
      driver.assignedRoute = 'Ave Maria Convent & Negombo Distribution Route';
      driver.dispatchHub = "Nayomi's Waterfront Kitchen Dispatch, Negombo";
      driver.dutyStatus = 'available';
      driver.accountStatus = 'active';
      await driver.save();
      console.log('Updated dedicated driver in Driver collection:', driver.name, driver.email, driver._id);
    }

    // 3. Link driver to BOX-001
    const boxUpdate = await DeliveryBox.updateOne(
      { boxId: 'BOX-001' },
      { $set: { driver: driver._id, status: 'assigned' } },
      { upsert: false }
    );
    console.log('BOX-001 linked to driver:', boxUpdate.modifiedCount ? 'Updated' : 'Already set');

    // 4. Link driver to active orders assigned to BOX-001
    const orderUpdate = await Order.updateMany(
      { 'delivery.boxId': 'BOX-001', status: { $in: ['confirmed', 'preparing', 'ready', 'dispatched'] } },
      {
        $set: {
          'delivery.driver': driver._id,
          'delivery.driverName': driver.name,
          'delivery.driverPhone': driver.phone,
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
