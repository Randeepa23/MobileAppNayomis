require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const DeliveryBox = require('../models/DeliveryBox');
const SensorReading = require('../models/SensorReading');

const migrate = async () => {
  await connectDB();
  try {
    await SensorReading.createCollection();
  } catch (error) {
    if (error.codeName !== 'NamespaceExists' && error.code !== 48) throw error;
  }
  await SensorReading.syncIndexes();
  await DeliveryBox.collection.createIndex(
    { deviceTokenHash: 1 },
    { unique: true, sparse: true, name: 'deviceTokenHash_1' },
  );
  console.log('Sensor reading collection and indexes are ready.');
  await mongoose.disconnect();
};

migrate().catch(async () => {
  console.error('Sensor reading migration failed.');
  await mongoose.disconnect();
  process.exitCode = 1;
});
