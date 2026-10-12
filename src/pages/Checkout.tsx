import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  Clock, 
  MapPin, 
  Star,
  Loader2,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const PICKUP_TIMES = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'
];

export const Checkout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pickupTime, setPickupTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const { cart, clearCart, updateQuantity, removeFromCart, getTotalItems } = useCart();
  const { user, syncLoyaltyPoints } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (!orderPlaced && cart.items.length === 0) {
      navigate('/');
      return;
    }
  }, [cart.items.length, orderPlaced, navigate]);

  const calculateDiscount = () => {
    return Math.min(pointsToUse * 0.01, cart.total);
  };

  const getFinalTotal = () => {
    return Math.max(0, cart.total - calculateDiscount());
  };

  const getMaxPoints = () => {
    if (!user) return 0;
    return Math.min(user.points, Math.floor(cart.total * 100));
  };

  const handlePointsChange = (increment: number) => {
    const newPoints = Math.max(0, Math.min(getMaxPoints(), pointsToUse + increment));
    setPointsToUse(newPoints);
  };

  const handlePlaceOrder = async () => {
    if (!user || !pickupTime) {
      toast({
        title: "Missing information",
        description: "Please select a pickup time.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
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
        // Update user points
        await syncLoyaltyPoints();
        
        setOrderId(response.data._id);
        setOrderPlaced(true);
        clearCart();
        
        toast({
          title: "Order placed successfully!",
          description: `Your order will be ready for pickup at ${pickupTime}. You earned ${response.data.pointsEarned} points!`,
        });
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your order. We'll have it ready for pickup at your selected time.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Order Details</h3>
            <p className="text-blue-700">Order ID: #{orderId.slice(-6).toUpperCase()}</p>
            <p className="text-blue-700">Pickup Time: {pickupTime}</p>
            <p className="text-blue-700">Location: Nayomi's</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/orders')} 
              className="w-full"
            >
              View Order Status
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Return to Menu
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">Review your order and complete your purchase</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Order Items
                <Badge variant="secondary">{getTotalItems()} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.foodId} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.food.name}</h4>
                    <p className="text-sm text-gray-600">Rs. {item.food.price.toFixed(2)} each</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">Rs. {(item.food.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pickup Information
              </CardTitle>
              <CardDescription>
                Select your preferred pickup time and location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pickup Location */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Pickup Location</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Nayomi's Restaurant<br />
                  123 Waterfront Drive, Katunayake<br />
                  Near Negombo Beach
                </p>
              </div>

              {/* Pickup Time */}
              <div>
                <Label htmlFor="pickup-time">Pickup Time *</Label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select pickup time" />
                  </SelectTrigger>
                  <SelectContent>
                    {PICKUP_TIMES.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Special Instructions */}
              <div>
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special requests or dietary requirements..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Loyalty Points */}
          {user.points > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Use Loyalty Points
                </CardTitle>
                <CardDescription>
                  You have {user.points} points available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>1 point = Rs. 0.01</span>
                    <span>Max: {getMaxPoints()} points</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePointsChange(-100)}
                      disabled={pointsToUse <= 0}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Math.max(0, Math.min(getMaxPoints(), parseInt(e.target.value) || 0)))}
                      className="text-center"
                      placeholder="0"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePointsChange(100)}
                      disabled={pointsToUse >= getMaxPoints()}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPointsToUse(getMaxPoints())}
                    className="w-full"
                  >
                    Use All Points
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {cart.total.toFixed(2)}</span>
              </div>
              
              {pointsToUse > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Points Discount ({pointsToUse} pts)</span>
                  <span>-Rs. {calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-blue-600">
                <span>Points Earned</span>
                <span>+{Math.floor(getFinalTotal())} pts</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>Rs. {getFinalTotal().toFixed(2)}</span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading || !pickupTime}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Place Order Rs. {getFinalTotal().toFixed(2)}
                  </>
                )}
              </Button>

              {!pickupTime && (
                <Alert>
                  <AlertDescription className="text-xs">
                    Please select a pickup time to continue
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;