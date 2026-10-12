import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  Search, 
  ShoppingCart, 
  Star,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export const Favorites: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock favorites data
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: 'Chicken Fried Rice',
      description: 'Aromatic fried rice with tender chicken pieces',
      price: { small: 450, large: 650 },
      category: 'Fried Rice',
      image: '/placeholder-food.jpg',
      rating: 4.8,
      orderCount: 12
    },
    {
      id: 2,
      name: 'Seafood Noodles',
      description: 'Fresh noodles with mixed seafood and vegetables',
      price: { small: 600, large: 800 },
      category: 'Noodles',
      image: '/placeholder-food.jpg',
      rating: 4.9,
      orderCount: 8
    },
    {
      id: 3,
      name: 'Mixed Kottu',
      description: 'Traditional Sri Lankan kottu with mixed proteins',
      price: { small: 500, large: 750 },
      category: 'Kottu',
      image: '/placeholder-food.jpg',
      rating: 4.7,
      orderCount: 15
    },
    {
      id: 4,
      name: 'Fresh Mango Juice',
      description: 'Freshly squeezed tropical mango juice',
      price: { small: 200, large: 300 },
      category: 'Beverages',
      image: '/placeholder-food.jpg',
      rating: 4.6,
      orderCount: 20
    }
  ]);

  const filteredFavorites = favorites.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveFavorite = (id: number) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from favorites');
  };

  const handleAddToCart = (item: any) => {
    // TODO: Implement add to cart functionality
    toast.success(`Added ${item.name} to cart`);
  };

  const handleOrderAgain = (item: any) => {
    // TODO: Implement order again functionality
    toast.success(`Added ${item.name} to cart with your usual preferences`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Favorites</h2>
        <p className="text-gray-600">Quick access to your most-loved menu items</p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search your favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveFavorite(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2" variant="secondary">
                    {item.category}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{item.rating}</span>
                        <span className="text-sm text-gray-500">({item.orderCount} orders)</span>
                      </div>
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-semibold">Rs.{item.price.small}</span>
                        {item.price.large && (
                          <span className="text-sm text-gray-500 ml-2">
                            / Rs.{item.price.large}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => handleOrderAgain(item)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Order Again
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="text-center py-12">
              {favorites.length === 0 ? (
                <>
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start adding items to your favorites by clicking the heart icon on menu items.
                  </p>
                  <Button>Browse Menu</Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No matching favorites
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Favorites Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{favorites.length}</div>
                  <div className="text-sm text-blue-800">Total Favorites</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {favorites.reduce((sum, item) => sum + item.orderCount, 0)}
                  </div>
                  <div className="text-sm text-green-800">Times Ordered</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {(favorites.reduce((sum, item) => sum + item.rating, 0) / favorites.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-yellow-800">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};