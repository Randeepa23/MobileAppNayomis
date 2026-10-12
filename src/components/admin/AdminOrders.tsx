import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { format } from 'date-fns';
import { Order } from '@/types';

export const AdminOrders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiService.getAllOrders();
      if (response.success && response.data) {
        return response.data.orders;
      }
      throw new Error('Failed to fetch orders');
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      return await apiService.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    updateOrderMutation.mutate({ orderId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders?.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  ) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading orders: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>
                  {filteredOrders.length} of {orders?.length || 0} orders
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-xs">
                        #{order._id.slice(-8)}
                      </TableCell>
                      <TableCell>{order.studentName || 'Unknown'}</TableCell>
                      <TableCell>Rs.{order.total}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                disabled={updateOrderMutation.isPending}
                              >
                                Accept
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(order._id, 'ready')}
                                disabled={updateOrderMutation.isPending}
                              >
                                Ready
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order._id, 'completed')}
                                disabled={updateOrderMutation.isPending}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {statusFilter === 'all' ? 'No orders found.' : `No ${statusFilter} orders found.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};