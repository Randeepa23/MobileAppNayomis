import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Order, CreateReviewRequest } from '../types';

interface ReviewFormProps {
  order: Order;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ order, onSuccess }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: CreateReviewRequest) => {
      if (!user) throw new Error('User not authenticated');
      return apiService.createReview(user._id, reviewData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Comment too short",
        description: "Please write at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      orderId: order._id,
      rating,
      comment: comment.trim(),
    });
  };

  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          className="p-1 rounded-full transition-transform hover:scale-110"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          whileTap={{ scale: 0.95 }}
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <h3 className="text-lg font-semibold text-green-700 mb-2">
          Review Submitted!
        </h3>
        <p className="text-gray-600">
          Thank you for sharing your experience with us.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Star className="text-yellow-400" size={24} />
            Rate Your Order
          </CardTitle>
          <CardDescription>
            Order #{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Your Order:</h4>
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-600">
                  <span>{item.quantity}x {item.foodName}</span>
                  <span>Rs. {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-medium">
              <span>Total:</span>
              <span>Rs. {order.total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate your experience?
              </label>
              <StarRating />
              {rating > 0 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-600 mt-2"
                >
                  {rating === 1 && "Poor - We'll do better next time"}
                  {rating === 2 && "Fair - Room for improvement"}
                  {rating === 3 && "Good - Met expectations"}
                  {rating === 4 && "Very Good - Exceeded expectations"}
                  {rating === 5 && "Excellent - Outstanding experience!"}
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about your experience
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the food quality, service, or anything else..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Minimum 10 characters</span>
                <span>{comment.length}/500</span>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={createReviewMutation.isPending || rating === 0 || comment.trim().length < 10}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {createReviewMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send size={18} />
                    Submit Review
                  </div>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReviewForm;