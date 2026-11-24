const Order = require('../models/Order');
const DeliveryBox = require('../models/DeliveryBox');
const Alert = require('../models/Alert');
const EventLog = require('../models/EventLog');

const getDriverDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['confirmed', 'preparing', 'ready', 'dispatched'] },
      'delivery.boxId': { $exists: true, $ne: null },
    })
      .populate('student', 'name email school whatsapp grade')
      .populate('pickupPointId', 'name address location timeSlots')
      .populate('items.foodItem', 'name price category')
      .sort({ deliveryDate: 1, createdAt: 1 })
      .lean();

    // Fetch matching delivery boxes for live hardware stats
    const boxIds = orders.map((o) => o.delivery.boxId).filter(Boolean);
    const boxes = await DeliveryBox.find({ boxId: { $in: boxIds } }).lean();
    const boxMap = new Map(boxes.map((b) => [b.boxId, b]));

    const deliveries = orders.map((order) => {
      const box = boxMap.get(order.delivery?.boxId);
      return {
        orderId: String(order._id),
        orderNumber: `#${String(order._id).slice(-6).toUpperCase()}`,
        status: order.status,
        recipient: {
          name: order.student?.name || 'Student',
          school: order.student?.school || '',
          contact: order.student?.whatsapp || '',
        },
        pickup: {
          name: order.pickupLocation,
          time: order.pickupTime,
          date: order.deliveryDate,
        },
        items: (order.items || []).map((i) => ({
          name: i.foodItem?.name || 'Meal',
          quantity: i.quantity,
        })),
        specialInstructions: order.specialInstructions || '',
        monitoring: {
          boxId: order.delivery?.boxId,
          boxStatus: box?.status || 'unknown',
          temperature: box?.temperature?.current ?? null,
          batteryPercent: box?.batteryLevel ?? null,
          location: box?.location?.coordinates || null,
          lastReadingTime: box?.temperature?.lastUpdated || null,
          activeAlerts: (box?.alerts || []).filter((a) => !a.resolved),
        },
      };
    });

    return res.json({
      success: true,
      data: { deliveries },
    });
  } catch (error) {
    console.error('Failed to get driver deliveries:', error);
    return res.status(500).json({ success: false, message: 'Unable to load deliveries.' });
  }
};

const confirmDispatch = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const now = new Date();
    order.status = 'dispatched';
    order.delivery = order.delivery || {};
    order.delivery.dispatchedAt = now;
    await order.save();

    if (order.delivery.boxId) {
      await DeliveryBox.updateOne(
        { boxId: order.delivery.boxId },
        { $set: { status: 'in-transit' } }
      );
    }

    await EventLog.create({
      eventType: 'delivery_dispatched',
      severity: 'info',
      entityType: 'order',
      entityId: order._id,
      userId: req.driver?.driverId || null,
      message: `Order ${order._id} dispatched for delivery`,
    });

    return res.json({
      success: true,
      message: 'Delivery marked as dispatched.',
      data: { orderId: String(order._id), status: 'dispatched' },
    });
  } catch (error) {
    console.error('Dispatch error:', error);
    return res.status(500).json({ success: false, message: 'Unable to confirm dispatch.' });
  }
};

const completeHandover = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes = '', recipientConfirmed = true } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const now = new Date();
    order.status = 'delivered';
    order.delivery = order.delivery || {};
    order.delivery.deliveredAt = now;
    if (order.payment?.method === 'cash_on_delivery') {
      order.payment.status = 'completed';
      order.payment.paidAt = now;
    }
    await order.save();

    if (order.delivery.boxId) {
      await DeliveryBox.updateOne(
        { boxId: order.delivery.boxId },
        {
          $set: {
            status: 'idle',
            orderId: null,
            deliveredDate: now,
          },
        }
      );
    }

    await EventLog.create({
      eventType: 'delivery_completed',
      severity: 'info',
      entityType: 'order',
      entityId: order._id,
      userId: req.driver?.driverId || null,
      message: `Order ${order._id} successfully handed over at school pickup point.`,
      details: { notes, recipientConfirmed },
    });

    return res.json({
      success: true,
      message: 'Delivery successfully completed and recorded.',
      data: { orderId: String(order._id), status: 'delivered' },
    });
  } catch (error) {
    console.error('Handover completion error:', error);
    return res.status(500).json({ success: false, message: 'Unable to record handover.' });
  }
};

const reportIncident = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { incidentType, description } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const now = new Date();
    const alert = await Alert.create({
      boxId: order.delivery?.boxId || 'UNASSIGNED',
      orderId: order._id,
      type: incidentType || 'other',
      severity: 'high',
      message: `Driver incident report: ${description}`,
    });

    order.exceptions = order.exceptions || [];
    order.exceptions.push({
      type: 'other',
      reason: description,
      timestamp: now,
      resolved: false,
    });
    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Incident reported successfully.',
      data: { alertId: alert._id },
    });
  } catch (error) {
    console.error('Driver incident report error:', error);
    return res.status(500).json({ success: false, message: 'Unable to report incident.' });
  }
};

module.exports = {
  getDriverDeliveries,
  confirmDispatch,
  completeHandover,
  reportIncident,
};

