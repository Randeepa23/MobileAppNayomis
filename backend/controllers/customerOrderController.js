const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/Order');
const Student = require('../models/Student');
const FoodItem = require('../models/FoodItem');
const PickupPoint = require('../models/PickupPoint');
const EventLog = require('../models/EventLog');

class RequestError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const safeOrder = (order) => order;

const idempotencyKey = (req) => {
  const key = req.get('Idempotency-Key');
  if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) {
    throw new RequestError(400, 'IDEMPOTENCY_KEY_REQUIRED', 'Provide an Idempotency-Key containing 16 to 128 letters, numbers, underscores, or hyphens.');
  }
  return key;
};

const normalizedRequest = (body) => JSON.stringify({
  items: body.items,
  pickupPointId: body.pickupPointId,
  deliveryDate: body.deliveryDate,
  timeSlot: body.timeSlot,
  specialInstructions: body.specialInstructions || '',
  paymentMethod: body.paymentMethod,
});

const requestFingerprint = (body) => crypto.createHash('sha256').update(normalizedRequest(body)).digest('hex');

const parseOrder = (body) => {
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 25) {
    throw new RequestError(400, 'INVALID_CART', 'Select between 1 and 25 menu items.');
  }
  const quantities = new Map();
  for (const item of body.items) {
    const id = String(item?.foodId || item?.foodItem || '');
    const quantity = Number(item?.quantity);
    if (!mongoose.isValidObjectId(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new RequestError(400, 'INVALID_CART', 'Each cart item must have a valid food ID and quantity from 1 to 20.');
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }
  if (!mongoose.isValidObjectId(body.pickupPointId) || typeof body.timeSlot !== 'string' || !body.timeSlot.trim()) {
    throw new RequestError(400, 'INVALID_PICKUP_SELECTION', 'Choose a pickup point and time slot.');
  }
  const deliveryDate = new Date(body.deliveryDate);
  if (Number.isNaN(deliveryDate.getTime())) throw new RequestError(400, 'INVALID_DELIVERY_DATE', 'Choose a valid delivery date.');
  deliveryDate.setHours(0, 0, 0, 0);
  if (body.paymentMethod !== 'cash_on_delivery') {
    throw new RequestError(400, 'CASH_PAYMENT_REQUIRED', 'Cash on delivery is the only payment method currently available.');
  }
  const specialInstructions = typeof body.specialInstructions === 'string' ? body.specialInstructions.trim() : '';
  if (specialInstructions.length > 500) throw new RequestError(400, 'INVALID_INSTRUCTIONS', 'Instructions cannot exceed 500 characters.');
  return { quantities, deliveryDate, pickupPointId: body.pickupPointId, timeSlot: body.timeSlot.trim(), specialInstructions };
};

const populateOrder = (id) => Order.findById(id)
  .populate('items.foodItem', 'name price category dietary allergens')
  .populate('student', 'name email school');

const placeOrder = async (req, res) => {
  let session;
  try {
    const key = idempotencyKey(req);
    const fingerprint = requestFingerprint(req.body);
    const request = parseOrder(req.body);
    const studentId = req.customer.studentId;
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      const prior = await Order.findOne({ student: studentId, 'request.idempotencyKey': key }).session(session);
      if (prior) {
        if (prior.request.fingerprint !== fingerprint) {
          throw new RequestError(409, 'IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different checkout.');
        }
        result = { orderId: prior._id, replayed: true };
        return;
      }
      const student = await Student.findById(studentId).session(session);
      if (!student || student.accountStatus !== 'active') throw new RequestError(403, 'CUSTOMER_NOT_ACTIVE', 'Your customer account is not active.');
      const foods = await FoodItem.find({ _id: { $in: [...request.quantities.keys()] } }).session(session);
      if (foods.length !== request.quantities.size) throw new RequestError(400, 'ITEM_UNAVAILABLE', 'One or more selected menu items are no longer available.');
      const day = dayNames[request.deliveryDate.getDay()];
      let total = 0;
      const items = [];
      for (const food of foods) {
        const quantity = request.quantities.get(String(food._id));
        if (!food.available || food.availableDays?.[day] === false || (food.stockQuantity > 0 && food.stockQuantity < quantity)) {
          throw new RequestError(400, 'ITEM_UNAVAILABLE', `${food.name} is not available for the selected date.`);
        }
        total += food.price * quantity;
        items.push({ foodItem: food._id, quantity });
      }
      const pickup = await PickupPoint.findById(request.pickupPointId).session(session);
      if (!pickup || pickup.status !== 'active' || !pickup.isAvailableForDate(request.deliveryDate)) {
        throw new RequestError(400, 'PICKUP_UNAVAILABLE', 'The selected pickup point is unavailable for this date.');
      }
      const slot = pickup.timeSlots.find((candidate) => candidate.slot === request.timeSlot);
      if (!slot || slot.currentBookings >= slot.capacity || pickup.capacity.currentOrders >= pickup.capacity.dailyLimit) {
        throw new RequestError(409, 'PICKUP_SLOT_UNAVAILABLE', 'The selected pickup slot is no longer available.');
      }
      // Saving the pickup point in the same transaction makes a concurrent slot
      // booking conflict and retry instead of silently overbooking capacity.
      slot.currentBookings += 1;
      pickup.capacity.currentOrders += 1;
      await pickup.save({ session });
      const order = await Order.create([{
        student: student._id,
        items,
        total: Number(total.toFixed(2)),
        status: 'confirmed',
        pickupLocation: pickup.name,
        pickupPointId: pickup._id,
        pickupTime: request.timeSlot,
        deliveryDate: request.deliveryDate,
        specialInstructions: request.specialInstructions,
        payment: { method: 'cash_on_delivery', amount: Number(total.toFixed(2)), status: 'pending' },
        request: { idempotencyKey: key, fingerprint },
      }], { session });
      await EventLog.create([{
        eventType: 'order_placed', severity: 'info', entityType: 'order', entityId: order[0]._id,
        userId: student._id, message: 'Cash-on-delivery order placed through the customer API', details: { pickupPointId: pickup._id },
      }], { session });
      result = { orderId: order[0]._id, replayed: false };
    });
    const order = await populateOrder(result.orderId);
    return res.status(result.replayed ? 200 : 201).json({ success: true, data: { order: safeOrder(order), replayed: result.replayed } });
  } catch (error) {
    if (error instanceof RequestError) return res.status(error.status).json({ success: false, code: error.code, message: error.message, details: error.details });
    if (error?.code === 11000) return res.status(409).json({ success: false, code: 'IDEMPOTENCY_CONFLICT', message: 'A duplicate order submission was detected. Retry with the same Idempotency-Key.' });
    console.error('Secure customer order placement failed', error);
    return res.status(500).json({ success: false, code: 'ORDER_PLACEMENT_FAILED', message: 'Unable to place the order right now.' });
  } finally {
    if (session) await session.endSession();
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.customer.studentId })
      .populate('items.foodItem', 'name price category').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Customer order retrieval failed', error);
    return res.status(500).json({ success: false, code: 'ORDER_RETRIEVAL_FAILED', message: 'Unable to load orders right now.' });
  }
};

module.exports = { placeOrder, getOrders };
