const DeliveryBox = require('../models/DeliveryBox');
const Order = require('../models/Order');
const EventLog = require('../models/EventLog');

/**
 * IoT Delivery Tracking Service
 * Manages smart delivery boxes with temperature and GPS tracking
 */
class IoTDeliveryService {

  /**
   * Assign delivery box to order
   */
  async assignDeliveryBox(orderId, boxId) {
    try {
      // Check if box is available
      const box = await DeliveryBox.findOne({ boxId: boxId });
      
      if (!box) {
        throw new Error(`Delivery box ${boxId} not found`);
      }

      if (box.status !== 'idle') {
        throw new Error(`Delivery box ${boxId} is not available (Status: ${box.status})`);
      }

      // Update box
      box.orderId = orderId;
      box.status = 'assigned';
      box.assignedDate = new Date();
      await box.save();

      // Update order
      await Order.findByIdAndUpdate(orderId, {
        'delivery.boxId': boxId,
        'delivery.assignedAt': new Date()
      });

      // Log event
      await EventLog.create({
        eventType: 'delivery_assigned',
        severity: 'info',
        entityType: 'delivery',
        entityId: box._id,
        message: `Delivery box ${boxId} assigned to order`,
        details: { orderId, boxId }
      });

      return {
        success: true,
        box: box,
        message: `Box ${boxId} assigned successfully`
      };

    } catch (error) {
      throw new Error(`Failed to assign delivery box: ${error.message}`);
    }
  }

  /**
   * Update temperature reading from IoT sensor
   */
  async updateTemperature(boxId, temperature) {
    try {
      const box = await DeliveryBox.findOne({ boxId: boxId });
      
      if (!box) {
        throw new Error(`Delivery box ${boxId} not found`);
      }

      const now = new Date();
      box.temperature.current = temperature;
      box.temperature.lastUpdated = now;

      // Check if temperature is within safe range
      const isWithinRange = temperature >= box.temperature.min && temperature <= box.temperature.max;

      // If order is assigned, update order temperature log
      if (box.orderId) {
        await Order.findByIdAndUpdate(box.orderId, {
          $push: {
            'delivery.temperatureLog': {
              temperature: temperature,
              timestamp: now,
              withinRange: isWithinRange
            }
          }
        });

        // Create alert if temperature breach
        if (!isWithinRange) {
          const alert = {
            type: 'temperature',
            message: `Temperature ${temperature}°C outside safe range (${box.temperature.min}-${box.temperature.max}°C)`,
            severity: 'high',
            timestamp: now,
            resolved: false
          };

          box.alerts.push(alert);

          // Log critical event
          await EventLog.create({
            eventType: 'temperature_alert',
            severity: 'critical',
            entityType: 'delivery',
            entityId: box._id,
            message: alert.message,
            details: {
              boxId: boxId,
              orderId: box.orderId,
              temperature: temperature,
              safeRange: { min: box.temperature.min, max: box.temperature.max }
            }
          });

          // Add alert to order
          await Order.findByIdAndUpdate(box.orderId, {
            $push: {
              'delivery.alerts': {
                type: 'temperature_breach',
                message: alert.message,
                timestamp: now
              }
            }
          });
        }
      }

      await box.save();

      return {
        success: true,
        temperature: temperature,
        withinRange: isWithinRange,
        alerts: !isWithinRange ? ['Temperature outside safe range'] : []
      };

    } catch (error) {
      throw new Error(`Failed to update temperature: ${error.message}`);
    }
  }

  /**
   * Update GPS location from IoT sensor
   */
  async updateLocation(boxId, longitude, latitude, address = '') {
    try {
      const box = await DeliveryBox.findOne({ boxId: boxId });
      
      if (!box) {
        throw new Error(`Delivery box ${boxId} not found`);
      }

      const now = new Date();
      box.location.coordinates = [longitude, latitude];
      box.location.address = address;
      box.location.lastUpdated = now;

      // If order is assigned, update order location log
      if (box.orderId) {
        await Order.findByIdAndUpdate(box.orderId, {
          $push: {
            'delivery.locationLog': {
              coordinates: [longitude, latitude],
              timestamp: now,
              address: address
            }
          }
        });
      }

      await box.save();

      return {
        success: true,
        location: {
          longitude,
          latitude,
          address
        }
      };

    } catch (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }
  }

