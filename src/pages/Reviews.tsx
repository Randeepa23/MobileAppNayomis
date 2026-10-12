import React from 'react';
import { motion } from 'framer-motion';
import { ReviewsList } from '../components/ReviewsList';

const Reviews: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            What Our Customers Say
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read reviews from students who have experienced our delicious waterfront cuisine.
            Your feedback helps us serve you better!
          </p>
        </motion.div>

        <ReviewsList />
      </div>
    </motion.div>
  );
};

export default Reviews;