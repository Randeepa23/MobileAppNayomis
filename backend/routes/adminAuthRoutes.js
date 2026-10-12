const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Admin login endpoint - validates against environment variables
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPasswordHash) {
      return res.status(500).json({ message: 'Admin credentials not configured' });
    }

    // Check if email matches
    if (email !== adminEmail) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate admin token
    const token = jwt.sign(
      { 
        email: adminEmail,
        type: 'admin',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        email: adminEmail,
        type: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Verify admin token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Not an admin token' });
    }

    res.json({
      valid: true,
      admin: {
        email: decoded.email,
        type: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
