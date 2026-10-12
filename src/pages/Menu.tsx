import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModernNavigation } from '@/components/navigation/ModernNavigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Food } from '@/types';
import fishRollImage from '@/assets/Fish Roll.webp';
import fishBunImage from '@/assets/fish bun.jpg';
import fishPastryImage from '@/assets/fish pastry.jpg';
import chickenBurgerImage from '@/assets/chicken burger.jpg';
import chickenPastryImage from '@/assets/chicken pastry.jpg';
import sausagePastryImage from '@/assets/sausage pastry.jpg';
import seeniSambolBunImage from '@/assets/seenisambol bun.jpg';
import teaBunImage from '@/assets/tea bun.jpg';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
] as const;

interface FoodWithMessage extends Food {
  message?: string;
}

interface DailyMenuResponse {
  available: Food[];
  unavailable: FoodWithMessage[];
}

const EMPTY_AVAILABLE_FOODS: Food[] = [];
const EMPTY_UNAVAILABLE_FOODS: FoodWithMessage[] = [];

const FOOD_IMAGES: Record<string, string> = {
  'Fish Roll': fishRollImage,
  'Fish Bun': fishBunImage,
  'Fish Pastry': fishPastryImage,
  'Chicken Burger': chickenBurgerImage,
  'Chicken Pastry': chickenPastryImage,
  'Sausage Pastry': sausagePastryImage,
  'Seeni Sambol Bun': seeniSambolBunImage,
  'Tea Bun': teaBunImage,
};

const getCurrentMenuDay = () => {
  const today = new Date().getDay();
  return today >= 1 && today <= 5 ? DAYS_OF_WEEK[today - 1].key : 'monday';
};

const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-LK')}`;

