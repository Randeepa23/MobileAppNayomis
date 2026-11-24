const express = require('express');
const { 
  addFoodItem, 
  updateFoodPrice, 
  updateFoodItem, 
  deleteFoodItem, 
  getFoodById, 
  toggleAvailability, 
  bulkUpdateAvailability,
  getFoodList, 
  getFoodByDay 
} = require('../controllers/foodController');

const router = express.Router();

router.post('/', addFoodItem);
router.post('/add', addFoodItem);
router.get('/', getFoodList);
router.put('/bulk-availability', bulkUpdateAvailability);
router.get('/:id', getFoodById);
router.put('/:id', updateFoodItem);
router.put('/price/:id', updateFoodPrice);
router.put('/availability/:id', toggleAvailability);
router.delete('/:id', deleteFoodItem);
router.get('/day/:day', getFoodByDay);

module.exports = router;