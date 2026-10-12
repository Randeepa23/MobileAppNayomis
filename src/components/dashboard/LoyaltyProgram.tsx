import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Award, 
  Gift, 
  Crown, 
  Sparkles,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const LoyaltyProgram: React.FC = () => {
  const { user } = useAuth();
  const currentPoints = user?.points || 0;

  // Loyalty tiers
  const tiers = [
    { name: 'Bronze', min: 0, max: 499, color: 'orange', benefits: ['5% discount on orders', 'Birthday treat'] },
    { name: 'Silver', min: 500, max: 999, color: 'gray', benefits: ['8% discount on orders', 'Free drink monthly', 'Priority support'] },
    { name: 'Gold', min: 1000, max: 1999, color: 'yellow', benefits: ['12% discount on orders', 'Free appetizer weekly', 'Exclusive menu items'] },
    { name: 'Platinum', min: 2000, max: Infinity, color: 'purple', benefits: ['15% discount on orders', 'Free meal monthly', 'VIP events access', 'Personal chef consultation'] }
  ];

  const getCurrentTier = (points: number) => {
    return tiers.find(tier => points >= tier.min && points <= tier.max) || tiers[0];
  };

  const getNextTier = (points: number) => {
    return tiers.find(tier => points < tier.min);
  };

  const currentTier = getCurrentTier(currentPoints);
  const nextTier = getNextTier(currentPoints);

  const progressToNextTier = nextTier 
    ? ((currentPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const pointsToNextTier = nextTier ? nextTier.min - currentPoints : 0;

  // Mock rewards data
  const availableRewards = [
    { id: 1, name: 'Free Appetizer', points: 200, description: 'Any appetizer from our menu', icon: '🍤' },
    { id: 2, name: 'Free Drink', points: 150, description: 'Fresh juice or soft drink', icon: '🥤' },
    { id: 3, name: 'Free Main Course', points: 500, description: 'Any main course up to Rs.600', icon: '🍽️' },
    { id: 4, name: '20% Discount', points: 300, description: 'On your next order', icon: '💰' },
    { id: 5, name: 'Free Dessert', points: 100, description: 'Any dessert from our menu', icon: '🍰' },
    { id: 6, name: 'VIP Dinner', points: 1000, description: 'Special 3-course meal for two', icon: '👑' }
  ];

  const recentActivity = [
    { date: '2025-12-22', description: 'Order #1236 - Earned 75 points', points: 75, type: 'earned' },
    { date: '2025-12-21', description: 'Order #1235 - Earned 90 points', points: 90, type: 'earned' },
    { date: '2025-12-20', description: 'Redeemed Free Drink', points: -150, type: 'redeemed' },
    { date: '2025-12-19', description: 'Order #1233 - Earned 60 points', points: 60, type: 'earned' }
  ];

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return Crown;
      case 'gold': return Award;
      default: return Star;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
        <p className="text-gray-600">Track your points, tier status, and available rewards</p>
      </div>

      {/* Current Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>Your Loyalty Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                  {React.createElement(getTierIcon(currentTier.name), { 
                    className: "h-8 w-8 text-white" 
                  })}
                </div>
                <div>
                  <Badge className={getTierColor(currentTier.name)} variant="secondary">
                    {currentTier.name} Member
                  </Badge>
                  <h3 className="text-2xl font-bold mt-1">{currentPoints} Points</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Member since</p>
                <p className="font-semibold">January 2025</p>
              </div>
            </div>

            {nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Progress to {nextTier.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {pointsToNextTier} points to go
                  </span>
                </div>
                <Progress value={progressToNextTier} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tier Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Your {currentTier.name} Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-green-800 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>Available Rewards</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRewards.map((reward, index) => {
                const canRedeem = currentPoints >= reward.points;
                
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`p-4 border rounded-lg ${
                      canRedeem 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <Badge variant={canRedeem ? 'default' : 'secondary'}>
                        {reward.points} pts
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{reward.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={!canRedeem}
                      variant={canRedeem ? 'default' : 'secondary'}
                    >
                      {canRedeem ? 'Redeem' : 'Not enough points'}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Points Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'earned' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {activity.type === 'earned' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    activity.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.type === 'earned' ? '+' : ''}{activity.points} pts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};