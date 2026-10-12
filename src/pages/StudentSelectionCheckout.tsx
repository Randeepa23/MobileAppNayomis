import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft, 
  MapPin, 
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Banknote,
  CreditCard,
  Star,
  School,
  User,
  Users,
  TrendingUp
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types';

interface PickupPoint {
  _id: string;
  name: string;
  location: {
    address: string;
  };
  school: {
    name: string;
  };
}

interface CheckoutValidationResult {
  passed: boolean;
  errors?: string[];
  warnings?: string[];
}

interface CheckoutTimeSlot {
  slot: string;
  available?: boolean;
}

type PaymentMethod = 'cash_on_delivery' | 'online_payment' | 'loyalty_points';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash_on_delivery: 'Cash on Delivery',
  online_payment: 'Online Payment',
  loyalty_points: 'Loyalty Points',
};

export const StudentSelectionCheckout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [validationResult, setValidationResult] = useState<CheckoutValidationResult | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0);
  const submissionInFlightRef = useRef(false);
  const validationInFlightRef = useRef(false);

  const { cart, clearCart, isInitialized: isCartInitialized } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStep = searchParams.get('step');
  const parsedStep = Number(rawStep || '1');
  const step = Number.isInteger(parsedStep) && parsedStep >= 1 && parsedStep <= 5
    ? parsedStep
    : 1;

  const navigateToStep = useCallback((nextStep: number, replace = false) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextStep === 1) next.delete('step');
      else next.set('step', String(nextStep));
      return next;
    }, { replace });
  }, [setSearchParams]);

  // Fetch students linked to the logged-in parent
  // For now, we'll use the current user as the only student option
  // TODO: Implement parent-child relationship in backend
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', user?._id],
    queryFn: async () => {
      if (!user?._id) return null;
      // For now, return the current user as the only student
      // In the future, this will fetch all children linked to the parent
      return { students: [user] };
    },
    enabled: !!user?._id,
  });

  // Fetch all active school pickup locations
  const { data: pickupPointsData, isLoading: loadingPickupPoints } = useQuery({
    queryKey: ['pickupPoints', 'active'],
    queryFn: async () => {
      const response = await apiService.getPickupPoints();
      return response.data;
    },
    enabled: step === 2,
    refetchOnMount: 'always',
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

  const requiredLoyaltyPoints = Math.ceil(cart.total * 100);
  const availableLoyaltyPoints = selectedStudent?.points ?? 0;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with checkout",
        variant: "destructive",
      });
      navigate('/', { replace: true });
    }
  }, [isAuthLoading, user, navigate, toast]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isAuthLoading && user && isCartInitialized && !orderPlaced && cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      navigate('/menu', { replace: true });
    }
  }, [isAuthLoading, user, isCartInitialized, cart.items.length, orderPlaced, navigate, toast]);

  // Keep invalid/direct step URLs from exposing an impossible checkout state.
  useEffect(() => {
    if (rawStep !== null && (parsedStep !== step || String(parsedStep) !== rawStep)) {
      navigateToStep(1, true);
      return;
    }
    if (isAuthLoading || !user || !isCartInitialized || cart.items.length === 0 || orderPlaced) return;

    let furthestValidStep = 1;
    if (selectedStudent) furthestValidStep = 2;
    if (selectedStudent && selectedPickupPoint) furthestValidStep = 3;
    if (selectedStudent && selectedPickupPoint && deliveryDate && timeSlot) furthestValidStep = 4;
    if (
      selectedStudent
      && selectedPickupPoint
      && deliveryDate
      && timeSlot
      && paymentMethod
      && validationResult?.passed
    ) {
      furthestValidStep = 5;
    }

    if (step > furthestValidStep) navigateToStep(furthestValidStep, true);
  }, [
    rawStep,
    parsedStep,
    step,
    isAuthLoading,
    user,
    isCartInitialized,
    cart.items.length,
    orderPlaced,
    selectedStudent,
    selectedPickupPoint,
    deliveryDate,
    timeSlot,
    paymentMethod,
    validationResult,
    navigateToStep,
  ]);

  // Any material checkout edit requires fresh validation before confirmation.
  useEffect(() => {
    setValidationResult(null);
  }, [selectedStudent?._id, selectedPickupPoint, deliveryDate, timeSlot, paymentMethod, cart.items, cart.total]);

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
    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      navigate('/menu', { replace: true });
      return false;
    }

    if (!selectedStudent) {
      toast({
        title: "Student not selected",
        description: "Please select a student before proceeding",
        variant: "destructive",
      });
      navigateToStep(1, true);
      return false;
    }

    if (!selectedPickupPoint) {
      toast({
        title: "Pickup point required",
        description: "Please select a pickup point before proceeding",
        variant: "destructive",
      });
      navigateToStep(2, true);
      return false;
    }

    if (!deliveryDate || !timeSlot) {
      toast({
        title: "Date and time required",
        description: "Please select delivery date and time slot",
        variant: "destructive",
      });
      navigateToStep(3, true);
      return false;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select how you would like to pay",
        variant: "destructive",
      });
      navigateToStep(4, true);
      return false;
    }

    if (validationInFlightRef.current) return false;
    validationInFlightRef.current = true;

    try {
      const response = await apiService.validateCheckout({
        studentId: selectedStudent._id,
        pickupPointId: selectedPickupPoint,
        deliveryDate,
        timeSlot,
        items: cart.items.map(item => ({
          foodId: item.foodId,
          quantity: item.quantity,
          price: item.food.price
        })),
        total: cart.total,
        paymentMethod
      });

      if (response.success && response.data?.passed) {
        setValidationResult(response.data);
        return true;
      } else {
        setValidationResult(response.data || { passed: false });
        toast({
          title: "Validation failed",
          description: response.data?.errors?.[0] || response.message || "Please check your order details",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: unknown) {
      setValidationResult(null);
      toast({
        title: "Validation error",
        description: error instanceof Error ? error.message : "Failed to validate checkout",
        variant: "destructive",
      });
      return false;
    } finally {
      validationInFlightRef.current = false;
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (submissionInFlightRef.current) return;
    submissionInFlightRef.current = true;

    setIsLoading(true);
    try {
      const isValid = await validateCheckout();
      if (!isValid || !selectedStudent || !paymentMethod) return;

      const orderData = {
        studentId: selectedStudent._id,
        pickupPointId: selectedPickupPoint,
        deliveryDate,
        timeSlot,
        specialInstructions,
        items: cart.items.map(item => ({
          foodId: item.foodId,
          quantity: item.quantity,
          price: item.food.price
        })),
        total: cart.total,
        paymentMethod,
        pointsUsed: paymentMethod === 'loyalty_points' ? requiredLoyaltyPoints : 0
      };

      const response = await apiService.placeAdvancedOrder(orderData);
      const createdOrderId = response.data?.orderId || response.data?._id || response.data?.order?._id;

      if (response.success === true && typeof createdOrderId === 'string' && createdOrderId) {
        setOrderId(createdOrderId);
        setPlacedOrderTotal(typeof response.data?.total === 'number' ? response.data.total : cart.total);
        setOrderPlaced(true);
        clearCart();
        
        toast({
          title: "Order placed successfully!",
          description: "Your school breakfast order has been confirmed",
        });
      } else {
        throw new Error(response.message || 'The server did not return a valid created order.');
      }
    } catch (error: unknown) {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      submissionInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  // Step navigation
  const goToNextStep = async () => {
    // Step 1: Validate student selection
    if (step === 1) {
      if (!selectedStudent) {
        toast({
          title: "Student required",
          description: "Please select a student to continue",
          variant: "destructive",
        });
        return;
      }
      navigateToStep(2);
    } 
    // Step 2: Validate pickup point selection
    else if (step === 2) {
      if (!selectedPickupPoint) {
        toast({
          title: "Pickup point required",
          description: "Please select a pickup point to continue",
          variant: "destructive",
        });
        return;
      }
      navigateToStep(3);
    }
    // Step 3: Validate date and time
    else if (step === 3) {
      if (!deliveryDate || !timeSlot) {
        toast({
          title: "Date and time required",
          description: "Please select delivery date and time slot",
          variant: "destructive",
        });
        return;
      }
      navigateToStep(4);
    }
    // Step 4: Validate and show confirmation
    else if (step === 4) {
      if (!paymentMethod) {
        toast({
          title: "Payment method required",
          description: "Please select how you would like to pay",
          variant: "destructive",
        });
        return;
      }

      const isValid = await validateCheckout();
      if (isValid) {
        navigateToStep(5);
      }
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      navigate(-1);
    }
  };

  // Order success screen
  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-50 py-12 px-4"
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-11 w-11 text-emerald-600" />
            </div>
          </motion.div>

          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Order Placed Successfully!
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your breakfast order for <span className="font-bold text-orange-600">{selectedStudent?.name}</span> has been confirmed
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="mb-8 border border-orange-100 shadow-sm overflow-hidden">
              <div className="bg-orange-50 border-b border-orange-100 p-6">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600 font-medium">Order ID:</span>
                    <span className="font-bold text-orange-600 text-lg">#{orderId.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600 font-medium">Student:</span>
                    <span className="font-semibold text-gray-900">{selectedStudent?.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600 font-medium">Delivery Date:</span>
                    <span className="font-semibold text-gray-900">{new Date(deliveryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600 font-medium">Time Slot:</span>
                    <span className="font-semibold text-gray-900">{timeSlot}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600 font-medium">Payment:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-gray-700 font-bold text-lg">Total Amount:</span>
                    <span className="font-bold text-2xl text-orange-600">Rs. {placedOrderTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              onClick={() => navigate('/dashboard', { state: { section: 'orders', orderId } })}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
            >
              View My Orders
            </Button>
            <Button 
              onClick={() => navigate('/menu')}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              size="lg"
            >
              Order More
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Checkout header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-orange-100 bg-white shadow-sm"
        >
          <div className="p-6 sm:p-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 px-0 text-orange-700 hover:bg-transparent hover:text-orange-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                <p className="text-gray-600">Complete your school breakfast pre-order</p>
              </div>
              <div className="hidden sm:block rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
                <p className="text-orange-700 text-sm font-semibold">Step {step} of 5</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress steps */}
        <motion.div 
          className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Select Student' },
              { num: 2, label: 'Pickup Point' },
              { num: 3, label: 'Date & Time' },
              { num: 4, label: 'Instructions' },
              { num: 5, label: 'Confirm' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      step >= s.num 
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    step >= s.num ? 'text-orange-700' : 'text-gray-500'
                  }`}>{s.label}</span>
                </motion.div>
                {idx < 4 && (
                  <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-gray-200">
                    <motion.div 
                      className="h-full bg-orange-600"
                      initial={{ width: '0%' }}
                      animate={{ width: step > s.num ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Student */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="border border-orange-100 shadow-sm overflow-hidden bg-white">
                <div className="border-b border-orange-100 bg-orange-50 p-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="bg-white p-2.5 rounded-lg border border-orange-200 text-orange-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Select Student</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Choose which child/student this order is for</p>
                </div>
                <CardContent className="space-y-4 p-6">
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                  ) : studentsData?.students && studentsData.students.length > 0 ? (
                    <RadioGroup 
                      value={selectedStudent?._id} 
                      onValueChange={(value) => {
                        const student = studentsData.students.find(s => s._id === value);
                        if (student) setSelectedStudent(student);
                      }}
                    >
                      {studentsData.students.map((student, idx) => (
                        <motion.div
                          key={student._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex items-center space-x-3 border rounded-xl p-5 cursor-pointer transition-colors ${
                            selectedStudent?._id === student._id 
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300 bg-white'
                          }`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <RadioGroupItem value={student._id} id={student._id} className="text-orange-500" />
                          <Label htmlFor={student._id} className="flex-1 cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{student.name}</p>
                                <p className="text-sm text-gray-600 mt-1">{student.email}</p>
                                {student.school && (
                                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                    <School className="inline h-4 w-4" />
                                    {student.school} {student.grade && `- Grade ${student.grade}`}
                                  </p>
                                )}
                              </div>
                              <Badge className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 text-sm font-semibold hover:bg-orange-100">
                                {student.points} pts
                              </Badge>
                            </div>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Alert className="border-orange-300 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        No students found. Please complete your profile.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!selectedStudent && (
                    <Alert variant="destructive" className="bg-red-50 border-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please select a student to continue
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-4">
                    <Button 
                      onClick={goToNextStep} 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      disabled={!selectedStudent}
                      size="lg"
                    >
                      Continue to Pickup Selection
                      <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                  </div>
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="border border-orange-100 shadow-sm overflow-hidden bg-white">
                <div className="border-b border-orange-100 bg-orange-50 p-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="bg-white p-2.5 rounded-lg border border-orange-200 text-orange-600">
                      <School className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Select Pickup Point</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Choose where {selectedStudent?.name} will pick up the order
                  </p>
                </div>
                <CardContent className="space-y-6 p-6">
                  {loadingPickupPoints ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                  ) : pickupPointsData?.pickupPoints && pickupPointsData.pickupPoints.length > 0 ? (
                    <div className="space-y-3">
                      {pickupPointsData.pickupPoints.map((point: PickupPoint, idx: number) => (
                        <motion.div
                          key={point._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Button
                            variant={selectedPickupPoint === point._id ? "default" : "outline"}
                            className={`w-full justify-start h-auto p-5 transition-colors rounded-xl ${
                              selectedPickupPoint === point._id 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600'
                                : 'hover:border-orange-300 border-gray-200 bg-white text-gray-800'
                            }`}
                            onClick={() => setSelectedPickupPoint(point._id)}
                          >
                            <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div className="text-left">
                              <p className="font-bold text-base">{point.name}</p>
                              <p className="text-sm opacity-90 mt-1">{point.location.address}</p>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Alert className="border-orange-300 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        No pickup points available for this student. Please contact support.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={goToPreviousStep} 
                      variant="outline" 
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button 
                      onClick={goToNextStep} 
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      disabled={!selectedPickupPoint}
                      size="lg"
                    >
                      Continue
                      <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="border border-orange-100 shadow-sm overflow-hidden bg-white">
                <div className="border-b border-orange-100 bg-orange-50 p-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="bg-white p-2.5 rounded-lg border border-orange-200 text-orange-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Delivery Date & Time</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Select when you want the order delivered</p>
                </div>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-3">
                    <Label htmlFor="deliveryDate" className="text-base font-semibold text-gray-900">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={getMinimumDate()}
                      max={getMaximumDate()}
                      className="border-gray-300 focus:border-orange-500 h-11"
                    />
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      Orders must be placed at least 1 day in advance.
                    </p>
                  </div>

                  {deliveryDate && timeSlotsData?.timeSlots && (
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Label className="text-base font-semibold text-gray-900">Available Time Slots</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlotsData.timeSlots.map((slot: CheckoutTimeSlot, idx: number) => (
                          <motion.div
                            key={slot.slot}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Button
                              variant={timeSlot === slot.slot ? "default" : "outline"}
                              onClick={() => setTimeSlot(slot.slot)}
                              disabled={slot.available === false}
                              className={`w-full h-14 transition-colors rounded-lg ${
                                timeSlot === slot.slot 
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600'
                                  : 'hover:border-orange-300 border-gray-200'
                              } ${slot.available === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Clock className="h-5 w-5 mr-2" />
                              <span className="font-semibold">{slot.slot}</span>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={goToPreviousStep} 
                      variant="outline" 
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button 
                      onClick={goToNextStep} 
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      disabled={!deliveryDate || !timeSlot}
                      size="lg"
                    >
                      Continue
                      <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="border border-orange-100 shadow-sm overflow-hidden bg-white">
                <div className="border-b border-orange-100 bg-orange-50 p-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="bg-white p-2.5 rounded-lg border border-orange-200 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Special Instructions</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Add any dietary notes or special requests (optional)</p>
                </div>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      className="grid gap-3"
                    >
                      <Label
                        htmlFor="cash_on_delivery"
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                          paymentMethod === 'cash_on_delivery'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                        <Banknote className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Cash on Delivery</p>
                          <p className="text-sm font-normal text-gray-600">Pay when the order is delivered to the pickup point.</p>
                        </div>
                      </Label>

                      <Label
                        htmlFor="online_payment"
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                          paymentMethod === 'online_payment'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <RadioGroupItem value="online_payment" id="online_payment" />
                        <CreditCard className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Online Payment</p>
                          <p className="text-sm font-normal text-gray-600">Place the order with online payment awaiting confirmation.</p>
                        </div>
                      </Label>

                      <Label
                        htmlFor="loyalty_points"
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                          availableLoyaltyPoints >= requiredLoyaltyPoints
                            ? 'cursor-pointer hover:border-orange-300'
                            : 'cursor-not-allowed bg-gray-50 opacity-70'
                        } ${paymentMethod === 'loyalty_points' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                      >
                        <RadioGroupItem
                          value="loyalty_points"
                          id="loyalty_points"
                          disabled={availableLoyaltyPoints < requiredLoyaltyPoints}
                        />
                        <Star className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Loyalty Points</p>
                          <p className="text-sm font-normal text-gray-600">
                            Use {requiredLoyaltyPoints.toLocaleString('en-LK')} points. Available: {availableLoyaltyPoints.toLocaleString('en-LK')}.
                          </p>
                          {availableLoyaltyPoints < requiredLoyaltyPoints && (
                            <p className="mt-1 text-xs font-medium text-red-600">Not enough loyalty points for this order.</p>
                          )}
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="instructions" className="text-base font-semibold text-gray-900">
                      Special Instructions
                    </Label>
                    <Textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g., No nuts, extra sauce, gluten-free options, etc."
                      rows={6}
                      className="border-gray-300 focus:border-orange-500 resize-none"
                    />
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      Let us know about any allergies or dietary preferences.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={goToPreviousStep} 
                      variant="outline" 
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button 
                      onClick={goToNextStep} 
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      size="lg"
                      disabled={!paymentMethod}
                    >
                      Review Order
                      <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Confirm Order */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="border border-orange-100 shadow-sm overflow-hidden bg-white">
                <div className="border-b border-orange-100 bg-orange-50 p-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="bg-white p-2.5 rounded-lg border border-orange-200 text-orange-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Confirm Your Order</span>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Review your order details before placing</p>
                </div>
                <CardContent className="space-y-6 p-6">
                  {/* Validation Results */}
                  {validationResult?.warnings && validationResult.warnings.length > 0 && (
                    <Alert className="border-orange-300 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <div className="space-y-1">
                          {validationResult.warnings.map((warning: string, idx: number) => (
                            <p key={idx}>⚠️ {warning}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-900">Order Summary</h3>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Student:</span>
                        <span className="font-bold text-gray-900">{selectedStudent?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Items:</span>
                        <Badge className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 font-semibold hover:bg-orange-100">
                          {cart.items.length} items
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Delivery Date:</span>
                        <span className="font-semibold text-gray-900">{new Date(deliveryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Time Slot:</span>
                        <span className="font-semibold text-gray-900">{timeSlot}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Payment Method:</span>
                        <span className="font-semibold text-gray-900">
                          {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : '-'}
                        </span>
                      </div>
                      {paymentMethod === 'loyalty_points' && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Points Used:</span>
                          <span className="font-semibold text-gray-900">
                            {requiredLoyaltyPoints.toLocaleString('en-LK')}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-xl text-gray-900">Total:</span>
                        <span className="font-bold text-2xl text-orange-600">
                          Rs. {cart.total}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={goToPreviousStep} 
                      variant="outline" 
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      size="lg"
                      disabled={isLoading}
                    >
                      <span className="flex items-center justify-center">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Place Order
                          </>
                        )}
                      </span>
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

export default StudentSelectionCheckout;
