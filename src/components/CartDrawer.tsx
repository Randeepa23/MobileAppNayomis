import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, MapPin, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CartDrawerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onOpenChange,
  children 
}) => {
  const { cart, updateQuantity, removeFromCart, getTotalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdateQuantity = (foodId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    updateQuantity(foodId, newQuantity);
  };

  const handleRemoveItem = (foodId: string) => {
    removeFromCart(foodId);
  };

  const handleCheckout = () => {
    // Validate cart is not empty
    if (cart.items.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    // Validate user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed to checkout.",
        variant: "destructive",
      });
      return;
    }

    // All validations passed - proceed to checkout
    onOpenChange?.(false);
    navigate('/checkout');
    
    toast({
      title: "Proceeding to Checkout",
      description: `${getTotalItems()} item(s) ready for checkout`,
    });
  };

  const cartItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const triggerContent = children || (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button variant="outline" className="relative hover:shadow-md transition-all duration-200">
        <motion.div
          animate={getTotalItems() > 0 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
        </motion.div>
        Cart
        <AnimatePresence>
          {getTotalItems() > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="absolute -top-2 -right-2"
            >
              <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center text-xs p-0">
                {getTotalItems()}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );

  console.log("CartDrawer rendered", { 
    itemsCount: cart.items.length, 
    isAuthenticated,
    total: cart.total 
  });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {triggerContent}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({cart.items.length} items)</SheetTitle>
        </SheetHeader>

        {/* MINIMAL TEST VERSION - JUST SHOW THE BUTTON */}
        <div className="h-full flex flex-col py-4">
          
          {/* Simple item list - with less height */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[50vh]">
            {cart.items.map((item) => (
              <div key={item.foodId} className="border p-3 rounded">
                <p className="font-bold">{item.food.name}</p>
                <p>Qty: {item.quantity} × Rs. {item.food.price}</p>
              </div>
            ))}
          </div>

          {/* CHECKOUT BUTTON - POSITIONED HIGHER */}
          <div className="mt-6 pt-4 border-t-4 border-orange-600 bg-orange-100 p-4 rounded-lg">
            <div className="mb-3 text-center">
              <p className="text-2xl font-black">Total: Rs. {cart.total.toFixed(2)}</p>
            </div>
            
            <Button
              onClick={handleCheckout}
              disabled={!isAuthenticated}
              className="w-full py-8 text-2xl font-black bg-orange-600 hover:bg-orange-700 text-white"
            >
              {!isAuthenticated ? "SIGN IN TO CHECKOUT" : "PROCEED TO CHECKOUT →"}
            </Button>

            {!isAuthenticated && (
              <p className="text-center text-red-600 font-bold mt-2">⚠️ Please sign in first</p>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};
