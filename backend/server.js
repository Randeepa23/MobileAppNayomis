const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

const studentRoutes = require('./routes/studentRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const advancedOrderRoutes = require('./routes/advancedOrderRoutes');
const pickupPointRoutes = require('./routes/pickupPointRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const deviceSensorRoutes = require('./routes/deviceSensorRoutes');
const preOrderSensorRoutes = require('./routes/preOrderSensorRoutes');
const customerOrderRoutes = require('./routes/customerOrderRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.json({ message: 'Food App API' });
});

app.use('/api/students', studentRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/advanced-orders', advancedOrderRoutes);
app.use('/api/pickup-points', pickupPointRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/device', deviceSensorRoutes);
app.use('/api/pre-orders', preOrderSensorRoutes);
app.use('/api/customer', customerOrderRoutes);

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/frontend/index.html');
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
