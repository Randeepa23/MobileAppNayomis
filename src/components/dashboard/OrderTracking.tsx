import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Order } from '@/types';

interface PopulatedFoodItem {
  _id?: string;
  name?: string;
  price?: number;
  category?: string;
}

interface TrackingOrderItem {
  foodId?: string;
  foodName?: string;
  foodItem?: string | PopulatedFoodItem;
  quantity: number;
  price?: number;
}

interface TrackingOrder extends Omit<Order, 'items' | 'status'> {
  items: TrackingOrderItem[];
  status: string;
  pickupLocation?: string;
  pickupTime?: string;
  deliveryDate?: string;
  payment?: {
    method?: string;
    status?: string;
  };
}

interface OrderTrackingProps {
  active?: boolean;
}

const ACTIVE_STATUSES = ['pending', 'validated', 'confirmed', 'preparing', 'ready', 'dispatched'];
const HISTORY_STATUSES = ['delivered', 'completed', 'cancelled', 'rejected'];
const PROGRESS_STEPS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'dispatched', label: 'On the way' },
];

const getItemName = (item: TrackingOrderItem) => {
  if (item.foodName) return item.foodName;
  if (typeof item.foodItem === 'object' && item.foodItem?.name) return item.foodItem.name;
  return 'Menu item';
};

const getItemPrice = (item: TrackingOrderItem) => {
  if (typeof item.price === 'number') return item.price;
  if (typeof item.foodItem === 'object' && typeof item.foodItem?.price === 'number') {
    return item.foodItem.price;
  }
  return null;
};

const formatCurrency = (value: number) => `Rs. ${value.toLocaleString('en-LK')}`;

const formatDate = (value?: string, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString('en-LK', options);
};

const formatTime = (value?: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit' });
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending confirmation';
    case 'validated': return 'Validated';
    case 'confirmed': return 'Confirmed';
    case 'preparing': return 'Preparing';
    case 'ready': return 'Ready for pickup';
    case 'dispatched': return 'On the way';
    case 'delivered': return 'Delivered';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'rejected': return 'Rejected';
    default: return status;
  }
};

