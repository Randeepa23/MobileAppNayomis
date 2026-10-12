const Order = require('../models/Order');
const OrderSchedule = require('../models/OrderSchedule');
const FoodItem = require('../models/FoodItem');
const EventLog = require('../models/EventLog');

/**
 * Order Aggregation & Scheduling Service
 * Aggregates orders and manages preparation schedules
 */
class OrderAggregationService {

  /**
   * Aggregate orders for a specific date and school
   */
  async aggregateOrders(date, school) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Find all validated orders for this date and school
      const orders = await Order.find({
        deliveryDate: { $gte: startOfDay, $lte: endOfDay },
        'validation.passed': true,
        status: { $in: ['validated', 'confirmed'] }
      }).populate({
        path: 'student',
        match: { school: school },
        select: 'school pickupLocation'
      }).populate('items.foodItem');

      // Filter out orders where student didn't match school
      const schoolOrders = orders.filter(order => order.student && order.student.school === school);

      // Aggregate items
      const aggregatedItems = {};
      const deliveryLocations = {};

      schoolOrders.forEach(order => {
        order.items.forEach(item => {
          const foodId = item.foodItem._id.toString();
          const foodName = item.foodItem.name;
          const quantity = item.quantity;
          const price = item.foodItem.price;

          if (!aggregatedItems[foodId]) {
            aggregatedItems[foodId] = {
              foodId: item.foodItem._id,
              foodName: foodName,
              quantity: 0,
              totalCost: 0
            };
          }

          aggregatedItems[foodId].quantity += quantity;
          aggregatedItems[foodId].totalCost += price * quantity;
        });

        // Aggregate delivery locations
        const location = order.pickupLocation || 'Main Campus';
        if (!deliveryLocations[location]) {
          deliveryLocations[location] = {
            location: location,
            orderCount: 0,
            estimatedTime: this.calculateDeliveryTime(date, location)
          };
        }
        deliveryLocations[location].orderCount++;
      });

      // Generate preparation schedule
      const preparationSchedule = this.generatePreparationSchedule(date, Object.values(aggregatedItems));

      // Create or update schedule
      const schedule = await OrderSchedule.findOneAndUpdate(
        { date: startOfDay, school: school },
        {
          date: startOfDay,
          school: school,
          cutoffTime: this.getCutoffTime(date),
          totalOrders: schoolOrders.length,
          aggregatedItems: Object.values(aggregatedItems),
          preparationSchedule: preparationSchedule,
          deliveryLocations: Object.values(deliveryLocations),
          status: 'pending'
        },
        { upsert: true, new: true }
      );

      // Attach schedule to orders
      await Order.updateMany(
        { _id: { $in: schoolOrders.map(o => o._id) } },
        { scheduleId: schedule._id }
      );

      // Log event
      await EventLog.create({
        eventType: 'order_placed',
        severity: 'info',
        entityType: 'system',
        entityId: schedule._id,
        message: `Orders aggregated for ${school} on ${date}`,
        details: {
          totalOrders: schoolOrders.length,
          totalItems: Object.values(aggregatedItems).reduce((sum, item) => sum + item.quantity, 0),
          school: school,
          date: date
        }
      });

