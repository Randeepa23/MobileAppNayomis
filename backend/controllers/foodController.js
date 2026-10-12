const FoodItem = require('../models/FoodItem');

const addFoodItem = async (req, res) => {
  try {
    const { name, price, description, category, availableDays } = req.body;
    
    const foodItem = new FoodItem({
      name,
      price,
      description,
      category,
      availableDays: availableDays || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      }
    });

    await foodItem.save();
    res.status(201).json({ message: 'Food item added successfully', foodItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFoodPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const foodItem = await FoodItem.findByIdAndUpdate(
      id,
      { price },
      { new: true }
    );

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({ message: 'Price updated successfully', foodItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const foodItem = await FoodItem.findByIdAndUpdate(
      id,
      { available: isAvailable },
      { new: true }
    );

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({ message: 'Availability updated successfully', foodItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFoodList = async (req, res) => {
  try {
    const { day } = req.query;
    const foodItems = await FoodItem.find();
    
    if (day) {
      const dayKey = day.toLowerCase();
      const filteredItems = foodItems.map(item => {
        const isAvailableToday = item.availableDays[dayKey] && item.available;
        
        if (!isAvailableToday) {
          return {
            ...item.toObject(),
            isAvailable: false,
            disabled: true,
            message: "This item is not ready for that day"
          };
        }
        
        return {
          ...item.toObject(),
          isAvailable: item.available,
          disabled: false
        };
      });
      
      return res.json(filteredItems);
    }
    
    // Add isAvailable field for consistency
    const formattedItems = foodItems.map(item => ({
      ...item.toObject(),
      isAvailable: item.available
    }));
    
    res.json(formattedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFoodByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const dayKey = day.toLowerCase();
    
    const foodItems = await FoodItem.find();
    const availableItems = [];
    const unavailableItems = [];
    
    foodItems.forEach(item => {
      const isAvailableToday = item.availableDays[dayKey] && item.available;
      
      if (isAvailableToday) {
        availableItems.push(item);
      } else {
        unavailableItems.push({
          ...item.toObject(),
          message: "This item is not ready for that day"
        });
      }
    });
    
    res.json({ 
      available: availableItems,
      unavailable: unavailableItems 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, isAvailable, availableDays } = req.body;

    const updateData = {
      name, 
      price, 
      description, 
      category, 
      availableDays
    };
    
    // Handle isAvailable parameter
    if (isAvailable !== undefined) {
      updateData.available = isAvailable;
    }

    const foodItem = await FoodItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({ message: 'Food item updated successfully', foodItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const foodItem = await FoodItem.findByIdAndDelete(id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const foodItem = await FoodItem.findById(id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({ foodItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFoodItem,
  updateFoodPrice,
  updateFoodItem,
  deleteFoodItem,
  getFoodById,
  toggleAvailability,
  getFoodList,
  getFoodByDay
};