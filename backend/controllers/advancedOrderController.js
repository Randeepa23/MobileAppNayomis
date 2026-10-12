const Order = require('../models/Order');
const Student = require('../models/Student');
const FoodItem = require('../models/FoodItem');
const PickupPoint = require('../models/PickupPoint');
const EventLog = require('../models/EventLog');

// Import services
const orderValidationService = require('../services/orderValidationService');
const nutritionalAnalysisService = require('../services/nutritionalAnalysisService');
const walletService = require('../services/walletService');
const orderAggregationService = require('../services/orderAggregationService');
const exceptionHandlingService = require('../services/exceptionHandlingService');
const checkoutValidationService = require('../services/checkoutValidationService');

/**
 * INTELLIGENT CHECKOUT ORDER PLACEMENT
 * Post-selection processing pipeline with pickup point integration
 */
const placeAdvancedOrder = async (req, res) => {
  try {
    const {
      studentId,
      items,
      deliveryDate,
      pickupPointId,
      timeSlot,
      specialInstructions,
      paymentMethod
    } = req.body;

    console.log('📋 Step 1: Checkout Initiation');
    
    // Get student details
    const student = await Student.findById(studentId);
    if (!student || student.accountStatus !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Student account not found or inactive'
      });
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const foodId = item.foodId || item.foodItem;
      const food = await FoodItem.findById(foodId);
      
      if (!food) {
        return res.status(404).json({
          success: false,
          message: `Food item not found: ${foodId}`
        });
      }

      total += food.price * item.quantity;
      orderItems.push({
        foodItem: foodId,
        quantity: item.quantity
      });
    }

    console.log('✅ Step 2: Checkout Validation (Cut-off, Capacity, Payment)');
    
    // CHECKOUT VALIDATION SERVICE - Post-selection constraints
    const checkoutValidation = await checkoutValidationService.validateCheckout(studentId, {
      items: orderItems,
      pickupPointId,
      deliveryDate,
      timeSlot,
      total,
      paymentMethod
    });

    if (!checkoutValidation.passed) {
      return res.status(400).json({
        success: false,
        message: 'Checkout validation failed',
        errors: checkoutValidation.errors,
        warnings: checkoutValidation.warnings,
        checks: checkoutValidation.checks
      });
    }

    console.log('🔍 Step 3: Order & Nutritional Validation');
    
    // STANDARD ORDER VALIDATION - Menu, dietary, allergens, age
    const validation = await orderValidationService.validateOrder(
      studentId,
      { items: orderItems },
      deliveryDate
    );

    if (!validation.passed) {
      return res.status(400).json({
        success: false,
        message: 'Order validation failed',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }
    
    // NUTRITIONAL ANALYSIS
    const nutritionalInfo = await nutritionalAnalysisService.analyzeMeal(
      orderItems,
      student.ageGroup
    );

    console.log('💳 Step 4: Payment Method Confirmed');
    
    // Get pickup point details
    const pickupPoint = await PickupPoint.findById(pickupPointId);
    if (!pickupPoint) {
      return res.status(404).json({
        success: false,
        message: 'Pickup point not found'
      });
    }

    // Create order first (with pending payment)
    const order = new Order({
      student: studentId,
      items: orderItems,
      total: total,
      deliveryDate: deliveryDate,
      pickupLocation: pickupPoint.name,
      pickupTime: timeSlot || pickupPoint.deliverySchedule.standardDeliveryTime,
      specialInstructions: specialInstructions || '',
      status: 'pending',
      
      // Validation results
      validation: {
        passed: validation.passed,
        checks: validation.checks,
        validatedAt: new Date(),
        validatedBy: 'system'
      },
      
      // Nutritional analysis results
      nutritionalInfo: nutritionalInfo,
      
      // Payment info (pending)
      payment: {
        method: paymentMethod,
        amount: total,
        status: 'pending'
      }
    });

    await order.save();

    console.log('📍 Step 5: Reserve Pickup Point Slot');
    
    // Reserve slot at pickup point
    try {
      await pickupPoint.reserveSlot(timeSlot || pickupPoint.deliverySchedule.standardDeliveryTime);
    } catch (slotError) {
      // Rollback order if slot reservation fails
      order.status = 'cancelled';
      order.cancellationReason = 'Pickup slot unavailable';
      await order.save();
      
      return res.status(400).json({
        success: false,
        message: slotError.message
      });
    }

    console.log('💳 Step 6: Payment Processing');
    
    let loyaltyPointsDeducted = 0;

    // Cash and online payments remain pending. Loyalty points are deducted immediately.
    try {
      if (paymentMethod === 'loyalty_points') {
        const requiredPoints = Math.ceil(total * 100);
        const updatedStudent = await Student.findOneAndUpdate(
          { _id: studentId, points: { $gte: requiredPoints } },
          { $inc: { points: -requiredPoints } },
          { new: true }
        );

        if (!updatedStudent) {
          throw new Error('Insufficient loyalty points');
        }

        loyaltyPointsDeducted = requiredPoints;
        order.pointsUsed = requiredPoints;
        order.payment.status = 'completed';
        order.payment.paidAt = new Date();
      }

      order.status = 'confirmed';
      
      // Store pickup point reference
      order.pickupPointId = pickupPointId;
      order.school = pickupPoint.school.name;

      await order.save();

    } catch (paymentError) {
      if (loyaltyPointsDeducted > 0) {
        await Student.findByIdAndUpdate(
          studentId,
          { $inc: { points: loyaltyPointsDeducted } }
        );
      }

      // Payment failed, release slot and cancel order
      await pickupPoint.releaseSlot(timeSlot || pickupPoint.deliverySchedule.standardDeliveryTime);
      order.status = 'cancelled';
      order.cancellationReason = 'Payment failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        error: paymentError.message
      });
    }

    console.log('🎯 Step 7: Smart Order Aggregation');
    
    // AGGREGATION SERVICE - Add to school's daily schedule
    try {
      await orderAggregationService.aggregateOrders(
        order.deliveryDate,
        pickupPoint.school.name
      );
    } catch (aggError) {
      console.error('Aggregation warning:', aggError.message);
      // Don't fail the order if aggregation fails
    }

    console.log('🏆 Step 8: Loyalty Points Award');
    
    // Award loyalty points
    const pointsEarned = paymentMethod === 'loyalty_points' ? 0 : Math.floor(total);
    if (pointsEarned > 0) {
      await Student.findByIdAndUpdate(
        studentId,
        { $inc: { points: pointsEarned } }
      );
    }

    order.pointsEarned = pointsEarned;
    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.foodItem', 'name price category')
      .populate('student', 'name email school');

    console.log('✅ Order placement complete!');

    // Return comprehensive response
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder,
      processing: {
        validation: {
          passed: validation.passed,
          warnings: validation.warnings
        },
        nutrition: {
          calories: nutritionalInfo.totalCalories,
          isBalanced: nutritionalInfo.isBalanced,
          warnings: nutritionalInfo.warnings,
          recommendations: nutritionalInfo.recommendations
        },
        payment: {
          method: paymentMethod,
          amount: total,
          status: populatedOrder.payment.status,
          pointsUsed: populatedOrder.pointsUsed,
          pointsEarned: pointsEarned
        }
      }
    });

  } catch (error) {
    console.error('❌ Order placement error:', error);
    
    // Log system error
    await EventLog.create({
      eventType: 'system_error',
      severity: 'error',
      entityType: 'order',
      entityId: req.body.studentId,
      message: `Order placement failed: ${error.message}`,
      details: { error: error.stack }
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
};

/**
 * Get student orders with full details
 */
const getStudentOrders = async (req, res) => {
  try {
    const { studentId } = req.params;

    const orders = await Order.find({ student: studentId })
      .populate('items.foodItem', 'name price category')
      .populate('student', 'name email school')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { orders }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Cancel order (with refund if applicable)
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { studentId, reason } = req.body;

    const result = await exceptionHandlingService.handleOrderCancellation(
      orderId,
      studentId,
      reason || 'Requested by student'
    );

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update order status (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'validated', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    ).populate('items.foodItem').populate('student');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.json({
      success: true,
      data: order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get wallet balance and transaction history
 */
const getWalletInfo = async (req, res) => {
  try {
    const { studentId } = req.params;

    const summary = await walletService.getWalletSummary(studentId);
    const transactions = await walletService.getTransactionHistory(studentId, 20);

    return res.json({
      success: true,
      data: {
        summary,
        transactions
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Top up wallet
 */
const topUpWallet = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const result = await walletService.topUpWallet(
      studentId,
      amount,
      description || 'Wallet top-up'
    );

    return res.json(result);

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get preparation summary for admin/restaurant
 */
const getPreparationSummary = async (req, res) => {
  try {
    const { date, school } = req.query;

    const summary = await orderAggregationService.getPreparationSummary(
      new Date(date),
      school
    );

    return res.json(summary);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get unresolved exceptions (Admin)
 */
const getUnresolvedExceptions = async (req, res) => {
  try {
    const result = await exceptionHandlingService.getUnresolvedExceptions();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Validate checkout before payment
 */
const validateCheckout = async (req, res) => {
  try {
    const { studentId, pickupPointId, deliveryDate, timeSlot, items, total, paymentMethod } = req.body;
    
    const validation = await checkoutValidationService.validateCheckout(studentId, {
      items,
      pickupPointId,
      deliveryDate,
      timeSlot,
      total,
      paymentMethod
    });
    
    return res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get available pickup points for student's school
 */
const getPickupPointsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { deliveryDate } = req.query;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const pickupPoints = await checkoutValidationService.getAvailablePickupPoints(
      student.school || 'Default School',
      deliveryDate || new Date()
    );
    
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
};

module.exports = {
  placeAdvancedOrder,
  getStudentOrders,
  cancelOrder,
  updateOrderStatus,
  getWalletInfo,
  topUpWallet,
  getPreparationSummary,
  getUnresolvedExceptions,
  validateCheckout,
  getPickupPointsForStudent
};
