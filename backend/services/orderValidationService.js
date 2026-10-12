const FoodItem = require('../models/FoodItem');
const Student = require('../models/Student');
const OrderSchedule = require('../models/OrderSchedule');
const EventLog = require('../models/EventLog');

/**
 * Order Validation Service
 * Validates orders against multiple constraints and business rules
 */
class OrderValidationService {
  
  /**
   * Validate entire order
   */
  async validateOrder(studentId, orderData, deliveryDate) {
    const validationResult = {
      passed: true,
      checks: {},
      errors: [],
      warnings: []
    };

    try {
      // Get student details
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Run all validation checks
      validationResult.checks.cutoffTime = await this.checkCutoffTime(deliveryDate, student.school);
      validationResult.checks.menuAvailability = await this.checkMenuAvailability(orderData.items, deliveryDate);
      validationResult.checks.dietaryCompliance = await this.checkDietaryCompliance(orderData.items, student);
      validationResult.checks.allergyCheck = await this.checkAllergens(orderData.items, student);
      validationResult.checks.ageAppropriate = await this.checkAgeAppropriateness(orderData.items, student);
      
      // Determine overall pass/fail
      for (const check of Object.values(validationResult.checks)) {
        if (!check.passed) {
          validationResult.passed = false;
          validationResult.errors.push(check.message);
        }
        if (check.warning) {
          validationResult.warnings.push(check.warning);
        }
      }

      // Log validation event
      await this.logValidationEvent(studentId, validationResult);

      return validationResult;

    } catch (error) {
      console.error('Order validation error:', error);
      return {
        passed: false,
        checks: {},
        errors: [error.message],
        warnings: []
      };
    }
  }

  /**
   * Check if order is placed before cut-off time
   */
  async checkCutoffTime(deliveryDate, school) {
    try {
      const now = new Date();
      const delivery = new Date(deliveryDate);
      
      // Set cut-off time to 8:00 PM previous day
      const cutoff = new Date(delivery);
      cutoff.setDate(cutoff.getDate() - 1);
      cutoff.setHours(20, 0, 0, 0);

      // Check if order schedule is locked
      const schedule = await OrderSchedule.findOne({
        date: delivery,
        school: school
      });

      if (schedule && schedule.isLocked) {
        return {
          passed: false,
          message: `Orders for ${delivery.toLocaleDateString()} are locked. Cut-off time has passed.`
        };
      }

      if (now > cutoff) {
        return {
          passed: false,
          message: `Cut-off time (8:00 PM previous day) has passed for delivery on ${delivery.toLocaleDateString()}`
        };
      }

      return {
        passed: true,
        message: `Order placed within cut-off time. Cut-off: ${cutoff.toLocaleString()}`
      };

    } catch (error) {
      return {
        passed: false,
        message: `Error checking cut-off time: ${error.message}`
      };
    }
  }

