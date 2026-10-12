const PickupPoint = require('../models/PickupPoint');
const Order = require('../models/Order');
const Student = require('../models/Student');
const EventLog = require('../models/EventLog');

/**
 * POST-SELECTION VALIDATION SERVICE
 * Validates orders during checkout phase, enforcing:
 * - Cut-off time constraints
 * - Pickup point capacity
 * - Delivery date restrictions
 * - Payment method availability
 */

const PAYMENT_METHODS = ['cash_on_delivery', 'online_payment', 'loyalty_points'];

class CheckoutValidationService {
  /**
   * Validate complete checkout request
   */
  async validateCheckout(studentId, checkoutData) {
    const { items, pickupPointId, deliveryDate, timeSlot, paymentMethod } = checkoutData;
    
    const validationResults = {
      passed: false,
      errors: [],
      warnings: [],
      checks: {
        cartNotEmpty: false,
        pickupPointSelected: false,
        pickupPointAvailable: false,
        deliveryDateValid: false,
        cutoffTimeRespected: false,
        timeSlotAvailable: false,
        paymentMethodSelected: false,
        paymentMethodAvailable: false
      },
      metadata: {}
    };

    try {
      // 1. Validate cart is not empty
      if (!items || items.length === 0) {
        validationResults.errors.push('Cart is empty');
      } else {
        validationResults.checks.cartNotEmpty = true;
      }

      // 2. Validate pickup point selected
      if (!pickupPointId) {
        validationResults.errors.push('Pickup point not selected');
      } else {
        validationResults.checks.pickupPointSelected = true;
        
        // 3. Validate pickup point exists and is available
        const pickupPoint = await PickupPoint.findById(pickupPointId);
        if (!pickupPoint) {
          validationResults.errors.push('Invalid pickup point');
        } else if (pickupPoint.status !== 'active') {
          validationResults.errors.push('Selected pickup point is currently unavailable');
        } else {
          validationResults.checks.pickupPointAvailable = true;
          validationResults.metadata.pickupPoint = {
            name: pickupPoint.name,
            school: pickupPoint.school.name,
            address: pickupPoint.location.address
          };

          // 4. Validate delivery date
          const deliveryDateObj = new Date(deliveryDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const minDate = new Date(today);
          minDate.setDate(minDate.getDate() + pickupPoint.deliverySchedule.daysInAdvance);
          
          if (deliveryDateObj < minDate) {
            validationResults.errors.push(
              `Orders must be placed at least ${pickupPoint.deliverySchedule.daysInAdvance} day(s) in advance`
            );
          } else if (!pickupPoint.isAvailableForDate(deliveryDateObj)) {
            validationResults.errors.push('Pickup point not operating on selected date');
          } else {
            validationResults.checks.deliveryDateValid = true;
          }

          // 5. Validate cut-off time
          const cutoffCheck = this.validateCutoffTime(deliveryDateObj, pickupPoint.deliverySchedule.cutoffTime);
          if (!cutoffCheck.valid) {
            validationResults.errors.push(cutoffCheck.message);
          } else {
            validationResults.checks.cutoffTimeRespected = true;
            if (cutoffCheck.warning) {
              validationResults.warnings.push(cutoffCheck.warning);
            }
          }

          // 6. Validate time slot availability
          if (timeSlot) {
            const slot = pickupPoint.timeSlots.find(s => s.slot === timeSlot);
            if (!slot) {
              validationResults.errors.push('Invalid time slot');
            } else if (slot.currentBookings >= slot.capacity) {
              validationResults.errors.push(`Time slot ${timeSlot} is fully booked`);
            } else {
              validationResults.checks.timeSlotAvailable = true;
            }
          }

          // 7. Check capacity
          if (pickupPoint.capacity.currentOrders >= pickupPoint.capacity.dailyLimit) {
            validationResults.errors.push('Pickup point has reached daily capacity');
          }
        }
      }

      // 8. Validate the selected payment method
      const student = await Student.findById(studentId);
      if (!student) {
        validationResults.errors.push('Student not found');
      } else if (!PAYMENT_METHODS.includes(paymentMethod)) {
        validationResults.errors.push('Please select a valid payment method');
      } else {
        validationResults.checks.paymentMethodSelected = true;
        validationResults.metadata.paymentMethod = paymentMethod;

        const total = checkoutData.total || 0;

        if (paymentMethod === 'loyalty_points') {
          const requiredPoints = Math.ceil(total * 100);
          const availablePoints = student.points || 0;

          validationResults.metadata.requiredLoyaltyPoints = requiredPoints;
          validationResults.metadata.availableLoyaltyPoints = availablePoints;

          if (availablePoints < requiredPoints) {
            validationResults.errors.push(
              `Insufficient loyalty points. Required: ${requiredPoints}, Available: ${availablePoints}`
            );
          } else {
            validationResults.checks.paymentMethodAvailable = true;
          }
        } else {
          validationResults.checks.paymentMethodAvailable = true;
        }
      }

      // Final determination
      validationResults.passed = validationResults.errors.length === 0;

      // Log validation event
      await EventLog.create({
        eventType: validationResults.passed ? 'order_validated' : 'order_rejected',
        severity: validationResults.passed ? 'info' : 'warning',
        entityType: 'order',
        entityId: studentId,
        message: validationResults.passed 
          ? 'Checkout validation passed'
          : `Checkout validation failed: ${validationResults.errors.join(', ')}`,
        details: {
          studentId,
          pickupPointId,
          deliveryDate,
          validationResults
        }
      });

      return validationResults;

    } catch (error) {
      console.error('Checkout validation error:', error);
      throw error;
    }
  }

  /**
   * Validate cut-off time constraint
   */
  validateCutoffTime(deliveryDate, cutoffTime) {
    const now = new Date();
    const deliveryDateObj = new Date(deliveryDate);
    deliveryDateObj.setHours(0, 0, 0, 0);
    
    // Calculate cut-off datetime (previous day at cutoffTime)
    const cutoffDate = new Date(deliveryDateObj);
    cutoffDate.setDate(cutoffDate.getDate() - 1);
    
    const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);
    cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);
    