export const Menu: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>(getCurrentMenuDay);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, removeFromCart, cart, getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    window.history.scrollRestoration = 'manual';
    resetScroll();
    const animationFrame = window.requestAnimationFrame(resetScroll);
    const restorationTimer = window.setTimeout(resetScroll, 150);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(restorationTimer);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  const selectedDayLabel = DAYS_OF_WEEK.find((day) => day.key === selectedDay)?.label ?? 'Selected day';

  const { data, isLoading, error, refetch } = useQuery<DailyMenuResponse>({
    queryKey: ['foods', 'short-eats', 'day', selectedDay],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/food/day/${selectedDay}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the daily menu');
      }

      const result = await response.json() as Partial<DailyMenuResponse>;
      return {
        available: Array.isArray(result.available) ? result.available : [],
        unavailable: Array.isArray(result.unavailable) ? result.unavailable : [],
      };
    },
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
  });

  const availableFoods = data?.available ?? EMPTY_AVAILABLE_FOODS;
  const unavailableFoods = data?.unavailable ?? EMPTY_UNAVAILABLE_FOODS;
  const hasPublishedMenu = availableFoods.length + unavailableFoods.length > 0;
  const catalogFoodIds = useMemo(
    () => new Set([...availableFoods, ...unavailableFoods].map((food) => food._id)),
    [availableFoods, unavailableFoods]
  );

  useEffect(() => {
    if (!data) return;

    cart.items.forEach((item) => {
      if (!catalogFoodIds.has(item.foodId)) {
        removeFromCart(item.foodId);
      }
    });
  }, [cart.items, catalogFoodIds, data, removeFromCart]);

  const foodsByCategory = useMemo(() => {
    return availableFoods.reduce<Record<string, Food[]>>((groups, food) => {
      const category = food.category || 'Other';
      groups[category] = [...(groups[category] ?? []), food];
      return groups;
    }, {});
  }, [availableFoods]);

  const updateQuantity = (foodId: string, quantity: number) => {
    setQuantities((current) => ({
      ...current,
      [foodId]: Math.min(20, Math.max(1, quantity)),
    }));
  };

  const handleAddToCart = (food: Food) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in to order',
        description: 'Sign in first, then you can add this item to your pre-order.',
      });
      navigate('/menu?auth=login');
      return;
    }

    const quantity = quantities[food._id] ?? 1;
    addToCart(food, quantity);
    toast({
      title: 'Added to your pre-order',
      description: `${quantity} × ${food.name}`,
    });
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;

    if (!isAuthenticated) {
      navigate('/menu?auth=login');
      return;
    }

    navigate('/checkout', { state: { menuDay: selectedDay } });
  };

  return (
    <>
      <ModernNavigation />
      <main className="min-h-screen bg-[#fbfaf8] pt-[168px]">
        <section className="border-b border-orange-100 bg-white px-4 py-7 sm:py-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(540px,0.9fr)] lg:items-center">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Pre-order menu</p>
                <h1 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">Choose your short eats</h1>
                <p className="mt-2 max-w-2xl text-base leading-6 text-slate-600">
                  Select a menu day, choose the quantity, and add your favourite short eats to the order.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600 sm:gap-4 sm:px-4">
                {['Choose food', 'Set pickup', 'Confirm order'].map((step, index) => (
                  <div key={step} className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">{index + 1}</span>
                    <span className="hidden font-medium sm:inline">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                <CalendarDays className="h-4 w-4 text-orange-600" />
                Select the menu day
              </div>
              <Tabs value={selectedDay} onValueChange={setSelectedDay}>
                <TabsList className="grid h-auto w-full grid-cols-5 bg-slate-100 p-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <TabsTrigger
                      key={day.key}
                      value={day.key}
                      className="min-h-11 rounded-md px-2 text-slate-600 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                      <span className="hidden sm:inline">{day.label}</span>
                      <span className="sm:hidden">{day.short}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
              <div>
                {isLoading ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                      <Card key={item} className="border-slate-200">
                        <CardContent className="p-6">
                          <Skeleton className="mb-5 h-12 w-12 rounded-xl" />
                          <Skeleton className="mb-3 h-6 w-2/3" />
                          <Skeleton className="mb-6 h-4 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <Alert variant="destructive" className="bg-white">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                      <span>The {selectedDayLabel} menu could not be loaded. Please make sure the backend is running.</span>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
                    </AlertDescription>
                  </Alert>
                ) : !hasPublishedMenu ? (
                  <Card className="border-slate-200 bg-white">
                    <CardContent className="px-6 py-16 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                        <UtensilsCrossed className="h-8 w-8 text-orange-500" />
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900">The menu has not been published yet</h2>
                      <p className="mx-auto mt-2 max-w-lg text-slate-600">
                        Food items will appear here as soon as the daily menu is added. You can also check another weekday.
                      </p>
                    </CardContent>
                  </Card>
                ) : availableFoods.length === 0 ? (
                  <Card className="border-slate-200 bg-white">
                    <CardContent className="px-6 py-14 text-center">
                      <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <h2 className="font-serif text-2xl font-bold text-slate-900">Nothing is available on {selectedDayLabel}</h2>
                      <p className="mt-2 text-slate-600">Choose another day above to find available meals.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-9">
                    {Object.entries(foodsByCategory).map(([category, foods]) => (
                      <section key={category}>
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="font-serif text-2xl font-bold text-slate-900">{category}</h2>
                          <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
                            {foods.length} {foods.length === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          {foods.map((food) => {
                            const quantity = quantities[food._id] ?? 1;
                            const cartQuantity = cart.items.find((item) => item.foodId === food._id)?.quantity ?? 0;

                            return (
                              <Card key={food._id} className="overflow-hidden border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-orange-50 sm:h-32 sm:w-36">
                                      <div className="absolute inset-0 flex items-center justify-center text-orange-300">
                                        <UtensilsCrossed className="h-8 w-8" />
                                      </div>
                                      {FOOD_IMAGES[food.name] && (
                                        <img
                                          src={FOOD_IMAGES[food.name]}
                                          alt={food.name}
                                          className="relative h-full w-full object-cover"
                                          loading="lazy"
                                        />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="bg-orange-50 px-2 py-0.5 text-xs text-orange-700 hover:bg-orange-50">
                                          {food.category}
                                        </Badge>
                                        {cartQuantity > 0 && (
                                          <Badge className="bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 hover:bg-emerald-100">
                                            <Check className="mr-1 h-3 w-3" /> {cartQuantity} in cart
                                          </Badge>
                                        )}
                                      </div>
                                      <h3 className="mt-2 text-lg font-bold text-slate-900">{food.name}</h3>
                                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                                        {food.description || 'Freshly prepared for your pre-order.'}
                                      </p>
                                      <p className="mt-2 text-lg font-bold text-slate-900">{formatPrice(food.price)}</p>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                                    <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white">
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(food._id, quantity - 1)}
                                        disabled={quantity === 1}
                                        className="flex h-10 w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                                        aria-label={`Decrease ${food.name} quantity`}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="min-w-10 text-center text-sm font-bold text-slate-900">{quantity}</span>
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(food._id, quantity + 1)}
                                        disabled={quantity === 20}
                                        className="flex h-10 w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                                        aria-label={`Increase ${food.name} quantity`}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <Button
                                      onClick={() => handleAddToCart(food)}
                                      className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                                    >
                                      <ShoppingCart className="mr-2 h-4 w-4" />
                                      {isAuthenticated ? `Add ${quantity} to pre-order` : 'Sign in to order'}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                )}

                {!isLoading && unavailableFoods.length > 0 && (
                  <section className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-lg font-bold text-slate-800">Other menu items</h2>
                    <p className="mt-1 text-sm text-slate-500">These items are not prepared on {selectedDayLabel}.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {unavailableFoods.map((food) => (
                        <div key={food._id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 opacity-70">
                          <div>
                            <p className="font-semibold text-slate-700">{food.name}</p>
                            <p className="text-sm text-slate-500">{food.category || 'Menu item'}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-slate-500">Not available</Badge>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="sticky top-[164px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-orange-600">Your pre-order</p>
                    <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900">Order summary</h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </div>

                {cart.items.length === 0 ? (
                  <div className="my-8 rounded-xl bg-slate-50 px-4 py-6 text-center">
                    <p className="font-semibold text-slate-700">Your cart is empty</p>
                    <p className="mt-1 text-sm leading-5 text-slate-500">Choose a meal and quantity, then add it here.</p>
                  </div>
                ) : (
                  <div className="my-6 max-h-64 space-y-3 overflow-y-auto pr-1">
                    {cart.items.map((item) => (
                      <div key={item.foodId} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.food.name}</p>
                          <p className="text-xs text-slate-500">Quantity {item.quantity}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-slate-700">
                          {formatPrice(item.food.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}</p>
                      <p className="font-semibold text-slate-800">Order total</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{formatPrice(cart.total)}</p>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={cart.items.length === 0}
                    className="w-full bg-orange-600 text-white hover:bg-orange-700"
                    size="lg"
                  >
                    Continue to pickup details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                    You will choose the delivery date, pickup point and time before confirming.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Menu;