  /**
   * Check menu availability for delivery date
   */
  async checkMenuAvailability(items, deliveryDate) {
    try {
      const delivery = new Date(deliveryDate);
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][delivery.getDay()];
      
      const unavailableItems = [];
      
      for (const item of items) {
        const food = await FoodItem.findById(item.foodId || item.foodItem);
        
        if (!food) {
          unavailableItems.push({ name: 'Unknown', reason: 'Item not found' });
          continue;
        }

        if (!food.available) {
          unavailableItems.push({ name: food.name, reason: 'Temporarily unavailable' });
        }

        if (!food.availableDays[dayName]) {
          unavailableItems.push({ name: food.name, reason: `Not available on ${dayName}` });
        }
      }

      if (unavailableItems.length > 0) {
        return {
          passed: false,
          message: `Unavailable items: ${unavailableItems.map(i => `${i.name} (${i.reason})`).join(', ')}`
        };
      }

      return {
        passed: true,
        message: 'All items available for selected date'
      };

    } catch (error) {
      return {
        passed: false,
        message: `Error checking menu availability: ${error.message}`
      };
    }
  }

  /**
   * Check dietary compliance
   */
  async checkDietaryCompliance(items, student) {
    try {
      const violations = [];
      const prefs = student.dietaryPreferences;

      for (const item of items) {
        const food = await FoodItem.findById(item.foodId || item.foodItem);
        if (!food) continue;

        if (prefs.vegetarian && !food.dietary.isVegetarian) {
          violations.push(`${food.name} is not vegetarian`);
        }

        if (prefs.vegan && !food.dietary.isVegan) {
          violations.push(`${food.name} is not vegan`);
        }

        if (prefs.halalOnly && !food.dietary.isHalal) {
          violations.push(`${food.name} is not halal`);
        }
      }

      if (violations.length > 0) {
        return {
          passed: false,
          message: `Dietary preference violations: ${violations.join(', ')}`
        };
      }

      return {
        passed: true,
        message: 'All items comply with dietary preferences'
      };

    } catch (error) {
      return {
        passed: true, // Don't block order on error
        message: 'Dietary check completed',
        warning: `Error checking dietary compliance: ${error.message}`
      };
    }
  }

  /**
   * Check for allergens
   */
  async checkAllergens(items, student) {
    try {
      if (!student.allergies || student.allergies.length === 0) {
        return {
          passed: true,
          message: 'No allergies registered'
        };
      }

      const allergenWarnings = [];

      for (const item of items) {
        const food = await FoodItem.findById(item.foodId || item.foodItem);
        if (!food) continue;

        const matchingAllergens = food.allergens.filter(allergen => 
          student.allergies.includes(allergen)
        );

        if (matchingAllergens.length > 0) {
          allergenWarnings.push(`${food.name} contains: ${matchingAllergens.join(', ')}`);
        }
      }

      if (allergenWarnings.length > 0) {
        return {
          passed: false,
          message: `ALLERGEN ALERT: ${allergenWarnings.join(' | ')}`
        };
      }

      return {
        passed: true,
        message: 'No allergen conflicts detected'
      };

    } catch (error) {
      return {
        passed: true, // Don't block but warn
        message: 'Allergen check completed',
        warning: `Error checking allergens: ${error.message}`
      };
    }
  }

  /**
   * Check age appropriateness
   */
  async checkAgeAppropriateness(items, student) {
    try {
      if (!student.ageGroup) {
        return {
          passed: true,
          message: 'Age group not specified',
          warning: 'Unable to verify age appropriateness'
        };
      }

      const warnings = [];

      for (const item of items) {
        const food = await FoodItem.findById(item.foodId || item.foodItem);
        if (!food || !food.suitableAgeGroups || food.suitableAgeGroups.length === 0) {
          continue;
        }

        if (!food.suitableAgeGroups.includes(student.ageGroup)) {
          warnings.push(`${food.name} may not be suitable for age group ${student.ageGroup}`);
        }
      }

      if (warnings.length > 0) {
        return {
          passed: true, // Don't block, just warn
          message: 'Age appropriateness checked',
          warning: warnings.join('; ')
        };
      }

      return {
        passed: true,
        message: 'All items age-appropriate'
      };

    } catch (error) {
      return {
        passed: true,
        message: 'Age check completed',
        warning: `Error checking age appropriateness: ${error.message}`
      };
    }
  }

  /**
   * Log validation event
   */
  async logValidationEvent(studentId, validationResult) {
    try {
      await EventLog.create({
        eventType: validationResult.passed ? 'order_validated' : 'order_rejected',
        severity: validationResult.passed ? 'info' : 'warning',
        entityType: 'order',
        entityId: studentId,
        userId: studentId,
        message: validationResult.passed 
          ? 'Order validation passed' 
          : `Order validation failed: ${validationResult.errors.join(', ')}`,
        details: {
          checks: validationResult.checks,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        }
      });
    } catch (error) {
      console.error('Error logging validation event:', error);
    }
  }
}

module.exports = new OrderValidationService();
