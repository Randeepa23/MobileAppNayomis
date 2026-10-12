import React, { useState } from 'react';
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
  FileX
} from 'lucide-react';
import { apiService } from '@/services/api';
import { Order, Student, Food } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const AdminDashboard: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
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

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiService.getStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch stats');
    },
    refetchInterval: 30000, // Refresh every 30 seconds
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
    refetchInterval: 10000, // Refresh every 10 seconds
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
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch all foods
  const { data: foods, isLoading: foodsLoading } = useQuery({
    queryKey: ['admin-foods'],
    queryFn: async () => {
      const response = await apiService.getFoods();
      if (response.success && response.data) {
        return response.data.foods;
      }
      throw new Error(response.message || 'Failed to fetch foods');
    },
    refetchInterval: 20000, // Refresh every 20 seconds
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
        title: 'Order updated',
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
      setNewFood({
        name: '',
        price: '',
        category: '',
        description: '',
        available: true
      });
      setIsAddFoodDialogOpen(false);
      toast({
        title: 'Food added',
        description: 'New food item has been added successfully.',
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
        title: 'Food deleted',
        description: 'Food item has been deleted successfully.',
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isLoading = statsLoading || ordersLoading || studentsLoading || foodsLoading;
  const hasError = !stats && !statsLoading;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your restaurant operations</p>
            {adminEmail && (
              <p className="text-sm text-gray-500 mt-1">Logged in as: {adminEmail}</p>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      Registered users
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {stats?.pendingOrders || 0} pending • {stats?.todayOrders || 0} today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      From completed orders
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.totalFoods || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <Package className="inline h-3 w-3 mr-1" />
                      Available dishes
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Manage and track customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading orders...</span>
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileX className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No Orders Yet</h3>
                    <p className="text-sm text-gray-500">Orders will appear here once customers start placing them.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.slice(0, 20).map((order: Order) => (
                          <TableRow key={order._id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOrderClick(order)}>
                            <TableCell className="font-mono text-sm">
                              #{order._id.slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {(order as any).student?.name || order.studentName || 'Guest'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{order.items?.length || 0} items</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">₹{order.total?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(order.status)} text-white`}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(order.status)}
                                  <span className="capitalize">{order.status}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, HH:mm') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOrderClick(order);
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {orders.length > 20 && (
                      <div className="mt-4 text-center text-sm text-gray-500">
                        Showing 20 of {orders.length} orders
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Menu Management</h2>
                <p className="text-gray-600">Add, edit, and remove menu items</p>
              </div>
              <Button onClick={() => setIsAddFoodDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Food Item
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {foodsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading menu items...</span>
                  </div>
                ) : !foods || foods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No Menu Items</h3>
                    <p className="text-sm text-gray-500 mb-4">Add your first menu item to get started.</p>
                    <Button onClick={() => setIsAddFoodDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {foods.map((food: Food) => (
                          <TableRow key={food._id}>
                            <TableCell className="font-medium">{food.name || 'Unnamed Item'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{food.category || 'Uncategorized'}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">₹{food.price?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>
                              <Badge variant={food.available ? "default" : "destructive"}>
                                {food.available ? 'Available' : 'Unavailable'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" title="Edit item">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteFood(food._id)}
                                  disabled={deleteFoodMutation.isPending}
                                  title="Delete item"
                                >
                                  {deleteFoodMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
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

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  View and manage customer accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading customers...</span>
                  </div>
                ) : !students || students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No Customers Yet</h3>
                    <p className="text-sm text-gray-500">Customer accounts will appear here after registration.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>School</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Loyalty Points</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student: Student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">{student.name || 'Unknown'}</TableCell>
                            <TableCell className="text-sm">{student.email || 'N/A'}</TableCell>
                            <TableCell className="text-sm">{(student as any).school || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.orders?.length || 0} orders</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-semibold">
                                ⭐ {student.points || 0} points
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
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

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?._id.slice(-6).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Manage order status and view details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="font-semibold">{(selectedOrder as any).student?.name || selectedOrder.studentName || 'Guest Customer'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Date</label>
                  <p className="font-semibold">
                    {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'PPP p') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Order Items</label>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.foodName || (item as any).foodItem?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{((item.quantity || 1) * (item.price || 0)).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">₹{(item.price || 0).toFixed(2)} each</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items in this order</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                <span className="font-semibold text-lg">Total Amount</span>
                <span className="font-bold text-2xl text-green-600">₹{(selectedOrder.total || 0).toFixed(2)}</span>
              </div>

              <div>
                <label className="text-sm font-medium">Update Status</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusUpdate(value as Order['status'])}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Food Dialog */}
      <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Food Item</DialogTitle>
            <DialogDescription>
              Create a new menu item for your restaurant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newFood.name}
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                placeholder="Food item name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                value={newFood.category}
                onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                placeholder="e.g., Rice, Koththu, Beverages"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                step="0.01"
                value={newFood.price}
                onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newFood.description}
                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                placeholder="Brief description of the item"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFoodDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFood} disabled={addFoodMutation.isPending}>
              {addFoodMutation.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};