const Student = require('../models/Student');
const Order = require('../models/Order');
const Review = require('../models/Review');
const FoodItem = require('../models/FoodItem');
const Admin = require('../models/Admin');

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', admin: { id: admin._id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: { students } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Order.find()
      .populate('student', 'name email school')
      .populate('items.foodItem', 'name price')
      .sort({ createdAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const orders = await query;
    res.json({ success: true, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLoyaltyPointsReport = async (req, res) => {
  try {
    // Get students with their order data
    const students = await Student.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'student',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: { $cond: [{ $eq: ['$$order.status', 'completed'] }, '$$order.total', 0] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          loyaltyPoints: 1,
          orderCount: 1,
          totalSpent: 1
        }
      },
      {
        $sort: { loyaltyPoints: -1 }
      }
    ]);
    
    const totalPointsIssued = students.reduce((sum, student) => sum + (student.loyaltyPoints || 0), 0);
    
    res.json({ 
      success: true,
      data: {
        students, 
        totalPointsIssued,
        totalStudents: students.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('student', 'name email')
      .populate('foodItem', 'name')
      .populate('order', 'createdAt total')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalFoodItems = await FoodItem.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Calculate total revenue from completed and delivered orders
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ 
      createdAt: { $gte: today } 
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalOrders,
        totalFoods: totalFoodItems,
        totalReviews,
        completedOrders,
        pendingOrders,
        todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  adminLogin,
  getAllStudents,
  getAllOrders,
  getLoyaltyPointsReport,
  getAllReviews,
  getDashboardStats
};