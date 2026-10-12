import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Star, 
  Clock, 
  TrendingUp, 
  Heart,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Order } from '@/types';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        const response = await apiService.getStudentOrders(user._id);
        if (response.success && response.data) {
          setOrders(response.data.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch user orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?._id]);

  // Calculate stats from actual user data
  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const stats = {
    totalOrders: completedOrders.length,
    totalSpent,
    loyaltyPoints: user?.points || 0,
    favoriteItems: 0, // Could be calculated from order frequency
    averageOrderValue: completedOrders.length > 0 ? Math.round(totalSpent / completedOrders.length) : 0,
    lastOrderDate: completedOrders.length > 0 ? completedOrders[0]?.createdAt : null
  };

  const recentOrders = completedOrders.slice(0, 3).map(order => ({
    id: order._id,
    date: order.createdAt,
    items: order.items.map(item => item.foodName || 'Unknown Item'),
    total: order.total,
    status: order.status
  }));

  const getLoyaltyTier = (points: number) => {
    if (points >= 2000) return { name: 'Platinum', color: 'bg-purple-100 text-purple-800', icon: Award };
    if (points >= 1000) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: Award };
    if (points >= 500) return { name: 'Silver', color: 'bg-gray-100 text-gray-800', icon: Star };
    return { name: 'Bronze', color: 'bg-orange-100 text-orange-800', icon: Star };
  };

  const loyaltyTier = getLoyaltyTier(stats.loyaltyPoints);
  const TierIcon = loyaltyTier.icon;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Here's what's happening with your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Last order {stats.lastOrderDate}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.loyaltyPoints}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={loyaltyTier.color}>
                  <TierIcon className="h-3 w-3 mr-1" />
                  {loyaltyTier.name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg. Rs.{stats.averageOrderValue} per order
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoriteItems}</div>
              <p className="text-xs text-muted-foreground">
                Items you love most
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Orders</span>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-sm text-gray-600">
                        {order.items.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500">{order.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">Rs.{order.total}</div>
                    <Badge className="mt-1" variant="secondary">
                      {order.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-auto p-4 flex flex-col items-center space-y-2">
            <ShoppingBag className="h-6 w-6" />
            <span>Order Now</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Clock className="h-6 w-6" />
            <span>Track Orders</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Heart className="h-6 w-6" />
            <span>View Favorites</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};