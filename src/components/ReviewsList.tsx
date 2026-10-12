import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageCircle, User, Calendar, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { apiService } from '../services/api';
import { Review } from '../types';

interface ReviewsListProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ 
  limit, 
  showTitle = true,
  className = "" 
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => apiService.getReviews(),
  });

  const reviews = data?.data?.reviews || [];
  const displayReviews = limit ? reviews.slice(0, limit) : reviews;

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm font-medium text-gray-600 ml-2">
        {rating}.0
      </span>
    </div>
  );

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return { text: 'Excellent', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
    if (rating >= 4) return { text: 'Very Good', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' };
    if (rating >= 3) return { text: 'Good', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' };
    if (rating >= 2) return { text: 'Fair', variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' };
    return { text: 'Poor', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' };
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className={className}>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MessageCircle className="text-blue-600" size={28} />
            Customer Reviews
          </h2>
        )}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">Unable to load reviews at the moment.</p>
      </div>
    );
  }

  if (displayReviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-600">
          Be the first to share your experience with our delicious food!
        </p>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <MessageCircle className="text-blue-600" size={28} />
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <StarDisplay rating={Math.round(averageRating * 10) / 10} />
                <span>({reviews.length} review{reviews.length > 1 ? 's' : ''})</span>
              </div>
              {limit && reviews.length > limit && (
                <Badge variant="outline" className="text-blue-600">
                  Showing {limit} of {reviews.length}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {displayReviews.map((review, index) => {
          const ratingBadge = getRatingBadge(review.rating);
          
          return (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {review.studentName || 'Customer'}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          {getTimeAgo(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarDisplay rating={review.rating} />
                      <Badge 
                        variant={ratingBadge.variant}
                        className={`mt-1 ${ratingBadge.color} border-none`}
                      >
                        {ratingBadge.text}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed">
                    "{review.comment}"
                  </p>
                  
                  {/* Order ID reference */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Order #{review.orderId.slice(-6)}</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUp size={12} />
                        Verified Purchase
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Load More Indicator */}
      {limit && reviews.length > limit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-600">
            Showing {limit} of {reviews.length} reviews
          </p>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-4" />
        </motion.div>
      )}
    </div>
  );
};

export default ReviewsList;