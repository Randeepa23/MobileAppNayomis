import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Star,
  Crown,
  Trophy,
  Gift,
  Calendar,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  
  const { user, syncLoyaltyPoints } = useAuth();
  const { toast } = useToast();

  // Fetch user's order statistics
  const { data: orderStats } = useQuery({
    queryKey: ['orderStats', user?._id],
    queryFn: async () => {
      if (!user?._id) return null;
      const response = await apiService.getStudentOrders(user._id);
      if (response.success && response.data) {
        const orders = response.data.orders;
        return {
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
          avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
          recentOrder: orders[0] || null
        };
      }
      return null;
    },
    enabled: !!user?._id,
  });

  const getLoyaltyTier = (points: number) => {
    if (points >= 1000) return { 
      name: 'Gold', 
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
      icon: Crown,
      nextTier: null,
      progress: 100 
    };
    if (points >= 500) return { 
      name: 'Silver', 
      color: 'text-gray-600 bg-gray-50 border-gray-200', 
      icon: Trophy,
      nextTier: 'Gold',
      nextTierPoints: 1000,
      progress: ((points - 500) / 500) * 100 
    };
    return { 
      name: 'Bronze', 
      color: 'text-amber-600 bg-amber-50 border-amber-200', 
      icon: Star,
      nextTier: 'Silver',
      nextTierPoints: 500,
      progress: (points / 500) * 100 
    };
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditForm({ name: '', email: '' });
    } else {
      setIsEditing(true);
      setEditForm({ 
        name: user?.name || '', 
        email: user?.email || '' 
      });
    }
  };

  const handleSaveProfile = async () => {
    // Note: This would need a backend endpoint to update user profile
    toast({
      title: "Profile update",
      description: "Profile update functionality would be implemented here.",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const loyaltyTier = getLoyaltyTier(user.points);
  const LoyaltyIcon = loyaltyTier.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">
          Manage your account and view your loyalty status
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Full Name</span>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email</span>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Account Status</span>
                    <Badge variant="secondary" className="text-green-700 bg-green-50">
                      Active
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Orders</span>
                    <p className="text-gray-900">{orderStats?.totalOrders || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Statistics
              </CardTitle>
              <CardDescription>Your ordering history at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {orderStats?.totalOrders || 0}
                  </div>
                  <div className="text-sm text-blue-700">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    Rs. {orderStats?.totalSpent?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-green-700">Total Spent</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    Rs. {orderStats?.avgOrderValue?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-purple-700">Avg. Order Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loyalty Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Loyalty Points */}
          <Card className={`border-2 ${loyaltyTier.color.split(' ').slice(2).join(' ')}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LoyaltyIcon className={`h-5 w-5 ${loyaltyTier.color.split(' ')[0]}`} />
                <span className={loyaltyTier.color.split(' ')[0]}>
                  {loyaltyTier.name} Member
                </span>
              </CardTitle>
              <CardDescription>
                Your loyalty tier and points balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {user.points}
                </div>
                <div className="text-sm text-gray-600">Loyalty Points</div>
              </div>

              <Separator className="my-4" />

              {/* Tier Progress */}
              {loyaltyTier.nextTier && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {loyaltyTier.nextTier}</span>
                    <span>{Math.round(loyaltyTier.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loyaltyTier.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        loyaltyTier.name === 'Bronze' 
                          ? 'from-amber-400 to-amber-600' 
                          : 'from-gray-400 to-gray-600'
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {loyaltyTier.nextTierPoints - user.points} points to {loyaltyTier.nextTier}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={syncLoyaltyPoints}
                className="w-full mt-4"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Sync Points
              </Button>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  Rewards program coming soon!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Keep earning points to unlock exclusive benefits
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {orderStats?.recentOrder && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Last Order</p>
                  <p className="text-gray-600">
                    Rs. {orderStats.recentOrder.total.toFixed(2)} • {' '}
                    {format(new Date(orderStats.recentOrder.createdAt), 'MMM d, yyyy')}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {orderStats.recentOrder.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};