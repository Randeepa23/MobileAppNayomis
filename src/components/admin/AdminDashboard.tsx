import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Clock,
  ChefHat,
  CheckCircle,
  Truck,
  Trash2,
  Edit,
  Plus,
  TrendingUp,
  LogOut,
  AlertCircle,
  Loader2,
  FileX,
  Search,
  RefreshCw,
  Cpu,
  ShieldAlert,
  SlidersHorizontal,
  Phone
} from 'lucide-react';
import { apiService } from '@/services/api';
import { Order, Student, Food } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminDevices } from '@/components/admin/AdminDevices';
import { AdminAlerts } from '@/components/admin/AdminAlerts';

export const AdminDashboard: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    available: true
  });
  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logoutAdmin, adminEmail } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries();
    toast({
      title: 'Dashboard Refreshed',
      description: 'Synchronized latest orders, fleet, and safety telemetry.',
    });
  };

  const handleSaveStudentPhone = async () => {
    if (!editingStudent) return;
    try {
      setIsEditingPhone(true);
      const res = await apiService.updateStudentByAdmin(editingStudent.id, {
        phone: editingStudent.phone.trim(),
        telephone: editingStudent.phone.trim(),
        whatsapp: editingStudent.phone.trim(),
      } as any);
      if (res.success) {
        toast({
          title: "Telephone updated",
          description: `Updated telephone number for ${editingStudent.name}`,
        });
        queryClient.invalidateQueries({ queryKey: ['admin-students'] });
        setEditingStudent(null);
      } else {
        toast({
          title: "Update failed",
          description: res.message || "Could not update phone number",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e.message || "Could not update phone number",
        variant: "destructive",
      });
    } finally {
      setIsEditingPhone(false);
    }
  };

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, isFetching: statsFetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiService.getStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch stats');
    },
    refetchInterval: 30000,
  });

  // Fetch all orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiService.getAllOrders();
      if (response.success && response.data) {
        return response.data.orders;
      }
      throw new Error(response.message || 'Failed to fetch orders');
    },
    refetchInterval: 10000,
  });

  // Fetch all students
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

  // Fetch all foods
  const { data: foods, isLoading: foodsLoading } = useQuery({
    queryKey: ['admin-foods'],
    queryFn: async () => {
      const response = await apiService.getFoods();
      if (Array.isArray(response)) {
        return response;
      }
      if (response && response.success && response.data) {
        return response.data.foods || (Array.isArray(response.data) ? response.data : []);
      }
      if (response && (response as any).foods && Array.isArray((response as any).foods)) {
        return (response as any).foods;
      }
      return [];
    },
    refetchInterval: 20000,
  });

  const [selectedMenuDay, setSelectedMenuDay] = useState<string>('tomorrow');

  const { nextSchoolDayKey, nextSchoolDayName } = useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    // If next day is Saturday (6), roll to Monday (+2 days)
    if (target.getDay() === 6) {
      target.setDate(target.getDate() + 2);
    }
    // If next day is Sunday (0), roll to Monday (+1 day)
    else if (target.getDay() === 0) {
      target.setDate(target.getDate() + 1);
    }
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return {
      nextSchoolDayKey: days[target.getDay()],
      nextSchoolDayName: target.toLocaleDateString('en-US', { weekday: 'long' })
    };
  }, []);

  // Toggle food availability for next day pre-orders or specific day
  const toggleFoodMutation = useMutation({
    mutationFn: async ({ foodId, isAvailable, day }: { foodId: string; isAvailable?: boolean; day?: string }) => {
      return await apiService.toggleFoodAvailability(foodId, isAvailable, day);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      toast({
        title: 'Menu Updated',
        description: 'Product availability schedule has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item availability.',
        variant: 'destructive',
      });
    },
  });

  // Bulk toggle food availability for all products
  const bulkToggleFoodMutation = useMutation({
    mutationFn: async ({ isAvailable, day }: { isAvailable: boolean; day?: string }) => {
      return await apiService.bulkToggleFoodAvailability({ isAvailable, day, all: true });
    },
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      toast({
        title: 'Bulk Menu Updated',
        description: `All products have been ${vars.isAvailable ? 'made available' : 'hidden'} for ${vars.day ? vars.day.toUpperCase() : 'selected schedule'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update all products in bulk.',
        variant: 'destructive',
      });
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
        title: 'Order Updated',
        description: 'Order status has been updated successfully.',
      });
      setIsOrderDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    },
  });

  // Add new food mutation
  const addFoodMutation = useMutation({
    mutationFn: async (foodData: any) => {
      return await apiService.createFood({
        name: foodData.name,
        price: parseFloat(foodData.price),
        category: foodData.category,
        description: foodData.description,
        available: foodData.available,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      toast({
        title: 'Food Item Added',
        description: 'New food item has been added successfully.',
      });
      setIsAddFoodDialogOpen(false);
      setNewFood({
        name: '',
        price: '',
        category: '',
        description: '',
        available: true
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add food item.',
        variant: 'destructive',
      });
    },
  });

  // Delete food mutation
  const deleteFoodMutation = useMutation({
    mutationFn: async (foodId: string) => {
      return await apiService.deleteFood(foodId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      toast({
        title: 'Food Item Deleted',
        description: 'Food item has been removed from the menu.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete food item.',
        variant: 'destructive',
      });
    },
  });

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order: Order) => {
      const idMatch = order._id.toLowerCase().includes(orderSearchQuery.toLowerCase());
      const customerName = ((order as any).student?.name || order.studentName || '').toLowerCase();
      const customerMatch = customerName.includes(orderSearchQuery.toLowerCase());
      const statusMatch = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      return (idMatch || customerMatch) && statusMatch;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  // Filtered foods
  const filteredFoods = useMemo(() => {
    if (!foods) return [];
    return foods.filter((food: Food) => {
      const q = foodSearchQuery.toLowerCase();
      return (food.name || '').toLowerCase().includes(q) || (food.category || '').toLowerCase().includes(q);
    });
  }, [foods, foodSearchQuery]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleStatusUpdate = (status: Order['status']) => {
    if (selectedOrder) {
      updateOrderMutation.mutate({
        orderId: selectedOrder._id,
        status
      });
    }
  };

  const handleAddFood = () => {
    if (newFood.name && newFood.price && newFood.category && newFood.description) {
      addFoodMutation.mutate(newFood);
    }
  };

  const handleDeleteFood = (foodId: string) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      deleteFoodMutation.mutate(foodId);
    }
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Delivered</Badge>;
      case 'dispatched':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">In Transit</Badge>;
      case 'ready':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200">Ready</Badge>;
      case 'preparing':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Preparing</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{status}</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">Pending</Badge>;
    }
  };

  const availableFoodsCount = foods ? foods.filter((f: Food) => f.available).length : 0;
  const totalFoodsCount = foods ? foods.length : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Operations Portal</h1>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Monitoring
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Nayomi's Waterfront &bull; Smart School Breakfast Distribution System
                {adminEmail && <span className="ml-2 font-medium text-slate-700">({adminEmail})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              onClick={handleRefreshAll}
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statsFetching ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-slate-300" />
              ) : (
                <>
                  <div className="text-3xl font-extrabold text-slate-900">{stats?.totalStudents || 0}</div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    Registered student accounts
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
              <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-slate-300" />
              ) : (
                <>
                  <div className="text-3xl font-extrabold text-slate-900">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                    <span className="font-semibold text-orange-600">{stats?.pendingOrders || 0}</span> pending &bull; {stats?.todayOrders || 0} today
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-slate-300" />
              ) : (
                <>
                  <div className="text-3xl font-extrabold text-slate-900">
                    Rs. {stats?.totalRevenue?.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    Verified completed orders
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Next-Day Menu</CardTitle>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {foodsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-slate-300" />
              ) : (
                <>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {availableFoodsCount} <span className="text-sm font-normal text-slate-500">/ {totalFoodsCount} active</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Available for student pre-order
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unified Operational Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex flex-wrap h-auto gap-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
              {orders && orders.length > 0 && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-800 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                  {orders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Next-Day Menu
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                {availableFoodsCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Smart Boxes
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Safety Alerts
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
          </TabsList>

          {/* ===================== TAB 1: ORDERS ===================== */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Breakfast Delivery Orders</CardTitle>
                  <CardDescription>Track status, school delivery locations, and smart box assignments</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search Order ID or student..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-full sm:w-64 text-sm"
                    />
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="h-9 w-full sm:w-36 text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="dispatched">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {ordersLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-orange-500" />
                    <span>Loading real-time orders...</span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                    <FileX className="h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-semibold text-slate-700">No Orders Match Your Filter</h3>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting the search query or status filter above.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <Table>
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead className="font-semibold text-slate-700">Order ID</TableHead>
                          <TableHead className="font-semibold text-slate-700">Student Name</TableHead>
                          <TableHead className="font-semibold text-slate-700">School & Pickup</TableHead>
                          <TableHead className="font-semibold text-slate-700">Items</TableHead>
                          <TableHead className="font-semibold text-slate-700">Total</TableHead>
                          <TableHead className="font-semibold text-slate-700">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700">Placed At</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order: Order) => (
                          <TableRow 
                            key={order._id} 
                            className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                            onClick={() => handleOrderClick(order)}
                          >
                            <TableCell className="font-mono text-xs font-bold text-slate-800">
                              #{order._id.slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">
                              {(order as any).student?.name || order.studentName || 'Student'}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              <div className="font-medium text-slate-800">{order.pickupLocation || 'Main Canteen'}</div>
                              <div className="text-slate-400">Pickup: {order.pickupTime || 'Morning Break'}</div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {order.items?.length || 0} item(s)
                            </TableCell>
                            <TableCell className="font-bold text-slate-900 text-sm">
                              Rs. {(order.total || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {getOrderStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, h:mm a') : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                Review &rarr;
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== TAB 2: NEXT-DAY MENU ===================== */}
          <TabsContent value="menu" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold text-slate-900">Next-Day & Daily Menu Schedule</CardTitle>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-semibold">
                        Next School Day: {nextSchoolDayName}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Configure exactly which meals students can see and pre-order for the next school day ({nextSchoolDayName}) and upcoming weekdays (Mon–Fri).
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search menu dishes..."
                        value={foodSearchQuery}
                        onChange={(e) => setFoodSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <Button onClick={() => setIsAddFoodDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700 h-9 text-sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add Dish
                    </Button>
                  </div>
                </div>

                {/* Advanced Quick Schedule & Bulk Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 mr-1">Filter View:</span>
                    {[
                      { key: 'all', label: 'All Items' },
                      { key: 'tomorrow', label: `Next School Day (${nextSchoolDayName.slice(0, 3)})` },
                      { key: 'monday', label: 'Mon' },
                      { key: 'tuesday', label: 'Tue' },
                      { key: 'wednesday', label: 'Wed' },
                      { key: 'thursday', label: 'Thu' },
                      { key: 'friday', label: 'Fri' },
                    ].map((d) => (
                      <Button
                        key={d.key}
                        type="button"
                        size="sm"
                        variant={selectedMenuDay === d.key ? 'default' : 'outline'}
                        onClick={() => setSelectedMenuDay(d.key)}
                        className={`h-7 px-2.5 text-xs ${
                          selectedMenuDay === d.key
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </Button>
                    ))}
                  </div>

                  {/* Bulk Change Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={bulkToggleFoodMutation.isPending}
                      onClick={() => bulkToggleFoodMutation.mutate({ 
                        isAvailable: true, 
                        day: selectedMenuDay === 'all' ? nextSchoolDayKey : (selectedMenuDay === 'tomorrow' ? nextSchoolDayKey : selectedMenuDay) 
                      })}
                      className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      title="Enable all products for the selected school day"
                    >
                      ✓ Enable All for {selectedMenuDay === 'tomorrow' || selectedMenuDay === 'all' ? nextSchoolDayName : selectedMenuDay.toUpperCase()}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={bulkToggleFoodMutation.isPending}
                      onClick={() => bulkToggleFoodMutation.mutate({ 
                        isAvailable: false, 
                        day: selectedMenuDay === 'all' ? nextSchoolDayKey : (selectedMenuDay === 'tomorrow' ? nextSchoolDayKey : selectedMenuDay) 
                      })}
                      className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
                      title="Hide all products for the selected school day"
                    >
                      ✗ Disable All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {foodsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-orange-500" />
                    <span>Loading menu items...</span>
                  </div>
                ) : filteredFoods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                    <Package className="h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-semibold text-slate-700">No Food Items Found</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-4">Click "Add Dish" to introduce new breakfast meals to the system.</p>
                    <Button onClick={() => setIsAddFoodDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <Table>
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead className="font-semibold text-slate-700">Dish Name</TableHead>
                          <TableHead className="font-semibold text-slate-700">Category</TableHead>
                          <TableHead className="font-semibold text-slate-700">Unit Price</TableHead>
                          <TableHead className="font-semibold text-slate-700">Next School Day ({nextSchoolDayName})</TableHead>
                          <TableHead className="font-semibold text-slate-700">School Weekdays (Mon - Fri)</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFoods
                          .filter((food: Food) => {
                            if (selectedMenuDay === 'all') return true;
                            const targetKey = selectedMenuDay === 'tomorrow' ? nextSchoolDayKey : selectedMenuDay;
                            if (food.available === false) return false;
                            if (!food.availableDays) return true;
                            return food.availableDays[targetKey] !== false;
                          })
                          .map((food: Food) => {
                            const isNextSchoolDayActive = food.available !== false && (!food.availableDays || food.availableDays[nextSchoolDayKey] !== false);
                            const daysList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

                            return (
                              <TableRow key={food._id} className="hover:bg-slate-50/70 transition-colors">
                                <TableCell className="font-medium text-slate-900">
                                  <div>{food.name || 'Unnamed Dish'}</div>
                                  {food.description && (
                                    <div className="text-xs text-slate-500 truncate max-w-xs">{food.description}</div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-50">
                                    {food.category || 'Breakfast'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-bold text-slate-900">
                                  Rs. {food.price?.toFixed(2) || '0.00'}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant={isNextSchoolDayActive ? "default" : "outline"}
                                    className={isNextSchoolDayActive 
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 shadow-sm" 
                                      : "border-rose-300 text-rose-600 hover:bg-rose-50 text-xs h-8"}
                                    onClick={() => toggleFoodMutation.mutate({ 
                                      foodId: food._id, 
                                      day: nextSchoolDayKey, 
                                      isAvailable: !isNextSchoolDayActive 
                                    })}
                                    disabled={toggleFoodMutation.isPending}
                                    title={`Click to toggle availability for next school day (${nextSchoolDayName})`}
                                  >
                                    {isNextSchoolDayActive ? `✓ Available ${nextSchoolDayName}` : `✗ Hidden ${nextSchoolDayName}`}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    {daysList.map((day) => {
                                      const isDayActive = food.available !== false && (!food.availableDays || food.availableDays[day] !== false);
                                      const isTargetDay = day === nextSchoolDayKey;
                                      const dayLabels: Record<string, string> = {
                                        monday: 'M',
                                        tuesday: 'T',
                                        wednesday: 'W',
                                        thursday: 'Th',
                                        friday: 'F'
                                      };
                                      return (
                                        <button
                                          key={day}
                                          type="button"
                                          onClick={() => toggleFoodMutation.mutate({
                                            foodId: food._id,
                                            day,
                                            isAvailable: !isDayActive
                                          })}
                                          disabled={toggleFoodMutation.isPending}
                                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                            isDayActive
                                              ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                          } ${isTargetDay ? 'ring-2 ring-orange-500 ring-offset-1' : ''}`}
                                          title={`${day.toUpperCase()}: ${isDayActive ? 'Available' : 'Unavailable'} (Click to toggle)`}
                                        >
                                          {dayLabels[day]}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteFood(food._id)}
                                    disabled={deleteFoodMutation.isPending}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    title="Delete item"
                                  >
                                    {deleteFoodMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== TAB 3: SMART BOXES (IoT) ===================== */}
          <TabsContent value="devices" className="space-y-4">
            <AdminDevices />
          </TabsContent>

          {/* ===================== TAB 4: SAFETY ALERTS ===================== */}
          <TabsContent value="alerts" className="space-y-4">
            <AdminAlerts />
          </TabsContent>

          {/* ===================== TAB 5: CUSTOMERS ===================== */}
          <TabsContent value="customers" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">Registered Student Directory</CardTitle>
                <CardDescription>View enrolled customers, contact details, and loyalty points</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {studentsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-orange-500" />
                    <span>Loading student records...</span>
                  </div>
                ) : !students || students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                    <Users className="h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-semibold text-slate-700">No Customers Registered</h3>
                    <p className="text-sm text-slate-400 mt-1">Student accounts will appear here automatically upon app registration.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <Table>
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead className="font-semibold text-slate-700">Student Name</TableHead>
                          <TableHead className="font-semibold text-slate-700">Email Address</TableHead>
                          <TableHead className="font-semibold text-slate-700">Telephone / Phone</TableHead>
                          <TableHead className="font-semibold text-slate-700">Order Count</TableHead>
                          <TableHead className="font-semibold text-slate-700">Loyalty Points</TableHead>
                          <TableHead className="font-semibold text-slate-700">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student: Student) => (
                          <TableRow key={student._id} className="hover:bg-slate-50/70 transition-colors">
                            <TableCell className="font-medium text-slate-900">{student.name || 'Student'}</TableCell>
                            <TableCell className="text-xs text-slate-600 font-mono">{student.email || 'N/A'}</TableCell>
                            <TableCell className="text-xs text-slate-700 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  {student.phone || (student as any).telephone || (student as any).whatsapp || 'N/A'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingStudent({
                                    id: student._id,
                                    name: student.name || 'Student',
                                    phone: student.phone || (student as any).telephone || (student as any).whatsapp || '',
                                  })}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                                  title="Edit phone number"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                {student.orders?.length || 0} orders
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold gap-1">
                                ⭐ {student.points || 0} pts
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {student.createdAt ? format(new Date(student.createdAt), 'MMM dd, yyyy') : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Order Details & Status Update Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-xl font-bold">
                Order #{selectedOrder?._id.slice(-6).toUpperCase()}
              </DialogTitle>
              {selectedOrder && getOrderStatusBadge(selectedOrder.status)}
            </div>
            <DialogDescription>
              Review breakfast meal items and advance kitchen workflow status
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Student Customer</span>
                  <p className="font-semibold text-slate-800">
                    {(selectedOrder as any).student?.name || selectedOrder.studentName || 'Student'}
                  </p>
                  {((selectedOrder as any).student?.phone || (selectedOrder as any).student?.telephone || (selectedOrder as any).student?.whatsapp) && (
                    <p className="text-xs text-blue-600 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {(selectedOrder as any).student?.phone || (selectedOrder as any).student?.telephone || (selectedOrder as any).student?.whatsapp}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 block">School Destination</span>
                  <p className="font-semibold text-slate-800">
                    {selectedOrder.pickupLocation || 'School Main Canteen'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Ordered At</span>
                  <p className="text-slate-600">
                    {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'PPP p') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Smart Box Assignment</span>
                  <p className="text-slate-700 font-mono font-medium">
                    {(selectedOrder as any).delivery?.boxId || 'Unassigned (Waiting for dispatch)'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">Ordered Meal Items</label>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{item.foodName || (item as any).foodItem?.name || 'Breakfast Dish'}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">Rs. {((item.quantity || 1) * (item.price || (item as any).foodItem?.price || 0)).toFixed(2)}</p>
                          <p className="text-xs text-slate-400">Rs. {(item.price || (item as any).foodItem?.price || 0).toFixed(2)} ea</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No meal items recorded.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Total Order Amount:</span>
                <span className="font-extrabold text-2xl text-emerald-600">
                  Rs. {(selectedOrder.total || 0).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">Advance Kitchen Status</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusUpdate(value as Order['status'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending (Received)</SelectItem>
                    <SelectItem value="preparing">Preparing (In Kitchen)</SelectItem>
                    <SelectItem value="ready">Ready (Packed in Smart Box)</SelectItem>
                    <SelectItem value="dispatched">In Transit (Vehicle Driver)</SelectItem>
                    <SelectItem value="delivered">Delivered (Handed over at School)</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Food Dialog */}
      <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Breakfast Dish</DialogTitle>
            <DialogDescription>
              Introduce a new dish to the pre-order catalog
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Dish Name</label>
              <Input
                value={newFood.name}
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                placeholder="e.g., Egg Roti, Milk Rice, Bun"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Category</label>
              <Input
                value={newFood.category}
                onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                placeholder="e.g., Breakfast, Short Eats, Bakery"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Unit Price (Rs.)</label>
              <Input
                type="number"
                step="1"
                value={newFood.price}
                onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                placeholder="150.00"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Description</label>
              <Input
                value={newFood.description}
                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                placeholder="Fresh ingredients, nutritional notes..."
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsAddFoodDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddFood} 
              disabled={addFoodMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {addFoodMutation.isPending ? 'Saving...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Phone Edit Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Telephone Number</DialogTitle>
            <DialogDescription>
              Set or update customer contact telephone number for {editingStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Telephone / Phone Number</label>
            <Input
              type="tel"
              placeholder="e.g. +94 77 123 4567"
              value={editingStudent?.phone || ''}
              onChange={(e) => setEditingStudent((prev) => prev ? { ...prev, phone: e.target.value } : null)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)} disabled={isEditingPhone}>
              Cancel
            </Button>
            <Button onClick={handleSaveStudentPhone} disabled={isEditingPhone} className="bg-blue-600 hover:bg-blue-700">
              {isEditingPhone ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Telephone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
