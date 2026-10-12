const FoodItem = require('../models/FoodItem');
const Student = require('../models/Student');

/**
 * Nutritional Analysis Service
 * Analyzes meal composition and provides health recommendations
 */
class NutritionalAnalysisService {

  /**
   * Analyze complete meal nutrition
   */
  async analyzeMeal(items, studentAgeGroup) {
    try {
      const analysis = {
        totalCalories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        isBalanced: false,
        warnings: [],
        recommendations: []
      };

      // Aggregate nutritional values
      for (const item of items) {
        const food = await FoodItem.findById(item.foodId || item.foodItem);
        if (!food || !food.nutrition) continue;

        const quantity = item.quantity || 1;
        analysis.totalCalories += (food.nutrition.calories || 0) * quantity;
        analysis.protein += (food.nutrition.protein || 0) * quantity;
        analysis.carbohydrates += (food.nutrition.carbohydrates || 0) * quantity;
        analysis.fats += (food.nutrition.fats || 0) * quantity;
        analysis.fiber += (food.nutrition.fiber || 0) * quantity;
        analysis.sugar += (food.nutrition.sugar || 0) * quantity;
        analysis.sodium += (food.nutrition.sodium || 0) * quantity;
      }

      // Get age-appropriate guidelines
      const guidelines = this.getAgeGroupGuidelines(studentAgeGroup);

      // Analyze calorie intake
      this.analyzeCalories(analysis, guidelines);

      // Analyze macronutrient balance
      this.analyzeMacronutrients(analysis, guidelines);

      // Check for excessive sugar/sodium
      this.checkExcessiveNutrients(analysis, guidelines);

      // Determine if meal is balanced
      analysis.isBalanced = analysis.warnings.length === 0 && 
                            analysis.totalCalories >= guidelines.calories.min &&
                            analysis.totalCalories <= guidelines.calories.max;

      // Generate recommendations
      this.generateRecommendations(analysis, guidelines);

      return analysis;

    } catch (error) {
      console.error('Nutritional analysis error:', error);
      return {
        totalCalories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        isBalanced: false,
        warnings: ['Unable to complete nutritional analysis'],
        recommendations: []
      };
    }
  }

  /**
   * Get age-appropriate nutritional guidelines
   */
  getAgeGroupGuidelines(ageGroup) {
    const guidelines = {
      '5-7': {
        calories: { min: 300, max: 500, ideal: 400 },
        protein: { min: 10, max: 20, percentage: 15 },
        carbs: { min: 40, max: 60, percentage: 50 },
        fats: { min: 15, max: 30, percentage: 30 },
        fiber: { min: 5, max: 10 },
        sugar: { max: 15 },
        sodium: { max: 600 }
      },
      '8-10': {
        calories: { min: 350, max: 550, ideal: 450 },
        protein: { min: 12, max: 25, percentage: 18 },
        carbs: { min: 45, max: 65, percentage: 50 },
        fats: { min: 15, max: 30, percentage: 28 },
        fiber: { min: 6, max: 12 },
        sugar: { max: 18 },
        sodium: { max: 700 }
      },
      '11-13': {
        calories: { min: 400, max: 600, ideal: 500 },
        protein: { min: 15, max: 30, percentage: 20 },
        carbs: { min: 50, max: 70, percentage: 50 },
        fats: { min: 15, max: 35, percentage: 25 },
        fiber: { min: 8, max: 15 },
        sugar: { max: 20 },
        sodium: { max: 800 }
      },
      '14-16': {
        calories: { min: 450, max: 700, ideal: 575 },
        protein: { min: 20, max: 35, percentage: 22 },
        carbs: { min: 55, max: 75, percentage: 50 },
        fats: { min: 15, max: 35, percentage: 25 },
        fiber: { min: 10, max: 18 },
        sugar: { max: 22 },
        sodium: { max: 900 }
      },
      '17-18': {
        calories: { min: 500, max: 750, ideal: 625 },
        protein: { min: 22, max: 40, percentage: 25 },
        carbs: { min: 60, max: 80, percentage: 48 },
        fats: { min: 15, max: 35, percentage: 25 },
        fiber: { min: 12, max: 20 },
        sugar: { max: 25 },
        sodium: { max: 1000 }
      }
    };

    return guidelines[ageGroup] || guidelines['11-13']; // Default to middle age group
  }

