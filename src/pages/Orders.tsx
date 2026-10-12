import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Package,
  Calendar,
  DollarSign
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { format } from 'date-fns';

export const Orders: React.FC = () => {
  const { user } = useAuth();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await apiService.getStudentOrders(user._id);
      if (response.success && response.data) {
        return response.data.orders;
      }
      throw new Error(response.message || 'Failed to fetch orders');
    },
    enabled: !!user?._id,
    staleTime: 30 * 1000,
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'preparing':
        return 'bg-blue-500 text-white';
      case 'ready':
        return 'bg-green-500 text-white';
      case 'delivered':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'preparing':
        return 'Being Prepared';
      case 'ready':
        return 'Ready for Pickup';
      case 'delivered':
        return 'Completed';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your order history.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your orders. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
        <p className="text-gray-600">
          Track your orders and view past purchases
        </p>
      </motion.div>

      {/* Orders List */}
      {!orders || orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500">
            Start exploring our delicious menu to place your first order!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: Order, index: number) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-200 transform hover:scale-[1.01]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(order.createdAt), 'PPP p')}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-gray-900">
                          Rs. {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Order Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <span className="font-medium text-gray-800 text-sm">
                              {item.foodName || `Item ${item.foodId.slice(-6)}`}
                            </span>
                            <span className="text-xs text-gray-600 ml-2">
                              × {item.quantity}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            Rs. {(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Order Summary */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="space-y-1">
                      {order.pointsUsed > 0 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <span>Points Used: {order.pointsUsed}</span>
                          <span>(-Rs. {(order.pointsUsed * 0.01).toFixed(2)})</span>
                        </div>
                      )}
                      {order.pointsEarned > 0 && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <span>Points Earned: +{order.pointsEarned}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-bold text-lg">Rs. {order.total.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'delivered' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="mr-2">
                        Reorder Items
                      </Button>
                      <Button variant="outline" size="sm">
                        Leave Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};