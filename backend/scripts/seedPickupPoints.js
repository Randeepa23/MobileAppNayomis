require('dotenv').config();
const mongoose = require('mongoose');
const PickupPoint = require('../models/PickupPoint');

const schoolLocations = [
  { code: 'MSC-NEG', name: 'Maris Stella College, Negombo' },
  { code: 'LOY-NEG', name: 'Loyola College, Negombo' },
  { code: 'AMC-NEG', name: 'Ave Maria Convent, Negombo' },
  { code: 'SUS-NEG', name: 'Sussex College, Negombo' },
  { code: 'GATE-NEG', name: 'Gateway College, Negombo' },
  { code: 'SJC-NEG', name: "St. Joseph's College, Negombo Branch" }
];

const createPickupPoint = ({ code, name }) => ({
  name,
  code,
  school: {
    name,
    address: `${name}, Sri Lanka`
  },
  location: {
    address: `Main entrance, ${name}`,
    landmarks: 'School main entrance'
  },
  capacity: {
    dailyLimit: 150,
    currentOrders: 0
  },
  timeSlots: [
    { slot: '07:00-07:30', capacity: 50, currentBookings: 0 },
    { slot: '07:30-08:00', capacity: 50, currentBookings: 0 },
    { slot: '08:00-08:30', capacity: 50, currentBookings: 0 }
  ],
  deliverySchedule: {
    standardDeliveryTime: '07:30 AM',
    cutoffTime: '20:00',
    daysInAdvance: 1
  },
  status: 'active',
  operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  specialInstructions: 'Collect orders from the school main entrance.',
  deliveryNotes: 'Deliver to the designated school pickup point.'
});

async function seedPickupPoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodapp');
    console.log('MongoDB Connected');

    let createdCount = 0;

    for (const location of schoolLocations) {
      const existingPoint = await PickupPoint.findOne({ code: location.code });
      if (existingPoint) {
        console.log(`Already exists: ${existingPoint.name} (${existingPoint.code})`);
        continue;
      }

      const pickupPoint = await PickupPoint.create(createPickupPoint(location));
      createdCount += 1;
      console.log(`Created: ${pickupPoint.name} (${pickupPoint.code})`);
    }

    console.log(`Pickup point setup complete. Added ${createdCount} location(s).`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding pickup points:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedPickupPoints();
