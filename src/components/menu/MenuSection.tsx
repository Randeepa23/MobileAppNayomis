import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Plus, Minus, X, LogIn } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { menuItems } from '@/data/menuItems';

export const MenuSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, cart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
    return ['All', ...uniqueCategories.sort()];
  }, []);

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory && item.available;
    });
  }, [searchTerm, selectedCategory]);

  const updateQuantity = (itemName: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantities(prev => ({
      ...prev,
      [itemName]: newQuantity
    }));
  };

  const handleAddToCart = (item: typeof menuItems[0]) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    const quantity = quantities[item.name] || 1;
    
    // Create a Food object that matches the expected type
    const foodItem: any = {
      _id: item.name.toLowerCase().replace(/\s+/g, '-'),
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      available: item.available,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToCart(foodItem, quantity);
    setQuantities(prev => ({ ...prev, [item.name]: 1 }));

    toast({
      title: '✓ Added to cart!',
      description: `${quantity}x ${item.name} added to your cart.`,
      duration: 2000,
    });
  };

  const getItemInCart = (itemName: string) => {
    const id = itemName.toLowerCase().replace(/\s+/g, '-');
    return cart.items.find(item => item.foodId === id);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Our Menu
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover authentic Sri Lankan flavors crafted with passion and traditional recipes
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {categories.map(category => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key="items-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredItems.map((item, index) => {
                const quantity = quantities[item.name] || 1;
                const cartItem = getItemInCart(item.name);

                return (
                  <motion.div
                    key={item.name}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                      {/* Image Container */}
                      <div className="relative overflow-hidden h-56">
                        <motion.img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300?text=Food+Image';
                          }}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge */}
                        {item.badge && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                            className="absolute top-3 right-3"
                          >
                            <Badge
                              className={`${
                                item.badge === 'Popular'
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                  : item.badge === 'New'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
                              } text-white border-0 shadow-lg px-3 py-1`}
                            >
                              {item.badge}
                            </Badge>
                          </motion.div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              Rs. {item.price}
                            </span>
                          </div>
                          {cartItem && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                              {cartItem.quantity} in cart
                            </Badge>
                          )}
                        </div>

                        {/* Quantity Controls and Add to Cart - Only for authenticated users */}
                        {isAuthenticated && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.name, quantity - 1)}
                                disabled={quantity <= 1}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="px-4 py-2 font-semibold text-gray-800 min-w-[3rem] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.name, quantity + 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                            
                            <motion.button
                              onClick={() => handleAddToCart(item)}
                              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No items found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};