    if (now > cutoffDate) {
      return {
        valid: false,
        message: `Order deadline passed. Orders for ${deliveryDateObj.toDateString()} must be placed before ${cutoffTime} on ${cutoffDate.toDateString()}`
      };
    }
    
    // Check if close to deadline (within 2 hours)
    const timeUntilCutoff = cutoffDate - now;
    const hoursUntilCutoff = timeUntilCutoff / (1000 * 60 * 60);
    
    if (hoursUntilCutoff < 2 && hoursUntilCutoff > 0) {
      return {
        valid: true,
        warning: `Order deadline is in ${Math.round(hoursUntilCutoff * 60)} minutes. Please complete checkout soon.`
      };
    }
    
    return { valid: true };
  }

  /**
   * Get available pickup points for a school
   */
  async getAvailablePickupPoints(schoolName, deliveryDate) {
    const deliveryDateObj = new Date(deliveryDate);
    const dayName = deliveryDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const pickupPoints = await PickupPoint.find({
      'school.name': schoolName,
      status: 'active',
      operatingDays: dayName
    });
    
    return pickupPoints.map(pp => ({
      id: pp._id,
      name: pp.name,
      code: pp.code,
      address: pp.location.address,
      availableSlots: pp.getAvailableTimeSlots(),
      capacity: {
        available: pp.capacity.dailyLimit - pp.capacity.currentOrders,
        total: pp.capacity.dailyLimit
      }
    }));
  }

  /**
   * Get minimum delivery date based on pickup point
   */
  async getMinimumDeliveryDate(pickupPointId) {
    const pickupPoint = await PickupPoint.findById(pickupPointId);
    if (!pickupPoint) throw new Error('Pickup point not found');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + pickupPoint.deliverySchedule.daysInAdvance);
    
    return minDate;
  }

  /**
   * Check if student has daily order limit reached
   */
  async checkDailyOrderLimit(studentId, deliveryDate) {
    const startOfDay = new Date(deliveryDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(deliveryDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingOrders = await Order.countDocuments({
      student: studentId,
      deliveryDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'failed'] }
    });
    
    const dailyLimit = 3; // Max 3 orders per student per day
    
    if (existingOrders >= dailyLimit) {
      return {
        allowed: false,
        message: `You have reached the daily order limit (${dailyLimit} orders per day)`
      };
    }
    
    return { allowed: true, remaining: dailyLimit - existingOrders };
  }
}

module.exports = new CheckoutValidationService();
