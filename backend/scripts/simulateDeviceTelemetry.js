/**
 * ESP32 Telemetry Simulation Script
 * Simulates an ESP32 Smart Food Delivery Box sending sensor data to the backend.
 *
 * Usage:
 *   node scripts/simulateDeviceTelemetry.js [options]
 *
 * Options:
 *   --boxId=BOX-001       Box ID to simulate (default: BOX-001)
 *   --temp=64.2           Temperature in °C (default: 64.2)
 *   --humidity=52.0       Humidity in % (default: 52.0)
 *   --gas=290             Gas ADC value (default: 290)
 *   --open=false          Lid open status (true/false, default: false)
 *   --count=5             Number of readings to send (default: 5)
 *   --interval=2000       Interval in ms between readings (default: 2000)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const DeliveryBox = require('../models/DeliveryBox');
const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');
const Order = require('../models/Order');
const Student = require('../models/Student');

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.replace(/^--/, '').split('=');
  acc[k] = v;
  return acc;
}, {});

const boxId = args.boxId || 'BOX-001';
const targetTemp = parseFloat(args.temp || '64.2');
const targetHum = parseFloat(args.humidity || '52.0');
const targetGas = parseInt(args.gas || '290', 10);
const targetLidOpen = args.open === 'true';
const count = parseInt(args.count || '5', 10);
const intervalMs = parseInt(args.interval || '2000', 10);

async function runSimulation() {
  console.log('Connecting to database...');
  await connectDB();

  // 1. Locate or create the delivery box
  let box = await DeliveryBox.findOne({ boxId });
  if (!box) {
    console.log(`Box ${boxId} not found. Creating test box...`);
    box = new DeliveryBox({
      boxId,
      status: 'in-transit',
      batteryLevel: 94,
      temperature: { min: 60, max: 80, current: targetTemp, lastUpdated: new Date() },
      gasThreshold: { max: 800 },
      location: {
        type: 'Point',
        coordinates: [79.8612, 6.9271],
        address: 'School Route Transit - Colombo',
        lastUpdated: new Date()
      }
    });
    await box.save();
    console.log(`Created delivery box ${boxId}.`);
  }

  // 2. Locate or create an active breakfast order for the box
  let activeOrder = null;
  if (args.orderId) {
    activeOrder = await Order.findById(args.orderId);
  }
  if (!activeOrder && box.orderId) {
    activeOrder = await Order.findById(box.orderId);
  }
  if (!activeOrder) {
    activeOrder = await Order.findOne({ 'delivery.boxId': box.boxId });
  }
  if (!activeOrder) {
    activeOrder = await Order.findOne({ status: { $nin: ['completed', 'cancelled', 'rejected'] } });
  }
  if (!activeOrder) {
    let student = await Student.findOne({ role: 'student' }) || await Student.findOne();
    if (!student) {
      student = await Student.create({
        name: 'Demo Student',
        email: 'demostudent@nayomis.test',
        password: 'hasheddemo123Password',
        role: 'student',
        school: 'St. Peter College',
        grade: '10'
      });
    }

    activeOrder = await Order.create({
      student: student._id,
      items: [],
      total: 850,
      status: 'dispatched',
      pickupLocation: 'School Canteen Hall A',
      pickupTime: '07:45 AM',
      deliveryDate: new Date(),
      delivery: {
        boxId: box.boxId,
        assignedAt: new Date(),
        dispatchedAt: new Date()
      }
    });
    console.log(`Created demonstration order #${activeOrder._id} assigned to ${box.boxId}.`);
  }

  // Ensure box and order are synced
  box.orderId = activeOrder._id;
  box.status = 'in-transit';
  if (!activeOrder.delivery) activeOrder.delivery = {};
  activeOrder.delivery.boxId = box.boxId;
  activeOrder.status = 'dispatched';
  await activeOrder.save();
  await box.save();

  console.log(`\n======================================================`);
  console.log(` Simulating ESP32 Telemetry for Box: ${boxId}`);
  console.log(` Linked Order: ${activeOrder._id} (Status: ${activeOrder.status})`);
  console.log(` Total packets to transmit: ${count}`);
  console.log(` Target Temp: ${targetTemp}°C | Gas: ${targetGas} ADC | Lid Open: ${targetLidOpen}`);
  console.log(`======================================================\n`);

  let currentLat = 6.9271;
  let currentLng = 79.8612;
  const minTemp = (box.temperature && box.temperature.min) != null ? box.temperature.min : 60;
  const maxGas = (box.gasThreshold && box.gasThreshold.max) != null ? box.gasThreshold.max : 800;

  for (let i = 1; i <= count; i++) {
    const jitterTemp = Number((targetTemp + (Math.random() * 0.6 - 0.3)).toFixed(1));
    const jitterHum = Number((targetHum + (Math.random() * 1.0 - 0.5)).toFixed(1));
    const jitterGas = targetGas + Math.floor(Math.random() * 20 - 10);
    currentLat += (Math.random() * 0.0006 - 0.0003);
    currentLng += (Math.random() * 0.0006 - 0.0003);

    const reading = new SensorReading({
      smartBox: box._id,
      deviceId: box.boxId,
      order: activeOrder._id,
      temperatureC: jitterTemp,
      humidityPercent: jitterHum,
      gasRaw: jitterGas,
      gasAlert: jitterGas > maxGas,
      latitude: Number(currentLat.toFixed(6)),
      longitude: Number(currentLng.toFixed(6)),
      motionDetected: true,
      accelerationX: 0.02,
      accelerationY: 0.01,
      accelerationZ: 0.99,
      boxOpen: targetLidOpen,
      batteryPercent: 92,
      observationId: `${boxId}-SIM-${Date.now()}-${i}`,
      sequenceNumber: i,
      deviceRecordedAt: new Date(),
      receivedAt: new Date()
    });

    await reading.save();

    // Update box state
    box.lastReading = {
      temperatureC: jitterTemp,
      humidityPercent: jitterHum,
      gasRaw: jitterGas,
      boxOpen: targetLidOpen,
      batteryPercent: 92,
      latitude: Number(currentLat.toFixed(6)),
      longitude: Number(currentLng.toFixed(6)),
      receivedAt: new Date()
    };
    if (!box.temperature) box.temperature = {};
    box.temperature.current = jitterTemp;
    box.temperature.lastUpdated = new Date();
    box.batteryLevel = 92;
    box.location = {
      type: 'Point',
      coordinates: [Number(currentLng.toFixed(6)), Number(currentLat.toFixed(6))],
      address: 'Simulated Route in Transit',
      lastUpdated: new Date()
    };
    await box.save();

    // Also update order delivery log
    if (!activeOrder.delivery.temperatureLog) activeOrder.delivery.temperatureLog = [];
    activeOrder.delivery.temperatureLog.push({
      temperature: jitterTemp,
      timestamp: new Date(),
      withinRange: jitterTemp >= minTemp && jitterTemp <= 80
    });
    if (!activeOrder.delivery.locationLog) activeOrder.delivery.locationLog = [];
    activeOrder.delivery.locationLog.push({
      coordinates: [Number(currentLng.toFixed(6)), Number(currentLat.toFixed(6))],
      timestamp: new Date(),
      address: 'Simulated Route in Transit'
    });
    await activeOrder.save();

    // Check thresholds and trigger alerts if breach occurs
    if (jitterTemp < minTemp) {
      await Alert.create({
        boxId: box._id,
        orderId: activeOrder._id,
        type: 'temperature_breach',
        severity: 'critical',
        message: `Temperature dropped below safe minimum: ${jitterTemp}°C (Threshold: ${minTemp}°C)`,
        readingValue: jitterTemp,
        thresholdValue: minTemp,
        timestamp: new Date()
      });
      console.log(`  [ALERT] Temperature breach recorded: ${jitterTemp}°C`);
    }

    if (targetLidOpen) {
      await Alert.create({
        boxId: box._id,
        orderId: activeOrder._id,
        type: 'lid_tamper',
        severity: 'high',
        message: `Lid open tampering detected during school delivery transit.`,
        readingValue: 1,
        timestamp: new Date()
      });
      console.log(`  [ALERT] Lid tamper alert recorded.`);
    }

    console.log(`[Packet ${i}/${count}] Saved: Temp=${jitterTemp}°C | Hum=${jitterHum}% | Gas=${jitterGas} | Lat=${currentLat.toFixed(5)}, Lng=${currentLng.toFixed(5)}`);

    if (i < count) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.log('\nSimulation completed successfully.');
  await mongoose.disconnect();
}

runSimulation().catch(err => {
  console.error('Simulation error:', err);
  mongoose.disconnect();
  process.exit(1);
});
