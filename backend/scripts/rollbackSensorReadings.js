require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const DeliveryBox = require('../models/DeliveryBox');
const SensorReading = require('../models/SensorReading');

const rollback = async () => {
  if (process.env.CONFIRM_SENSOR_ROLLBACK !== 'DROP_SENSOR_READINGS') {
    throw new Error('Set CONFIRM_SENSOR_ROLLBACK=DROP_SENSOR_READINGS to confirm this destructive rollback.');
  }

  await connectDB();
  const collectionExists = await mongoose.connection.db
    .listCollections({ name: SensorReading.collection.name })
    .hasNext();
  if (collectionExists) await mongoose.connection.db.dropCollection(SensorReading.collection.name);
  await DeliveryBox.updateMany({}, { $unset: { deviceTokenHash: '' } });
  const deliveryBoxIndexes = await DeliveryBox.collection.indexes();
  if (deliveryBoxIndexes.some((index) => index.name === 'deviceTokenHash_1')) {
    await DeliveryBox.collection.dropIndex('deviceTokenHash_1');
  }
  console.log('Sensor readings were dropped and sensor device credentials were removed.');
  await mongoose.disconnect();
};

rollback().catch(async (error) => {
  console.error(error.message || 'Sensor reading rollback failed.');
  await mongoose.disconnect();
  process.exitCode = 1;
});
