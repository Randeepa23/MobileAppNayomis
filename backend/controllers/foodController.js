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
    let { isAvailable, day, availableDays } = req.body || {};

    const existing = await FoodItem.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (day) {
      const dayKey = day.toLowerCase();
      if (!existing.availableDays) {
        existing.availableDays = {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true
        };
      }
      const currentVal = existing.availableDays[dayKey] !== false;
      existing.availableDays[dayKey] = (isAvailable !== undefined) ? Boolean(isAvailable) : !currentVal;
      existing.markModified('availableDays');
    } else if (availableDays && typeof availableDays === 'object') {
      existing.availableDays = { ...existing.availableDays, ...availableDays };
      existing.markModified('availableDays');
    } else {
      if (isAvailable === undefined) {
        isAvailable = !existing.available;
      }
      existing.available = Boolean(isAvailable);
    }

    await existing.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      foodItem: existing,
      available: existing.available,
      availableDays: existing.availableDays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUpdateAvailability = async (req, res) => {
  try {
    const { isAvailable, day, all = true, ids } = req.body || {};
    const filter = (!all && Array.isArray(ids) && ids.length > 0) ? { _id: { $in: ids } } : {};

    if (day) {
      const dayKey = day.toLowerCase();
      const updateField = `availableDays.${dayKey}`;
      await FoodItem.updateMany(filter, { $set: { [updateField]: Boolean(isAvailable) } });
    } else {
      await FoodItem.updateMany(filter, { $set: { available: Boolean(isAvailable) } });
    }

    const updatedItems = await FoodItem.find();
    res.json({
      success: true,
      message: `Bulk availability set to ${isAvailable ? 'available' : 'unavailable'}${day ? ` for ${day}` : ''}`,
      count: updatedItems.length,
      foods: updatedItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFoodList = async (req, res) => {
  try {
    const { day, nextDay } = req.query;
    const foodItems = await FoodItem.find();

    let targetDayKey = null;
    if (day) {
      targetDayKey = day.toLowerCase();
    } else if (nextDay === 'true') {
      const target = new Date();
      target.setDate(target.getDate() + 1);
      // Skip Saturday & Sunday for school breakfast deliveries
      if (target.getDay() === 6) target.setDate(target.getDate() + 2);
      else if (target.getDay() === 0) target.setDate(target.getDate() + 1);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      targetDayKey = days[target.getDay()];
    }

    if (targetDayKey) {
      const filteredItems = foodItems.map(item => {
        const itemObj = item.toObject();
        const daysMap = itemObj.availableDays || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        };
        const isScheduled = daysMap[targetDayKey] !== false;
        const isAvailableForDay = isScheduled && itemObj.available !== false;

        return {
          ...itemObj,
          available: isAvailableForDay,
          isAvailable: isAvailableForDay,
          disabled: !isAvailableForDay,
          message: isAvailableForDay ? undefined : "This item is not scheduled for this day"
        };
      });

      return res.json(filteredItems);
    }

    // Default list
    const formattedItems = foodItems.map(item => {
      const itemObj = item.toObject();
      const isAvail = itemObj.available !== false;
      return {
        ...itemObj,
        available: isAvail,
        isAvailable: isAvail
      };
    });

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
      const daysMap = item.availableDays || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      };
      const isDayActive = daysMap[dayKey] !== false;
      const isAvailableToday = isDayActive && item.available !== false;
      
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
  bulkUpdateAvailability,
  getFoodList,
  getFoodByDay
};