  /**
   * Update battery level
   */
  async updateBatteryLevel(boxId, batteryLevel) {
    try {
      const box = await DeliveryBox.findOne({ boxId: boxId });
      
      if (!box) {
        throw new Error(`Delivery box ${boxId} not found`);
      }

      box.batteryLevel = batteryLevel;

      // Create alert if battery is low
      if (batteryLevel < 20) {
        const alert = {
          type: 'battery',
          message: `Low battery: ${batteryLevel}%`,
          severity: batteryLevel < 10 ? 'high' : 'medium',
          timestamp: new Date(),
          resolved: false
        };

        box.alerts.push(alert);

        await EventLog.create({
          eventType: 'system_error',
          severity: 'warning',
          entityType: 'delivery',
          entityId: box._id,
          message: alert.message,
          details: { boxId, batteryLevel }
        });
      }

      await box.save();

      return {
        success: true,
        batteryLevel: batteryLevel
      };

    } catch (error) {
      throw new Error(`Failed to update battery level: ${error.message}`);
    }
  }

  /**
   * Mark delivery as completed
   */
  async completeDelivery(boxId) {
    try {
      const box = await DeliveryBox.findOne({ boxId: boxId });
      
      if (!box) {
        throw new Error(`Delivery box ${boxId} not found`);
      }

      const now = new Date();
      box.status = 'delivered';
      box.deliveredDate = now;

      // Update order
      if (box.orderId) {
        await Order.findByIdAndUpdate(box.orderId, {
          'delivery.deliveredAt': now,
          status: 'delivered'
        });

        // Log event
        await EventLog.create({
          eventType: 'delivery_completed',
          severity: 'info',
          entityType: 'delivery',
          entityId: box._id,
          message: `Delivery completed for box ${boxId}`,
          details: {
            boxId: boxId,
            orderId: box.orderId,
            deliveredAt: now
          }
        });
      }

      await box.save();

      return {
        success: true,
        message: 'Delivery completed successfully'
      };

    } catch (error) {
      throw new Error(`Failed to complete delivery: ${error.message}`);
    }
  }

  /**
   * Reset box to idle state
   */
  async resetBox(boxId) {
    try {
      const box = await DeliveryBox.findOne({ boxId: boxId });
      
      if (!box) {
        throw new Error(`Delivery box ${boxId} not found`);
      }

      box.orderId = null;
      box.status = 'idle';
      box.assignedDate = null;
      box.deliveredDate = null;
      box.alerts = [];
      box.temperature.current = null;

      await box.save();

      return {
        success: true,
        message: `Box ${boxId} reset to idle state`
      };

    } catch (error) {
      throw new Error(`Failed to reset box: ${error.message}`);
    }
  }

  /**
   * Get box status and history
   */
  async getBoxStatus(boxId) {
    try {
      const box = await DeliveryBox.findOne({ boxId: boxId })
        .populate('orderId', 'student total deliveryDate');

      if (!box) {
        throw new Error(`Delivery box ${boxId} not found`);
      }

      return {
        success: true,
        box: box
      };

    } catch (error) {
      throw new Error(`Failed to get box status: ${error.message}`);
    }
  }

  /**
   * Get all active deliveries
   */
  async getActiveDeliveries() {
    try {
      const boxes = await DeliveryBox.find({
        status: { $in: ['assigned', 'in-transit'] }
      }).populate('orderId', 'student total deliveryDate status');

      return {
        success: true,
        activeDeliveries: boxes
      };

    } catch (error) {
      throw new Error(`Failed to get active deliveries: ${error.message}`);
    }
  }

  /**
   * Check for alerts and safety violations
   */
  async checkSafetyViolations() {
    try {
      const boxes = await DeliveryBox.find({
        status: { $in: ['assigned', 'in-transit'] },
        'alerts.resolved': false
      });

      const violations = [];

      for (const box of boxes) {
        const unresolvedAlerts = box.alerts.filter(alert => !alert.resolved);
        
        if (unresolvedAlerts.length > 0) {
          violations.push({
            boxId: box.boxId,
            orderId: box.orderId,
            alerts: unresolvedAlerts,
            status: box.status
          });
        }
      }

      return {
        success: true,
        violationCount: violations.length,
        violations: violations
      };

    } catch (error) {
      throw new Error(`Failed to check safety violations: ${error.message}`);
    }
  }

  /**
   * Register new IoT delivery box
   */
  async registerBox(boxId) {
    try {
      const existingBox = await DeliveryBox.findOne({ boxId: boxId });
      
      if (existingBox) {
        throw new Error(`Box ${boxId} is already registered`);
      }

      const box = await DeliveryBox.create({
        boxId: boxId,
        status: 'idle',
        batteryLevel: 100
      });

      return {
        success: true,
        box: box,
        message: `Box ${boxId} registered successfully`
      };

    } catch (error) {
      throw new Error(`Failed to register box: ${error.message}`);
    }
  }
}

module.exports = new IoTDeliveryService();
