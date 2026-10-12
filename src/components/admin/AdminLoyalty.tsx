import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { format } from 'date-fns';
import { Crown, Award, Star } from 'lucide-react';

export const AdminLoyalty: React.FC = () => {
  const { data: loyaltyData, isLoading, error } = useQuery({
    queryKey: ['admin-loyalty'],
    queryFn: async () => {
      const response = await apiService.getAllStudents();
      if (response.success && response.data) {
        const students = response.data.students;
        // Calculate loyalty statistics
        const totalPoints = students.reduce((sum, student) => sum + (student.points || 0), 0);
        const activeUsers = students.filter(student => (student.points || 0) > 0);
        
        return {
          students: students.sort((a, b) => (b.points || 0) - (a.points || 0)),
          totalPoints,
          activeUsers: activeUsers.length,
          averagePoints: students.length > 0 ? Math.round(totalPoints / students.length) : 0
        };
      }
      throw new Error('Failed to fetch loyalty data');
    },
  });

  const getLoyaltyTier = (points: number) => {
    if (points >= 2000) return { name: 'Platinum', color: 'bg-purple-100 text-purple-800', icon: Crown };
    if (points >= 1000) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: Award };
    if (points >= 500) return { name: 'Silver', color: 'bg-gray-100 text-gray-800', icon: Star };
    return { name: 'Bronze', color: 'bg-orange-100 text-orange-800', icon: Star };
  };

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
            <p className="text-red-600">Error loading loyalty data: {(error as Error).message}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Points Issued</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loyaltyData?.totalPoints?.toLocaleString() || 0}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loyaltyData?.activeUsers || 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Points</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loyaltyData?.averagePoints || 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platinum Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loyaltyData?.students?.filter(s => (s.points || 0) >= 2000).length || 0}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty Program Overview</CardTitle>
            <CardDescription>
              Member rankings and loyalty point distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loyaltyData?.students && loyaltyData.students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loyaltyData.students.map((student, index) => {
                    const tier = getLoyaltyTier(student.points || 0);
                    const TierIcon = tier.icon;
                    
                    return (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{student.points || 0}</span>
                            <span className="text-sm text-gray-500">pts</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={tier.color}>
                            <TierIcon className="h-3 w-3 mr-1" />
                            {tier.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No loyalty data found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};