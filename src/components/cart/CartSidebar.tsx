import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onOpenChange }) => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart();
  const { user, syncLoyaltyPoints } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpdateQuantity = (foodId: string, newQuantity: number) => {
    updateQuantity(foodId, newQuantity);
  };

  const handleRemoveItem = (foodId: string) => {
    removeFromCart(foodId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const calculateDiscount = () => {
    return Math.min(pointsToUse * 0.01, cart.total); // 1 point = Rs. 0.01
  };

  const getFinalTotal = () => {
    return Math.max(0, cart.total - calculateDiscount());
  };

  const handlePlaceOrder = async () => {
    if (!user || cart.items.length === 0) return;

    setIsPlacingOrder(true);
    try { 
      const orderItems = cart.items.map(item => ({
        foodId: item.foodId,
        quantity: item.quantity
      }));

      const response = await apiService.placeOrder(user._id, {
        items: orderItems,
        pointsToUse: pointsToUse
      });

      if (response.success && response.data) {
        // Sync user points from server
        await syncLoyaltyPoints();

        clearCart();
        setPointsToUse(0);
        
        toast({
          title: "Order placed successfully!",
          description: `Your order has been placed. You earned ${response.data.pointsEarned} points!`,
        });

        onOpenChange?.(false);
      } else {
        toast({
          title: "Order failed",
          description: response.message || "Failed to place order. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const cartItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" className="relative p-2.5 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200">
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            <AnimatePresence>
              {getTotalItems() > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge className="h-5 w-5 flex items-center justify-center text-xs p-0 bg-gradient-to-r from-orange-500 to-red-500 border-2 border-white shadow-lg">
                    {getTotalItems()}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </SheetTrigger>

      <SheetContent 
        side="right"
        className="w-full sm:max-w-lg bg-gradient-to-b from-white to-gray-50 shadow-2xl border-none flex flex-col p-0 h-screen max-h-screen z-[100] overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 px-6 py-5 shrink-0">
          <SheetTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Your Cart
                {getTotalItems() > 0 && (
                  <Badge className="bg-white text-orange-600 font-bold px-2 py-0.5">
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                  </Badge>
                )}
              </div>
              <SheetDescription className="text-orange-100 text-xs mt-0.5">
                Review your delicious selection
              </SheetDescription>
            </div>
          </SheetTitle>
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <AnimatePresence mode="popLayout">
              {cart.items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-16"
                >
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <ShoppingCart className="h-12 w-12 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                  <p className="text-sm text-gray-500">Start adding delicious items!</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.foodId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-base truncate group-hover:text-orange-600 transition-colors">
                            {item.food.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <span className="font-semibold text-orange-600">Rs. {item.food.price.toFixed(2)}</span>
                            <span className="text-gray-400">/ each</span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.foodId)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-full shrink-0 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.foodId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0 rounded-md hover:bg-orange-100 hover:text-orange-600 disabled:opacity-30 transition-all"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="font-bold text-base min-w-[2.5rem] text-center text-gray-900">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.foodId, item.quantity + 1)}
                            className="h-8 w-8 p-0 rounded-md hover:bg-orange-100 hover:text-orange-600 transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-lg text-gray-900">
                            Rs. {(item.food.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Checkout Section - Fixed at Bottom */}
          {cart.items.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-white border-t-2 border-gray-200 px-5 py-4 shrink-0 shadow-2xl"
            >
              {/* Order Summary Card */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 mb-4 border border-orange-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900">Rs. {cart.total.toFixed(2)}</span>
                  </div>
                  
                  {pointsToUse > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex justify-between text-sm items-center"
                    >
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Points Discount
                      </span>
                      <span className="font-bold text-green-600">-Rs. {calculateDiscount().toFixed(2)}</span>
                    </motion.div>
                  )}
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="font-black text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Rs. {getFinalTotal().toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">including all charges</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Sign in required",
                      description: "Please sign in to proceed to checkout",
                      variant: "destructive",
                    });
                    return;
                  }
                  onOpenChange?.(false);
                  navigate('/checkout');
                }}
                disabled={!user}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white font-bold py-4 text-base shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              {!user && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center text-red-600 font-semibold mt-3 bg-red-50 py-2 rounded-lg"
                >
                  ⚠️ Please sign in to place your order
                </motion.p>
              )}
            </motion.div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};