      return {
        success: true,
        schedule: schedule,
        orderCount: schoolOrders.length,
        itemsSummary: Object.values(aggregatedItems)
      };

    } catch (error) {
      console.error('Order aggregation error:', error);
      throw new Error(`Failed to aggregate orders: ${error.message}`);
    }
  }

  /**
   * Generate preparation schedule based on order complexity
   */
  generatePreparationSchedule(deliveryDate, items) {
    const delivery = new Date(deliveryDate);
    
    // Calculate total preparation time needed
    const totalPrepTime = items.reduce((sum, item) => {
      return sum + (item.quantity * 2); // 2 minutes per item average
    }, 0);

    // Set delivery time (e.g., 7:30 AM)
    delivery.setHours(7, 30, 0, 0);

    // Work backwards
    const dispatchTime = new Date(delivery.getTime() - 15 * 60000); // 15 min before delivery
    const packingStartTime = new Date(dispatchTime.getTime() - 30 * 60000); // 30 min packing
    const startTime = new Date(packingStartTime.getTime() - totalPrepTime * 60000); // Prep time

    return {
      startTime: startTime,
      packingStartTime: packingStartTime,
      dispatchTime: dispatchTime,
      deliveryTime: delivery
    };
  }

  /**
   * Calculate cut-off time (8:00 PM previous day)
   */
  getCutoffTime(deliveryDate) {
    const cutoff = new Date(deliveryDate);
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(20, 0, 0, 0);
    return cutoff;
  }

  /**
   * Calculate estimated delivery time based on location
   */
  calculateDeliveryTime(date, location) {
    const baseTime = new Date(date);
    baseTime.setHours(7, 30, 0, 0);

    // Add buffer based on location distance (simplified)
    const locationBuffers = {
      'Main Campus': 0,
      'Building A': 5,
      'Building B': 10,
      'Building C': 15,
      'default': 10
    };

    const buffer = locationBuffers[location] || locationBuffers['default'];
    return new Date(baseTime.getTime() + buffer * 60000);
  }

  /**
   * Lock orders after cut-off time
   */
  async lockOrdersAfterCutoff() {
    try {
      const now = new Date();
      
      // Find schedules where cutoff has passed and orders aren't locked
      const schedules = await OrderSchedule.find({
        cutoffTime: { $lt: now },
        isLocked: false,
        date: { $gte: now } // Only future orders
      });

      for (const schedule of schedules) {
        schedule.isLocked = true;
        await schedule.save();

        // Log event
        await EventLog.create({
          eventType: 'cutoff_reached',
          severity: 'info',
          entityType: 'order',
          entityId: schedule._id,
          message: `Orders locked for ${schedule.school} on ${schedule.date.toDateString()}`,
          details: {
            school: schedule.school,
            date: schedule.date,
            totalOrders: schedule.totalOrders
          }
        });
      }

      return {
        success: true,
        lockedSchedules: schedules.length
      };

    } catch (error) {
      console.error('Lock orders error:', error);
      throw new Error(`Failed to lock orders: ${error.message}`);
    }
  }

  /**
   * Get preparation summary for restaurant
   */
  async getPreparationSummary(date, school) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const schedule = await OrderSchedule.findOne({
        date: startOfDay,
        school: school
      }).populate('aggregatedItems.foodId');

      if (!schedule) {
        return {
          success: false,
          message: 'No orders found for this date and school'
        };
      }

      return {
        success: true,
        school: schedule.school,
        date: schedule.date,
        totalOrders: schedule.totalOrders,
        items: schedule.aggregatedItems,
        schedule: schedule.preparationSchedule,
        deliveryLocations: schedule.deliveryLocations,
        status: schedule.status
      };

    } catch (error) {
      throw new Error(`Failed to get preparation summary: ${error.message}`);
    }
  }

  /**
   * Update schedule status (preparing, packing, dispatched, etc.)
   */
  async updateScheduleStatus(scheduleId, status) {
    try {
      const schedule = await OrderSchedule.findByIdAndUpdate(
        scheduleId,
        { status: status },
        { new: true }
      );

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Update all orders in this schedule
      await Order.updateMany(
        { scheduleId: scheduleId },
        { status: status }
      );

      // Log event
      await EventLog.create({
        eventType: 'preparation_started',
        severity: 'info',
        entityType: 'order',
        entityId: scheduleId,
        message: `Schedule status updated to ${status}`,
        details: {
          scheduleId: scheduleId,
          status: status,
          school: schedule.school,
          date: schedule.date
        }
      });

      return {
        success: true,
        schedule: schedule
      };

    } catch (error) {
      throw new Error(`Failed to update schedule status: ${error.message}`);
    }
  }
}

module.exports = new OrderAggregationService();
