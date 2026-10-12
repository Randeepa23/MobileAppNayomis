import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ModernNavigation } from '@/components/navigation/ModernNavigation';
import Footer from '@/components/Footer';
import preOrderBg from '@/assets/PRE-ORDER.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderTracking } from '@/components/dashboard/OrderTracking';
import { LiveSensorReadings } from '@/components/preorder/LiveSensorReadings';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Shield,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Radio
} from 'lucide-react';

const PreOrderFood = () => {
  const { isAuthenticated, user } = useAuth();
  const { cart, getTotalItems } = useCart();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [activeTab, setActiveTab] = React.useState('place-order');

  const handlePlacePreOrder = () => {
    if (cart.items.length === 0) {
      navigate('/menu');
      return;
    }
    if (!isAuthenticated) {
      navigate('/pre-order?auth=login');
      return;
    }
    navigate('/checkout');
  };
  
  // Parallax effect - image moves slower than scroll
  const yBackground = useTransform(scrollY, [0, 1000], [0, 300]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Parents create a free account or log in to get started with pre-ordering",
      icon: UserPlus,
      color: "from-blue-500 to-indigo-600"
    },
    {
      number: 2,
      title: "Select & Schedule",
      description: "Choose your child's favorite meals, pickup location, and delivery date",
      icon: ShoppingBag,
      color: "from-orange-500 to-amber-600"
    },
    {
      number: 3,
      title: "Fresh Delivery",
      description: "We prepare and deliver fresh food at your scheduled time near the school",
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Your Morning Time",
      description: "No more rushing in the morning. Pre-order and relax.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: MapPin,
      title: "Free Delivery",
      description: "Zero delivery charges for all pre-ordered meals.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Fresh & Safe Meals",
      description: "Freshly prepared food with quality ingredients.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Calendar,
      title: "School Routine Ready",
      description: "Perfectly scheduled for your child's school timing.",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <>
      <ModernNavigation />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section - Full Screen Image */}
        <motion.section
          className="relative overflow-hidden h-[calc(100vh-140px)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
        {/* Background Image - Clear without overlay with Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: yBackground, scale }}
        >
          <img 
            src={preOrderBg} 
            alt="Pre-order background" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Wave Transition at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="w-full h-16 md:h-24"
          >
            <path 
              d="M0,64 C240,96 480,96 720,64 C960,32 1200,32 1200,64 L1200,120 L0,120 Z" 
              fill="#16e72be6"
              stroke="#000000ff"
              strokeWidth="8"
              className="drop-shadow-xl"
            />
          </svg>
        </div>
      </motion.section>

      <section className="border-b border-orange-100 bg-white px-4 py-10">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-orange-50 p-1.5">
              <TabsTrigger value="place-order" className="h-auto whitespace-normal py-3 text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white sm:text-sm">
                <ShoppingBag className="mr-1.5 h-4 w-4 shrink-0" />Place Pre-Order
              </TabsTrigger>
              <TabsTrigger value="my-orders" className="h-auto whitespace-normal py-3 text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white sm:text-sm">
                <ClipboardList className="mr-1.5 h-4 w-4 shrink-0" />My Pre-Orders
              </TabsTrigger>
              <TabsTrigger value="sensor-readings" className="h-auto whitespace-normal py-3 text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white sm:text-sm">
                <Radio className="mr-1.5 h-4 w-4 shrink-0" />Live Sensor Readings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="place-order" className="mt-6">
              <Card className="border-orange-200">
                <CardContent className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Schedule a fresh meal</h2>
                    <p className="mt-2 text-gray-600">
                      {cart.items.length > 0
                        ? `${getTotalItems()} item${getTotalItems() === 1 ? '' : 's'} in your cart. Continue to choose pickup details and delivery time.`
                        : 'Choose food from the menu first, then return here to complete your pre-order.'}
                    </p>
                  </div>
                  <Button onClick={handlePlacePreOrder} className="shrink-0 bg-orange-600 hover:bg-orange-700">
                    {cart.items.length > 0 ? 'Continue to Checkout' : 'Choose Food'}<ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-orders" className="mt-6">
              <div className="overflow-hidden rounded-xl border border-orange-200 bg-white">
                <OrderTracking active={activeTab === 'my-orders'} />
              </div>
            </TabsContent>

            <TabsContent value="sensor-readings" className="mt-6">
              <LiveSensorReadings active={activeTab === 'sensor-readings'} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-[#FFF8E7]">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-orange-100 text-orange-700 border-orange-300 px-4 py-1.5 text-sm font-semibold mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is easy! Follow these three simple steps to ensure fresh meals for your children.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="relative overflow-hidden border-2 hover:border-orange-300 transition-all duration-300 h-full group hover:shadow-xl">
                  <CardContent className="p-8">
                    {/* Step Number Badge */}
                    <motion.div
                      className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>

                  {/* Arrow connector (except for last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-orange-400" />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 px-4 py-1.5 text-sm font-semibold mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Key Benefits
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed specifically for busy parents who want the best for their children.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="border-2 hover:border-orange-300 transition-all duration-300 h-full hover:shadow-xl">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <benefit.icon className="w-8 h-8 text-white"/>
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden border-none shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600"></div>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '30px 30px'
              }}></div>
              
              <CardContent className="relative z-10 p-12 text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="inline-block mb-6"
                >
                  <Heart className="w-16 h-16 mx-auto fill-white" />
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  {isAuthenticated 
                    ? `Welcome back, ${user?.name}!` 
                    : "Ready to Get Started?"}
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  {isAuthenticated
                    ? "Head to your dashboard to manage your pre-orders and ensure fresh meals for your children."
                    : "Join thousands of happy parents who trust us for their children's meals. Create your account today!"}
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {!isAuthenticated ? (
                    <Button
                      size="lg"
                      onClick={() => navigate('/?auth=register')}
                      className="bg-white text-orange-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-6 text-lg font-bold"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Sign Up Now - It's Free!
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => navigate('/dashboard')}
                      className="bg-white text-orange-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-6 text-lg font-bold"
                    >
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-gray-600 text-lg mb-6 font-semibold">
              Trusted by parents and loved by children
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">100% Fresh Ingredients</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Zero Delivery Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">On-Time Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
};

export default PreOrderFood;
