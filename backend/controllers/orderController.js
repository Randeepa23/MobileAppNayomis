const Order = require('../models/Order');
const Student = require('../models/Student');
const FoodItem = require('../models/FoodItem');
const { sendOrderNotification } = require('../services/whatsappService');

const placeOrder = async (req, res) => {
  try {
    const { studentId, items, pickupLocation, pickupTime, pointsToUse } = req.body;
    
    // Get pickup day from time or use current date if not provided
    let pickupDay = 'monday'; // default
    if (pickupTime) {
      const pickupDate = new Date(pickupTime);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      pickupDay = days[pickupDate.getDay()];
    }
    
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      // Handle both foodId and foodItem field names
      const foodId = item.foodId || item.foodItem;
      const foodItem = await FoodItem.findById(foodId);
      if (!foodItem) {
        return res.status(404).json({ 
          success: false, 
          message: `Food item not found: ${foodId}` 
        });
      }
      
      // Check availability for pickup day
      const isAvailableToday = foodItem.availableDays[pickupDay] && foodItem.available;
      if (!isAvailableToday) {
        return res.status(400).json({ 
          success: false, 
          message: `${foodItem.name} is not available for that day` 
        });
      }
      
      total += foodItem.price * item.quantity;
      orderItems.push({
        foodItem: foodId,
        quantity: item.quantity
      });
    }

    // Apply loyalty points discount if provided
    let pointsDiscount = 0;
    if (pointsToUse && pointsToUse > 0) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }
      
      // Validate points usage
      const maxPointsToUse = Math.min(student.points, Math.floor(total * 100));
      const actualPointsToUse = Math.min(pointsToUse, maxPointsToUse);
      
      if (actualPointsToUse > 0) {
        pointsDiscount = actualPointsToUse * 0.01;
        total = Math.max(0, total - pointsDiscount);
        
        // Deduct points from student
        await Student.findByIdAndUpdate(
          studentId,
          { $inc: { points: -actualPointsToUse } }
        );
      }
    }

    const pointsEarned = Math.floor(total);

    const order = new Order({
      student: studentId,
      items: orderItems,
      total,
      pickupLocation: pickupLocation || 'Nayomi\'s Restaurant',
      pickupTime: pickupTime || new Date(),
      pointsEarned
    });

    await order.save();
    
    // Award loyalty points immediately when order is placed
    await Student.findByIdAndUpdate(
      studentId,
      { $inc: { points: pointsEarned } }
    );
    
    // Get student and food details for notification
    const student = await Student.findById(studentId);
    const populatedOrder = await Order.findById(order._id)
      .populate('items.foodItem', 'name price')
      .populate('student');
    
    // Send WhatsApp notification (non-blocking)
    const orderData = {
      orderId: order._id,
      student: {
        name: student.name,
        whatsapp: student.whatsapp,
        school: student.school
      },
      items: populatedOrder.items.map(item => ({
        name: item.foodItem.name,
        quantity: item.quantity,
        price: item.foodItem.price
      })),
      total,
      pickupLocation: order.pickupLocation,
      pickupTime: order.pickupTime
    };
    
    // Don't await - send notification in background
    sendOrderNotification(orderData).catch(err => 
      console.error('WhatsApp notification failed:', err)
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully', 
      data: populatedOrder
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'completed';
    await order.save();

    // Note: Loyalty points are now awarded immediately when order is placed,
    // so we don't need to award them again when completing the order

    res.json({ message: 'Order completed', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // Note: Loyalty points are now awarded immediately when order is placed,
    // so we don't need to award them again when completing the order

    res.json({ message: `Order ${status} successfully`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Ensure authenticated user can only access their own orders
    if (req.user && req.user.studentId !== studentId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - can only view your own orders' 
      });
    }
    
    const orders = await Order.find({ student: studentId })
      .populate('items.foodItem')
      .populate('student', 'name email loyaltyPoints')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  completeOrder,
  updateOrderStatus,
  getOrdersByStudent
};