import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wallet,
  School,
  TrendingUp
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface PickupPoint {
  _id: string;
  name: string;
  code: string;
  school: {
    name: string;
    address: string;
  };
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capacity: {
    dailyLimit: number;
    currentOrders: number;
  };
  timeSlots: Array<{
    slot: string;
    capacity: number;
    currentBookings: number;
  }>;
  status: string;
}

export const IntelligentCheckout: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch pickup points for student's school
  const { data: pickupPointsData, isLoading: loadingPickupPoints } = useQuery({
    queryKey: ['pickupPoints', user?._id],
    queryFn: async () => {
      if (!user?._id) return null;
      const response = await apiService.getPickupPointsForStudent(user._id, deliveryDate);
      return response.data;
    },
    enabled: !!user?._id && step === 2,
  });

  // Fetch available time slots for selected pickup point
  const { data: timeSlotsData } = useQuery({
    queryKey: ['timeSlots', selectedPickupPoint],
    queryFn: async () => {
      const response = await apiService.getPickupPointTimeSlots(selectedPickupPoint);
      return response.data;
    },
    enabled: !!selectedPickupPoint && step === 3,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with checkout",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!orderPlaced && cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      navigate('/menu');
    }
  }, [cart.items.length, orderPlaced, navigate, toast]);

  // Get minimum delivery date (tomorrow)
  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum delivery date (7 days ahead)
  const getMaximumDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  // Validate checkout before proceeding
  const validateCheckout = async () => {
    if (!selectedPickupPoint || !deliveryDate || !timeSlot) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const orderItems = cart.items.map(item => ({
        foodId: item.foodId,
        quantity: item.quantity
      }));

      const response = await apiService.validateCheckout({
        studentId: user!._id,
        pickupPointId: selectedPickupPoint,
        deliveryDate,
        timeSlot,
        items: orderItems,
        total: cart.total
      });

      if (response.success && response.data.passed) {
        setValidationResult(response.data);
        return true;
      } else {
        toast({
          title: "Validation failed",
          description: response.data.errors?.[0] || "Please check your order details",
          variant: "destructive",
        });
        setValidationResult(response.data);
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Validation error",
        description: error.message || "Failed to validate order",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Place the order
  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const orderItems = cart.items.map(item => ({
        foodId: item.foodId,
        quantity: item.quantity
      }));

      const response = await apiService.placeAdvancedOrder({
        studentId: user!._id,
        items: orderItems,
        deliveryDate,
        pickupPointId: selectedPickupPoint,
        timeSlot,
        specialInstructions
      });

      if (response.success) {
        setOrderId(response.data._id);
        setOrderPlaced(true);
        clearCart();
        
        toast({
          title: "Order placed successfully!",
          description: `Your order will be delivered on ${new Date(deliveryDate).toLocaleDateString()}`,
        });
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step navigation
  const goToNextStep = async () => {
    if (step === 4) {
      const isValid = await validateCheckout();
      if (isValid) {
        setStep(5);
      }
    } else {
      setStep(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4"
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-8"
          >
            <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your breakfast order has been confirmed and will be prepared fresh for delivery.
          </p>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">#{orderId.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Date:</span>
                  <span className="font-semibold">{new Date(deliveryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Slot:</span>
                  <span className="font-semibold">{timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-green-600">Rs. {cart.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
              size="lg"
            >
              View My Orders
            </Button>
            <Button 
              onClick={() => navigate('/menu')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Order More
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Intelligent Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your school breakfast pre-order</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Review Cart' },
              { num: 2, label: 'Pickup Point' },
              { num: 3, label: 'Date & Time' },
              { num: 4, label: 'Instructions' },
              { num: 5, label: 'Confirm' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s.num ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s.num}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 hidden sm:block">{s.label}</span>
                </div>
                {idx < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s.num ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Review Cart */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.foodId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.food.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">Rs. {item.food.price * item.quantity}</p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">Rs. {cart.total}</span>
                  </div>

                  {user && (
                    <Alert>
                      <Wallet className="h-4 w-4" />
                      <AlertDescription>
                        Available Points: {user.points || 0}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button onClick={goToNextStep} className="w-full" size="lg">
                    Proceed to Pickup Selection
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Pickup Point */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Select Pickup Point
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingPickupPoints ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                      <p className="text-gray-500 mt-2">Loading pickup points...</p>
                    </div>
                  ) : pickupPointsData?.pickupPoints?.length > 0 ? (
                    <div className="space-y-3">
                      {pickupPointsData.pickupPoints.map((point: PickupPoint) => (
                        <Card
                          key={point._id}
                          className={`cursor-pointer transition-all ${
                            selectedPickupPoint === point._id
                              ? 'border-orange-500 border-2 bg-orange-50'
                              : 'hover:border-orange-200'
                          }`}
                          onClick={() => setSelectedPickupPoint(point._id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{point.name}</h3>
                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {point.location.address}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary">
                                    {point.capacity.dailyLimit - point.capacity.currentOrders}/{point.capacity.dailyLimit} Available
                                  </Badge>
                                  <Badge variant="outline">
                                    {point.timeSlots.length} Time Slots
                                  </Badge>
                                </div>
                              </div>
                              {selectedPickupPoint === point._id && (
                                <CheckCircle2 className="h-6 w-6 text-orange-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No pickup points available for your school. Please contact support.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={goToNextStep} 
                      className="flex-1"
                      disabled={!selectedPickupPoint}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Delivery Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={getMinimumDate()}
                      max={getMaximumDate()}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Orders must be placed before 8:00 PM on the previous day
                    </p>
                  </div>

                  {deliveryDate && timeSlotsData?.timeSlots && (
                    <div>
                      <Label>Time Slot</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {timeSlotsData.timeSlots.map((slot: any) => (
                          <Button
                            key={slot.slot}
                            variant={timeSlot === slot.slot ? "default" : "outline"}
                            onClick={() => setTimeSlot(slot.slot)}
                            className="w-full"
                            disabled={slot.currentBookings >= slot.capacity}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {slot.slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={goToNextStep} 
                      className="flex-1"
                      disabled={!deliveryDate || !timeSlot}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Special Instructions */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Any special delivery instructions or dietary notes..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={4}
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={goToNextStep} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        'Validate Order'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Confirm & Pay */}
          {step === 5 && validationResult && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Confirm Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Validation Results */}
                  {validationResult.warnings && validationResult.warnings.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {validationResult.warnings.map((warning: string, idx: number) => (
                            <p key={idx}>{warning}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Order Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{cart.items.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Date:</span>
                        <span>{new Date(deliveryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Slot:</span>
                        <span>{timeSlot}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-orange-600">Rs. {cart.total}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="flex-1"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntelligentCheckout;
