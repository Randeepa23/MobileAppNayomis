import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Truck, 
  ChevronDown, 
  ChevronUp,
  Star,
  MessageSquare
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { format } from 'date-fns';

export const OrderHistory: React.FC = () => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      try {
        const response = await apiService.getStudentOrders(user._id);
        // Handle successful response with orders
        if (response.success && response.data && response.data.orders) {
          return response.data.orders;
        }
        // Handle successful response but no orders (new user)
        if (response.success && (!response.data || !response.data.orders)) {
          return [];
        }
        // Only throw error for actual failures (not for no orders)
        if (!response.success && response.message && !response.message.includes('No orders found')) {
          throw new Error(response.message);
        }
        // Default to empty array for new users
        return [];
      } catch (err) {
        // If the error is about no orders found, return empty array
        if (err instanceof Error && err.message.includes('No orders found')) {
          return [];
        }
        // Otherwise, throw the error
        throw err;
      }
    },
    enabled: !!user?._id,
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry on errors
    initialData: [], // Default to empty array to avoid undefined
  });

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

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
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'delivered':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-gray-600">Please sign in to view your order history.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
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
    );
  }

  // Only show error if there's an actual error AND we don't have any orders data
  if (error && !orders) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 bg-red-50 rounded-2xl border-2 border-red-200"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Orders</h3>
            <p className="text-red-600">Failed to load order history. Please try again later.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200"
      >
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <ChefHat className="w-10 h-10 text-blue-600" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h3>
            <p className="text-lg text-gray-600 mb-2">Still there are no orders</p>
            <p className="text-sm text-gray-500">Start exploring our delicious menu and place your first order!</p>
          </div>
          <Button
            onClick={() => {
              const menuSection = document.getElementById('menu');
              menuSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg"
          >
            Browse Menu
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <Badge variant="secondary" className="text-sm">
          {orders.length} orders
        </Badge>
      </div>

      <AnimatePresence>
        {orders.map((order: Order) => {
          const isExpanded = expandedOrders.has(order._id);
          
          return (
            <motion.div
              key={order._id}
              variants={cardVariants}
              layout
            >
              <Card className="overflow-hidden">
                <Collapsible>
                  <CollapsibleTrigger
                    onClick={() => toggleOrderExpansion(order._id)}
                    className="w-full"
                  >
                    <CardHeader className="hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getStatusColor(order.status)} text-white`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-lg">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </CardTitle>
                            <CardDescription>
                              {format(new Date(order.createdAt), 'PPP p')}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              Rs. {order.total.toFixed(2)}
                            </p>
                          </div>
                          
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="border-t bg-gray-50">
                        {/* Order Items */}
                        <div className="space-y-3 mb-4">
                          <h4 className="font-semibold text-gray-900">Order Items</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {item.foodName || `Item ${item.foodId.slice(-6)}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                Rs. {(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t pt-4 space-y-2">
                          {order.pointsUsed > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Points Used ({order.pointsUsed})</span>
                              <span>-Rs. {(order.pointsUsed * 0.01).toFixed(2)}</span>
                            </div>
                          )}
                          
                          {order.pointsEarned > 0 && (
                            <div className="flex justify-between text-sm text-blue-600">
                              <span>Points Earned</span>
                              <span>+{order.pointsEarned} points</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>Rs. {order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {order.status === 'delivered' && (
                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Star className="h-4 w-4 mr-2" />
                              Rate & Review
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Reorder
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};