import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Clock,
  ChefHat,
  CheckCircle,
  Truck,
  TrendingUp,
  TrendingDown,
  LogOut,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  Eye,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Plus
} from 'lucide-react';
import { apiService } from '@/services/api';
import { Order, Student, Food } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const EnhancedAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | Order['status']>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedTab, setSelectedTab] = useState('overview');

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logoutAdmin, adminEmail } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  // Fetch dashboard stats with auto-refresh
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiService.getStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch stats');
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch all orders with real-time updates
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiService.getAllOrders();
      if (response.success && response.data) {
        return response.data.orders;
      }
      throw new Error(response.message || 'Failed to fetch orders');
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const response = await apiService.getAllStudents();
      if (response.success && response.data) {
        return response.data.students;
      }
      throw new Error(response.message || 'Failed to fetch students');
    },
    refetchInterval: 15000,
  });

  // Fetch menu items
  const { data: foods, isLoading: foodsLoading } = useQuery({
    queryKey: ['admin-foods'],
    queryFn: async () => {
      const response = await apiService.getFoods();
      if (response.success && response.data) {
        return response.data.foods;
      }
      throw new Error(response.message || 'Failed to fetch foods');
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      return await apiService.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: '✅ Order updated',
        description: 'Order status has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    },
  });

  // Filter orders based on selected filters
  const filteredOrders = orders?.filter((order: Order) => {
    // Filter by status
    if (orderFilter !== 'all' && order.status !== orderFilter) return false;
    
    // Filter by search term
    if (searchTerm) {
      const studentName = (order as any).student?.name || order.studentName || '';
      const orderId = order._id.slice(-6).toUpperCase();
      const searchLower = searchTerm.toLowerCase();
      
      if (
        !studentName.toLowerCase().includes(searchLower) &&
        !orderId.includes(searchTerm.toUpperCase())
      ) {
        return false;
      }
    }
    
    // Filter by date range
    if (dateRange !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - orderDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      if (dateRange === 'today' && diffDays > 1) return false;
      if (dateRange === 'week' && diffDays > 7) return false;
      if (dateRange === 'month' && diffDays > 30) return false;
    }
    
    return true;
  });

  // Calculate additional stats
  const pendingOrders = orders?.filter((o: Order) => o.status === 'pending').length || 0;
  const preparingOrders = orders?.filter((o: Order) => o.status === 'preparing').length || 0;
  const readyOrders = orders?.filter((o: Order) => o.status === 'ready').length || 0;
  const todayOrders = orders?.filter((o: Order) => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length || 0;

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-amber-500 hover:bg-amber-600',
      preparing: 'bg-blue-500 hover:bg-blue-600',
      ready: 'bg-green-500 hover:bg-green-600',
      delivered: 'bg-gray-500 hover:bg-gray-600',
      cancelled: 'bg-red-500 hover:bg-red-600',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: Order['status']) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      preparing: <ChefHat className="h-4 w-4" />,
      ready: <CheckCircle className="h-4 w-4" />,
      delivered: <Truck className="h-4 w-4" />,
      cancelled: <AlertCircle className="h-4 w-4" />,
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const handleQuickStatusUpdate = (orderId: string, status: Order['status']) => {
    updateOrderMutation.mutate({ orderId, status });
  };

  const handleRefresh = () => {
    refetchStats();
    refetchOrders();
    toast({
      title: 'Refreshed',
      description: 'Dashboard data has been updated.',
    });
  };

  const handleExportOrders = () => {
    // Export orders to CSV
    const csvContent = [
      ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].join(','),
      ...(filteredOrders || []).map((order: Order) => 
        [
          order._id,
          (order as any).student?.name || 'Guest',
          order.items.length,
          order.total,
          order.status,
          new Date(order.createdAt).toISOString()
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString()}.csv`;
    a.click();

    toast({
      title: 'Export Successful',
      description: 'Orders have been exported to CSV.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with Gradient */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <BarChart3 className="h-8 w-8" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                {adminEmail && `Logged in as: ${adminEmail}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-red-500/20 border-red-300/30 text-white hover:bg-red-500/30 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  Rs. {stats?.totalRevenue?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </div>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-2">
                  <Activity className="h-3 w-3" />
                  {todayOrders} orders today
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Customers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.totalStudents || 0}
                </div>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  Growing customer base
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {pendingOrders}
                </div>
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                  <Bell className="h-3 w-3" />
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Order Status Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Preparing</p>
                  <p className="text-2xl font-bold text-blue-900">{preparingOrders}</p>
                </div>
                <ChefHat className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Ready for Pickup</p>
                  <p className="text-2xl font-bold text-green-900">{readyOrders}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Menu Items</p>
                  <p className="text-2xl font-bold text-purple-900">{stats?.totalFoods || 0}</p>
                </div>
                <Package className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Menu
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Orders Activity
                  </CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {orders?.slice(0, 10).map((order: Order) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                            <div>
                              <p className="font-medium text-sm">
                                {(order as any).student?.name || 'Guest'}
                              </p>
                              <p className="text-xs text-gray-500">
                                #{order._id.slice(-6).toUpperCase()} • {order.items.length} items
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">Rs. {order.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(order.createdAt), 'HH:mm')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Top Customers
                  </CardTitle>
                  <CardDescription>Customers by loyalty points</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {students
                        ?.sort((a: Student, b: Student) => (b.points || 0) - (a.points || 0))
                        .slice(0, 10)
                        .map((student: Student, index: number) => (
                          <motion.div
                            key={student._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              {student.points || 0} pts
                            </Badge>
                          </motion.div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>View and manage all customer orders</CardDescription>
                  </div>
                  <Button onClick={handleExportOrders} variant="outline" className="w-full md:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export Orders
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {/* Search */}
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by order ID or customer name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={orderFilter} onValueChange={(value: any) => setOrderFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Range Filter */}
                  <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders List */}
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredOrders?.map((order: Order) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="font-mono">
                                  #{order._id.slice(-6).toUpperCase()}
                                </Badge>
                                <Badge className={`${getStatusColor(order.status)} text-white`}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    <span className="capitalize">{order.status}</span>
                                  </div>
                                </Badge>
                              </div>
                              <p className="font-semibold text-lg">
                                {(order as any).student?.name || order.studentName || 'Guest'}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  {order.items.length} items
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(order.createdAt), 'PPp')}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  Rs. {order.total.toFixed(2)}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {order.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleQuickStatusUpdate(order._id, 'preparing')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <ChefHat className="h-4 w-4 mr-1" />
                                    Start Preparing
                                  </Button>
                                )}
                                {order.status === 'preparing' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleQuickStatusUpdate(order._id, 'ready')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Ready
                                  </Button>
                                )}
                                {order.status === 'ready' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleQuickStatusUpdate(order._id, 'delivered')}
                                    className="bg-gray-600 hover:bg-gray-700"
                                  >
                                    <Truck className="h-4 w-4 mr-1" />
                                    Mark Delivered
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-semibold mb-2">Order Items:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                                >
                                  <span className="text-gray-700">
                                    {item.foodName || `Item ${item.foodId.slice(-6)}`}
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {item.quantity}x Rs. {item.price.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredOrders?.length === 0 && (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No orders found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  View and manage customer accounts and loyalty points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {students?.map((student: Student) => (
                      <div
                        key={student._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{student.name}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {student.email}
                              </p>
                              {student.school && (
                                <p className="text-sm text-gray-600">
                                  School: {student.school}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                              {student.points || 0} Points
                            </Badge>
                            <p className="text-xs text-gray-500 mt-2">
                              {student.orders?.length || 0} orders
                            </p>
                            <p className="text-xs text-gray-400">
                              Joined {format(new Date(student.createdAt), 'PP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Menu Management</CardTitle>
                    <CardDescription>Manage your restaurant menu items</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {foods?.map((food: Food) => (
                      <Card key={food._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{food.name}</h4>
                                <Badge variant="outline" className="mt-1">
                                  {food.category}
                                </Badge>
                              </div>
                              <Badge variant={food.available ? "default" : "destructive"}>
                                {food.available ? 'Available' : 'Out of Stock'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{food.description}</p>
                            <div className="flex justify-between items-center pt-3 border-t">
                              <span className="text-2xl font-bold text-blue-600">
                                Rs. {food.price.toFixed(2)}
                              </span>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