const statusClasses = (status: string) => {
  switch (status) {
    case 'pending':
    case 'validated':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'confirmed':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'preparing':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'ready':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'dispatched':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    case 'delivered':
    case 'completed':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    case 'cancelled':
    case 'rejected':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'validated':
      return <CheckCircle className="h-4 w-4" />;
    case 'preparing':
      return <ShoppingBag className="h-4 w-4" />;
    case 'ready':
      return <PackageCheck className="h-4 w-4" />;
    case 'dispatched':
    case 'delivered':
      return <Truck className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
    case 'rejected':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const progressIndex = (status: string) => {
  if (['pending', 'validated', 'confirmed'].includes(status)) return 0;
  if (status === 'preparing') return 1;
  if (status === 'ready') return 2;
  if (['dispatched', 'delivered', 'completed'].includes(status)) return 3;
  return -1;
};

const OrderItems: React.FC<{ items: TrackingOrderItem[] }> = ({ items }) => (
  <div className="space-y-2">
    {items.map((item, index) => {
      const unitPrice = getItemPrice(item);
      const lineTotal = unitPrice == null ? null : unitPrice * item.quantity;
      const foodKey = typeof item.foodItem === 'object' ? item.foodItem?._id : item.foodItem;
      return (
        <div
          key={foodKey || item.foodId || index}
          className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{getItemName(item)}</p>
            <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-gray-800">
            {lineTotal == null ? 'Included' : formatCurrency(lineTotal)}
          </span>
        </div>
      );
    })}
  </div>
);

const OrderProgress: React.FC<{ status: string }> = ({ status }) => {
  const currentIndex = progressIndex(status);
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Order progress</p>
        <span className="text-xs font-medium text-gray-500">Updates automatically</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PROGRESS_STEPS.map((progressStep, index) => {
          const reached = currentIndex >= index;
          const current = currentIndex === index;
          return (
            <div key={progressStep.key} className="relative flex flex-col items-center text-center">
              {index > 0 && (
                <div
                  className={`absolute right-1/2 top-3 h-0.5 w-full ${
                    currentIndex >= index ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  reached
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                } ${current ? 'ring-4 ring-orange-100' : ''}`}
              >
                {reached ? <CheckCircle className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
              <span className={`mt-2 text-[11px] font-medium sm:text-xs ${reached ? 'text-orange-700' : 'text-gray-500'}`}>
                {progressStep.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({ active = true }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const fetchOrders = useCallback(async (showInitialLoader = false, showRefreshIndicator = true) => {
    if (!user?._id) return;
    if (showInitialLoader) setIsLoading(true);
    else if (showRefreshIndicator) setIsRefreshing(true);

    try {
      const response = await apiService.getStudentOrders(user._id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Unable to load your orders.');
      }
      setOrders((response.data.orders || []) as TrackingOrder[]);
      setLoadError('');
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoadError(error instanceof Error ? error.message : 'Unable to load your orders.');
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!active || isAuthLoading) return;

    if (!user?._id) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    fetchOrders(true);
    const refreshInterval = window.setInterval(() => fetchOrders(false, false), 10000);
    return () => window.clearInterval(refreshInterval);
  }, [active, fetchOrders, isAuthLoading, user?._id]);

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.includes(order.status)),
    [orders],
  );
  const orderHistory = useMemo(
    () => orders.filter((order) => HISTORY_STATUSES.includes(order.status)),
    [orders],
  );
  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return orderHistory;
    return orderHistory.filter((order) => (
      order._id.toLowerCase().includes(query)
      || order.pickupLocation?.toLowerCase().includes(query)
      || order.items.some((item) => getItemName(item).toLowerCase().includes(query))
    ));
  }, [orderHistory, searchTerm]);

  if (isAuthLoading || (active && isLoading)) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-orange-500" />
          <p className="font-medium text-gray-700">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[360px] items-center justify-center p-6">
        <Card className="w-full max-w-lg border-dashed border-orange-200 bg-orange-50/30 shadow-none">
          <CardContent className="px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sign in to view your pre-orders</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
              Your active orders and order history are securely linked to your account.
            </p>
            <Button
              type="button"
              onClick={() => navigate('/pre-order?auth=login')}
              className="mt-5 bg-orange-600 text-white hover:bg-orange-700"
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">Order Tracking</h2>
            <p className="mt-1 text-sm text-gray-600">Follow active orders and revisit your previous purchases.</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(false)}
          disabled={isRefreshing}
          className="self-start border-orange-200 text-orange-700 hover:bg-orange-50 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loadError && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => fetchOrders(false)}>
            Try again
          </Button>
        </div>
      )}

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="active"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm"
          >
            Active Orders
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
              {activeOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm"
          >
            Order History
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
              {orderHistory.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length > 0 ? (
            activeOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.06, 0.24) }}
              >
                <Card className="overflow-hidden border-gray-200 shadow-sm">
                  <div className="border-b border-gray-100 bg-white p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-xl font-bold text-gray-900">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </h3>
                            <Badge className={`gap-1 border font-medium shadow-none ${statusClasses(order.status)}`}>
                              {statusIcon(order.status)}
                              {statusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Placed {formatDate(order.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })} at {formatTime(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-4 py-2 text-left sm:text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Order total</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="space-y-5 p-5 sm:p-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Delivery date</p>
                          <p className="mt-0.5 text-sm font-semibold text-gray-900">
                            {formatDate(order.deliveryDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Pickup time</p>
                          <p className="mt-0.5 text-sm font-semibold text-gray-900">{order.pickupTime || 'Not available'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500">Pickup point</p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                            {order.pickupLocation || 'Not available'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">Your items</h4>
                        <span className="text-xs text-gray-500">
                          {order.items.reduce((total, item) => total + item.quantity, 0)} item(s)
                        </span>
                      </div>
                      <OrderItems items={order.items} />
                    </div>

                    <OrderProgress status={order.status} />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border-dashed border-orange-200 bg-orange-50/30 shadow-none">
              <CardContent className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No active orders</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                  Your next order will appear here with live preparation and pickup updates.
                </p>
                <Button
                  type="button"
                  onClick={() => navigate('/menu')}
                  className="mt-5 bg-orange-600 text-white hover:bg-orange-700"
                >
                  Browse the menu
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order ID, food item or pickup point"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-11 border-gray-200 bg-white pl-10 focus-visible:ring-orange-500"
            />
          </div>

          {filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((order, index) => {
                const expanded = expandedOrderId === order._id;
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.2) }}
                  >
                    <Card className="overflow-hidden border-gray-200 shadow-sm">
                      <CardContent className="p-0">
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                              {statusIcon(order.status)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-serif text-lg font-bold text-gray-900">
                                  Order #{order._id.slice(-6).toUpperCase()}
                                </h3>
                                <Badge className={`gap-1 border font-medium shadow-none ${statusClasses(order.status)}`}>
                                  {statusLabel(order.status)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {formatDate(order.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' at '}{formatTime(order.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-gray-500">Total</p>
                              <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-expanded={expanded}
                              onClick={() => setExpandedOrderId(expanded ? null : order._id)}
                              className="border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                            >
                              {expanded ? 'Hide details' : 'View details'}
                              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        {expanded && (
                          <div className="space-y-4 border-t border-gray-100 bg-gray-50/60 p-5">
                            <div className="grid gap-3 text-sm sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-gray-500">Delivery date</p>
                                <p className="mt-1 font-medium text-gray-900">{formatDate(order.deliveryDate)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Pickup time</p>
                                <p className="mt-1 font-medium text-gray-900">{order.pickupTime || 'Not available'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Pickup point</p>
                                <p className="mt-1 font-medium text-gray-900">{order.pickupLocation || 'Not available'}</p>
                              </div>
                            </div>
                            <OrderItems items={order.items} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-gray-200 shadow-none">
              <CardContent className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchTerm ? 'No matching orders' : 'No order history yet'}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchTerm ? 'Try another order ID, food name or pickup point.' : 'Completed and cancelled orders will appear here.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
