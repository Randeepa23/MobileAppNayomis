require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const DeliveryBox = require('../models/DeliveryBox');
const { DEVICE_ID_PATTERN, hashDeviceToken } = require('../middleware/sensorAuth');

const provision = async () => {
  const deviceId = process.env.DEVICE_ID;
  const deviceToken = process.env.DEVICE_TOKEN;
  if (!deviceId || !DEVICE_ID_PATTERN.test(deviceId)) throw new Error('Set DEVICE_ID to a valid existing box ID.');
  if (typeof deviceToken !== 'string' || deviceToken.length < 32) throw new Error('Set DEVICE_TOKEN to a unique token of at least 32 characters.');

  await connectDB();
  const device = await DeliveryBox.findOne({ boxId: deviceId }).select('+deviceTokenHash');
  if (!device) throw new Error(`Delivery box ${deviceId} does not exist. Register it before provisioning sensor access.`);
  device.deviceTokenHash = hashDeviceToken(deviceToken);
  await device.save();
  console.log(`Sensor credentials provisioned for ${deviceId}. The token was not printed or stored in plain text.`);
  await mongoose.disconnect();
};

provision().catch(async (error) => {
  console.error(error.message || 'Sensor device provisioning failed.');
  await mongoose.disconnect();
  process.exitCode = 1;
});
