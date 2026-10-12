const express = require('express');
const { authenticateCustomer } = require('../middleware/customerAuth');
const { submitReview, getAllReviews, getReviewsByFood } = require('../controllers/reviewController');

const router = express.Router();

router.post('/submit', authenticateCustomer, submitReview);
router.get('/', getAllReviews);
router.get('/food/:foodItemId', getReviewsByFood);

module.exports = router;
