const Order = require('../models/Order');
const Student = require('../models/Student');
const EventLog = require('../models/EventLog');
const walletService = require('./walletService');

/**
 * Exception & Event Handling Service
 * Handles special cases and exceptions in order lifecycle
 */
class ExceptionHandlingService {

  /**
   * Handle student absence
   */
  async handleStudentAbsence(orderId, reason = 'Student absent') {
    try {
      const order = await Order.findById(orderId).populate('student');
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (['delivered', 'completed', 'cancelled'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      // Add exception
      order.exceptions.push({
        type: 'student_absent',
        reason: reason,
        timestamp: new Date(),
        resolved: false
      });

      // Cancel order
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancelledBy = order.student._id;
      order.cancellationReason = reason;

      // Issue refund if payment was made
      if (order.payment && order.payment.status === 'completed') {
        const refund = await walletService.issueRefund(
          order.student._id,
          order.payment.walletDeducted,
          order._id,
          `Refund: ${reason}`
        );

        order.payment.status = 'refunded';
      }

      await order.save();

      // Log event
      await EventLog.create({
        eventType: 'student_absent',
        severity: 'warning',
        entityType: 'order',
        entityId: order._id,
        userId: order.student._id,
        message: `Order cancelled due to student absence`,
        details: {
          orderId: order._id,
          studentId: order.student._id,
          reason: reason,
          refundAmount: order.payment?.walletDeducted || 0
        }
      });

      return {
        success: true,
        order: order,
        refundIssued: order.payment?.status === 'refunded',
        message: 'Order cancelled and refund issued'
      };

    } catch (error) {
      throw new Error(`Failed to handle student absence: ${error.message}`);
    }
  }

  /**
   * Handle delivery delay
   */
  async handleDeliveryDelay(orderId, estimatedDelay, reason = 'Traffic/logistics') {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Add exception
      order.exceptions.push({
        type: 'delivery_delay',
        reason: `Delayed by ${estimatedDelay} minutes: ${reason}`,
        timestamp: new Date(),
        resolved: false
      });

      // Add delivery alert
      if (!order.delivery) {
        order.delivery = {};
      }

      if (!order.delivery.alerts) {
        order.delivery.alerts = [];
      }

      order.delivery.alerts.push({
        type: 'delivery_delay',
        message: `Delivery delayed by ${estimatedDelay} minutes`,
        timestamp: new Date()
      });

      await order.save();

      // Log event
      await EventLog.create({
        eventType: 'delivery_delay',
        severity: 'warning',
        entityType: 'delivery',
        entityId: order._id,
        userId: order.student,
        message: `Delivery delayed: ${reason}`,
        details: {
          orderId: order._id,
          estimatedDelay: estimatedDelay,
          reason: reason
        }
      });

      // TODO: Send notification to student/parent

      return {
        success: true,
        order: order,
        message: `Delivery delay recorded: ${estimatedDelay} minutes`
      };

    } catch (error) {
      throw new Error(`Failed to handle delivery delay: ${error.message}`);
    }
  }

  /**
   * Handle temperature breach during delivery
   */
  async handleTemperatureBreach(orderId, temperature, boxId) {
    try {
      const order = await Order.findById(orderId).populate('student');
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Add exception
      order.exceptions.push({
        type: 'temperature_breach',
        reason: `Temperature ${temperature}°C outside safe range during delivery`,
        timestamp: new Date(),
        resolved: false
      });

      await order.save();

      // Log critical event
      await EventLog.create({
        eventType: 'temperature_alert',
        severity: 'critical',
        entityType: 'delivery',
        entityId: order._id,
        userId: order.student._id,
        message: `FOOD SAFETY ALERT: Temperature breach detected`,
        details: {
          orderId: order._id,
          boxId: boxId,
          temperature: temperature,
          studentName: order.student.name
        }
      });

      // TODO: Send immediate alert to admin and student
      // TODO: Mark order for inspection before delivery

      return {
        success: true,
        order: order,
        actionRequired: true,
        message: 'Temperature breach logged. Manual intervention required.'
      };

    } catch (error) {
      throw new Error(`Failed to handle temperature breach: ${error.message}`);
    }
  }

  /**
   * Handle order cancellation by student
   */
  async handleOrderCancellation(orderId, studentId, reason = 'Requested by student') {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify student owns this order
      if (order.student.toString() !== studentId) {
        throw new Error('Unauthorized: You can only cancel your own orders');
      }

      // Check if cancellation is allowed (before preparation starts)
      if (['preparing', 'ready', 'dispatched', 'delivered', 'completed'].includes(order.status)) {
        throw new Error(`Cannot cancel order in ${order.status} status`);
      }

      // Add exception
      order.exceptions.push({
        type: 'cancelled',
        reason: reason,
        timestamp: new Date(),
        resolved: true,
        resolution: 'Order cancelled and refund issued'
      });

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancelledBy = studentId;
      order.cancellationReason = reason;

      // Issue refund
      if (order.payment && order.payment.status === 'completed') {
        await walletService.issueRefund(
          studentId,
          order.payment.walletDeducted,
          order._id,
          `Cancellation refund: ${reason}`
        );

        order.payment.status = 'refunded';
      }

      await order.save();

      // Log event
      await EventLog.create({
        eventType: 'order_cancelled',
        severity: 'info',
        entityType: 'order',
        entityId: order._id,
        userId: studentId,
        message: `Order cancelled by student`,
        details: {
          orderId: order._id,
          reason: reason,
          refundAmount: order.payment?.walletDeducted || 0
        }
      });

      return {
        success: true,
        order: order,
        refundIssued: true,
        message: 'Order cancelled successfully. Refund has been issued.'
      };

    } catch (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  /**
   * Resolve exception
   */
  async resolveException(orderId, exceptionIndex, resolution, resolvedBy) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.exceptions[exceptionIndex]) {
        throw new Error('Exception not found');
      }

      order.exceptions[exceptionIndex].resolved = true;
      order.exceptions[exceptionIndex].resolution = resolution;
      
      await order.save();

      // Log event
      await EventLog.create({
        eventType: 'order_placed',
        severity: 'info',
        entityType: 'order',
        entityId: order._id,
        message: `Exception resolved: ${resolution}`,
        details: {
          orderId: order._id,
          exceptionType: order.exceptions[exceptionIndex].type,
          resolution: resolution,
          resolvedBy: resolvedBy
        }
      });

      return {
        success: true,
        message: 'Exception resolved successfully'
      };

    } catch (error) {
      throw new Error(`Failed to resolve exception: ${error.message}`);
    }
  }

  /**
   * Get all unresolved exceptions
   */
  async getUnresolvedExceptions() {
    try {
      const orders = await Order.find({
        'exceptions.resolved': false
      }).populate('student', 'name email school');

      const exceptions = [];

      orders.forEach(order => {
        order.exceptions.forEach((exception, index) => {
          if (!exception.resolved) {
            exceptions.push({
              orderId: order._id,
              exceptionIndex: index,
              student: order.student,
              type: exception.type,
              reason: exception.reason,
              timestamp: exception.timestamp,
              orderStatus: order.status
            });
          }
        });
      });

      return {
        success: true,
        count: exceptions.length,
        exceptions: exceptions
      };

    } catch (error) {
      throw new Error(`Failed to get unresolved exceptions: ${error.message}`);
    }
  }

  /**
   * Get exception statistics
   */
  async getExceptionStatistics(startDate, endDate) {
    try {
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        'exceptions.0': { $exists: true }
      });

      const stats = {
        total: 0,
        byType: {
          student_absent: 0,
          delivery_delay: 0,
          temperature_breach: 0,
          cancelled: 0,
          other: 0
        },
        resolved: 0,
        unresolved: 0
      };

      orders.forEach(order => {
        order.exceptions.forEach(exception => {
          stats.total++;
          stats.byType[exception.type] = (stats.byType[exception.type] || 0) + 1;
          
          if (exception.resolved) {
            stats.resolved++;
          } else {
            stats.unresolved++;
          }
        });
      });

      return {
        success: true,
        stats: stats
      };

    } catch (error) {
      throw new Error(`Failed to get exception statistics: ${error.message}`);
    }
  }
}

module.exports = new ExceptionHandlingService();
