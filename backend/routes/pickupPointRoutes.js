const express = require('express');
const router = express.Router();
const PickupPoint = require('../models/PickupPoint');
const checkoutValidationService = require('../services/checkoutValidationService');

/**
 * GET all active pickup points
 */
router.get('/', async (req, res) => {
  try {
    const pickupPoints = await PickupPoint.find({ status: 'active' })
      .select('-__v')
      .sort({ 'school.name': 1, name: 1 });
    
    return res.json({
      success: true,
      data: { pickupPoints }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET pickup points by school
 */
router.get('/school/:schoolName', async (req, res) => {
  try {
    const { schoolName } = req.params;
    const { deliveryDate } = req.query;
    
    let pickupPoints;
    
    if (deliveryDate) {
      pickupPoints = await checkoutValidationService.getAvailablePickupPoints(
        schoolName,
        deliveryDate
      );
    } else {
      pickupPoints = await PickupPoint.find({
        'school.name': schoolName,
        status: 'active'
      });
    }
    
    return res.json({
      success: true,
      data: { pickupPoints }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET single pickup point details
 */
router.get('/:id', async (req, res) => {
  try {
    const pickupPoint = await PickupPoint.findById(req.params.id);
    
    if (!pickupPoint) {
      return res.status(404).json({
        success: false,
        message: 'Pickup point not found'
      });
    }
    
    return res.json({
      success: true,
      data: { pickupPoint }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET available time slots for a pickup point
 */
router.get('/:id/timeslots', async (req, res) => {
  try {
    const pickupPoint = await PickupPoint.findById(req.params.id);
    
    if (!pickupPoint) {
      return res.status(404).json({
        success: false,
        message: 'Pickup point not found'
      });
    }
    
    const availableSlots = pickupPoint.getAvailableTimeSlots();
    
    return res.json({
      success: true,
      data: { 
        timeSlots: availableSlots,
        standardDeliveryTime: pickupPoint.deliverySchedule.standardDeliveryTime
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET minimum delivery date for pickup point
 */
router.get('/:id/min-delivery-date', async (req, res) => {
  try {
    const minDate = await checkoutValidationService.getMinimumDeliveryDate(req.params.id);
    
    return res.json({
      success: true,
      data: { minDate }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST - Create new pickup point (Admin only)
 */
router.post('/', async (req, res) => {
  try {
    const pickupPoint = new PickupPoint(req.body);
    await pickupPoint.save();
    
    return res.status(201).json({
      success: true,
      data: { pickupPoint }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT - Update pickup point (Admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const pickupPoint = await PickupPoint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!pickupPoint) {
      return res.status(404).json({
        success: false,
        message: 'Pickup point not found'
      });
    }
    
    return res.json({
      success: true,
      data: { pickupPoint }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
