const Review = require('../models/Review');
const Order = require('../models/Order');

const submitReview = async (req, res) => {
  try {
    const { foodItemId, orderId, rating, comment } = req.body;
    const studentId = req.customer?.studentId;
    
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const order = await Order.findById(orderId);
    if (!order || order.student.toString() !== studentId) {
      return res.status(404).json({ success: false, message: 'Order not found or not authorized' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed orders' });
    }

    const existingReview = await Review.findOne({ 
      student: studentId, 
      foodItem: foodItemId, 
      order: orderId 
    });
    
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already submitted for this item' });
    }

    const review = new Review({
      student: studentId,
      foodItem: foodItemId,
      order: orderId,
      rating,
      comment
    });

    await review.save();
    
    const populatedReview = await Review.findById(review._id)
      .populate('student', 'name')
      .populate('foodItem', 'name');

    res.status(201).json({ 
      success: true, 
      message: 'Review submitted successfully', 
      data: { review: populatedReview } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('student', 'name')
      .populate('foodItem', 'name')
      .populate('order', 'createdAt')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewsByFood = async (req, res) => {
  try {
    const { foodItemId } = req.params;
    
    const reviews = await Review.find({ foodItem: foodItemId })
      .populate('student', 'name')
      .populate('foodItem', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitReview,
  getAllReviews,
  getReviewsByFood
};
