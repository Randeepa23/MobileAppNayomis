import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const response = await apiService.getReviews();
      if (response.success && response.data) {
        return response.data.reviews;
      }
      throw new Error('Failed to fetch reviews');
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
            <p className="text-red-600">Error loading reviews: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = reviews && reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews?.length || 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating}/5.0
                  </p>
                </div>
                {renderStars(Math.round(parseFloat(averageRating)))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">5-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews?.filter(r => r.rating === 5).length || 0}
                  </p>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Excellent
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              All customer feedback and ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews && reviews.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Food Item</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell className="font-medium">
                        {review.studentName || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {review.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            ({review.rating}/5)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm">
                          {review.comment || 'No comment'}
                        </p>
                      </TableCell>
                      <TableCell>
                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};