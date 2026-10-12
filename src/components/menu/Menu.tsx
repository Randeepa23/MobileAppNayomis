import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { apiService } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { Food } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface MenuProps {
  searchTerm?: string;
  selectedCategory?: string;
}

export const Menu: React.FC<MenuProps> = ({ searchTerm = '', selectedCategory = 'All' }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, cart } = useCart();
  const { toast } = useToast();

  const { data: foodsResponse, isLoading, error } = useQuery({
    queryKey: ['foods'],
    queryFn: async () => {
      const response = await apiService.getFoods();
      if (response.success && response.data) {
        return response.data.foods;
      }
      throw new Error(response.message || 'Failed to fetch foods');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 20000, // Auto-refresh every 20 seconds to sync with admin changes
  });

  // Filter foods based on search and category
  const filteredFoods = React.useMemo(() => {
    if (!foodsResponse) return [];
    
    return foodsResponse.filter((food: Food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          food.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || 
                            food.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory && food.available;
    });
  }, [foodsResponse, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = React.useMemo(() => {
    if (!foodsResponse) return ['All'];
    const uniqueCategories = Array.from(new Set(foodsResponse.map((food: Food) => food.category)));
    return ['All', ...uniqueCategories];
  }, [foodsResponse]);

  const updateQuantity = (foodId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantities(prev => ({
      ...prev,
      [foodId]: newQuantity
    }));
  };

  const handleAddToCart = (food: Food) => {
    const quantity = quantities[food._id] || 1;
    addToCart(food, quantity);
    setQuantities(prev => ({ ...prev, [food._id]: 0 }));
    
    toast({
      title: "Added to cart!",
      description: `${quantity}x ${food.name} added to your cart.`,
    });
  };

  const getItemInCart = (foodId: string) => {
    return cart.items.find(item => item.foodId === foodId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden group">
            <Skeleton className="h-56 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load menu items. Please try again.</p>
      </div>
    );
  }

  if (filteredFoods.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg text-gray-500">No menu items found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or category filter</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      <AnimatePresence mode="popLayout">
        {filteredFoods.map((food: Food) => {
          const quantity = quantities[food._id] || 1;
          const cartItem = getItemInCart(food._id);

          return (
            <motion.div
              key={food._id}
              variants={cardVariants}
              layout
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            >
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
                {/* Food Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                    🍽️
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Category Badge */}
                  <Badge 
                    className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-gray-800 border-0 shadow-lg font-semibold"
                  >
                    {food.category}
                  </Badge>

                  {/* Cart Indicator */}
                  {cartItem && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4"
                    >
                      <Badge className="bg-green-500 text-white border-0 shadow-lg">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {cartItem.quantity}
                      </Badge>
                    </motion.div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <span className="text-xl font-bold text-orange-600">
                      Rs.{food.price}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {food.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-6 leading-relaxed">
                    {food.description}
                  </p>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(food._id, quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-700" />
                      </motion.button>
                      
                      <span className="font-bold text-lg min-w-[2rem] text-center text-gray-900">
                        {quantity}
                      </span>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(food._id, quantity + 1)}
                        className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-700" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(food)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add Rs.{(food.price * quantity).toFixed(0)}</span>
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};