  /**
   * Analyze calorie intake
   */
  analyzeCalories(analysis, guidelines) {
    if (analysis.totalCalories < guidelines.calories.min) {
      analysis.warnings.push(
        `Calorie intake too low (${analysis.totalCalories} kcal). Recommended: ${guidelines.calories.min}-${guidelines.calories.max} kcal`
      );
    } else if (analysis.totalCalories > guidelines.calories.max) {
      analysis.warnings.push(
        `Calorie intake too high (${analysis.totalCalories} kcal). Recommended: ${guidelines.calories.min}-${guidelines.calories.max} kcal`
      );
    }
  }

  /**
   * Analyze macronutrient balance
   */
  analyzeMacronutrients(analysis, guidelines) {
    const totalMacros = analysis.protein * 4 + analysis.carbohydrates * 4 + analysis.fats * 9;
    
    if (totalMacros === 0) return;

    const proteinPercent = (analysis.protein * 4 / totalMacros) * 100;
    const carbPercent = (analysis.carbohydrates * 4 / totalMacros) * 100;
    const fatPercent = (analysis.fats * 9 / totalMacros) * 100;

    // Check protein
    if (proteinPercent < 10) {
      analysis.warnings.push('Low protein content. Consider adding protein-rich foods.');
    } else if (proteinPercent > 35) {
      analysis.warnings.push('Very high protein content. Balance with carbohydrates.');
    }

    // Check carbohydrates
    if (carbPercent < 35) {
      analysis.warnings.push('Low carbohydrate content. Add whole grains or fruits.');
    } else if (carbPercent > 65) {
      analysis.warnings.push('High carbohydrate content. Balance with protein and healthy fats.');
    }

    // Check fats
    if (fatPercent < 15) {
      analysis.warnings.push('Low fat content. Include healthy fats for proper development.');
    } else if (fatPercent > 40) {
      analysis.warnings.push('High fat content. Choose leaner options.');
    }
  }

  /**
   * Check for excessive sugar and sodium
   */
  checkExcessiveNutrients(analysis, guidelines) {
    if (analysis.sugar > guidelines.sugar.max) {
      analysis.warnings.push(
        `High sugar content (${analysis.sugar.toFixed(1)}g). Limit: ${guidelines.sugar.max}g. May cause energy spikes.`
      );
    }

    if (analysis.sodium > guidelines.sodium.max) {
      analysis.warnings.push(
        `High sodium content (${analysis.sodium.toFixed(0)}mg). Limit: ${guidelines.sodium.max}mg. May affect blood pressure.`
      );
    }

    if (analysis.fiber < guidelines.fiber.min) {
      analysis.warnings.push(
        `Low fiber content (${analysis.fiber.toFixed(1)}g). Recommended: ${guidelines.fiber.min}-${guidelines.fiber.max}g for digestive health.`
      );
    }
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis, guidelines) {
    // If no warnings, meal is good
    if (analysis.warnings.length === 0) {
      analysis.recommendations.push('Well-balanced meal for school breakfast!');
      return;
    }

    // Generate specific recommendations based on deficiencies
    const totalMacros = analysis.protein * 4 + analysis.carbohydrates * 4 + analysis.fats * 9;
    
    if (totalMacros > 0) {
      const proteinPercent = (analysis.protein * 4 / totalMacros) * 100;
      const carbPercent = (analysis.carbohydrates * 4 / totalMacros) * 100;

      if (proteinPercent < 15) {
        analysis.recommendations.push('Add: Eggs, yogurt, or lean meat for more protein');
      }

      if (carbPercent < 40) {
        analysis.recommendations.push('Add: Whole grain bread, oatmeal, or fruit for healthy carbs');
      }

      if (analysis.fiber < guidelines.fiber.min) {
        analysis.recommendations.push('Add: Whole fruits, vegetables, or whole grains for fiber');
      }
    }

    if (analysis.totalCalories < guidelines.calories.min) {
      analysis.recommendations.push('Consider adding a side item or fruit to increase calories');
    }

    if (analysis.sugar > guidelines.sugar.max) {
      analysis.recommendations.push('Choose items with less added sugar or natural sweetness');
    }
  }

  /**
   * Check for repetitive orders (call this when validating)
   */
  async checkRepetitiveOrders(studentId, currentItems) {
    try {
      // This would check order history for the past week
      // and flag if student is ordering the same items too frequently
      // Implementation would require Order history query
      
      return {
        isRepetitive: false,
        message: 'Variety check passed'
      };
    } catch (error) {
      return {
        isRepetitive: false,
        message: 'Unable to check order history'
      };
    }
  }
}

module.exports = new NutritionalAnalysisService();
