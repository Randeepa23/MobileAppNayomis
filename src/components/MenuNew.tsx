import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Utensils } from 'lucide-react';
import { Menu } from '@/components/menu/Menu';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

interface MenuItem {
  name: string;
  smallPrice: string;
  largePrice: string;
  image?: string;
}

interface MenuCategory {
  title: string;
  icon: string;
  items: MenuItem[];
}

const menuData: MenuCategory[] = [
  {
    title: "Fried Rice",
    icon: "🍚",
    items: [
      { name: "Vegetable", smallPrice: "400", largePrice: "600" },
      { name: "Egg", smallPrice: "400", largePrice: "600" },
      { name: "Chicken", smallPrice: "450", largePrice: "700" },
      { name: "Seafood", smallPrice: "600", largePrice: "800" },
      { name: "Mixed", smallPrice: "650", largePrice: "900" },
    ],
  },
  {
    title: "Sri Lankan Spice Koththu",
    icon: "🌶️",
    items: [
      { name: "Vegetable", smallPrice: "350", largePrice: "450" },
      { name: "Egg", smallPrice: "350", largePrice: "450" },
      { name: "Chicken", smallPrice: "400", largePrice: "600" },
      { name: "Seafood", smallPrice: "450", largePrice: "750" },
      { name: "Mixed (Egg / Chicken / Seafood)", smallPrice: "500", largePrice: "900" },
    ],
  },
  {
    title: "Cheese Koththu",
    icon: "🧀",
    items: [
      { name: "Vegetable", smallPrice: "400", largePrice: "600" },
      { name: "Egg", smallPrice: "400", largePrice: "600" },
      { name: "Chicken", smallPrice: "500", largePrice: "750" },
      { name: "Seafood", smallPrice: "550", largePrice: "850" },
      { name: "Mixed (Egg / Chicken / Seafood)", smallPrice: "600", largePrice: "1000" },
    ],
  },
  {
    title: "String Hoppers Koththu",
    icon: "🍜",
    items: [
      { name: "Vegetable", smallPrice: "350", largePrice: "450" },
      { name: "Egg", smallPrice: "350", largePrice: "450" },
      { name: "Chicken", smallPrice: "400", largePrice: "600" },
      { name: "Seafood", smallPrice: "450", largePrice: "750" },
      { name: "Mixed (Egg / Chicken / Seafood)", smallPrice: "500", largePrice: "900" },
    ],
  },
  {
    title: "Noodles",
    icon: "🍝",
    items: [
      { name: "Vegetable", smallPrice: "400", largePrice: "600" },
      { name: "Egg", smallPrice: "400", largePrice: "600" },
      { name: "Chicken", smallPrice: "450", largePrice: "700" },
      { name: "Seafood", smallPrice: "600", largePrice: "800" },
      { name: "Mixed", smallPrice: "650", largePrice: "900" },
    ],
  },
  {
    title: "Side Dishes",
    icon: "🍗",
    items: [
      { name: "Fish Devilled", smallPrice: "900", largePrice: "-" },
      { name: "Chicken Devilled", smallPrice: "850", largePrice: "-" },
      { name: "Fried Fish", smallPrice: "900", largePrice: "-" },
      { name: "Fried Chicken", smallPrice: "850", largePrice: "-" },
    ],
  },
];

const MenuNew = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  
  // Function to determine if an item should display a special badge
  const hasSpecialBadge = (category: string, itemName: string) => {
    if (itemName.includes("Mixed")) return "Popular";
    if (category === "Cheese Koththu") return "Cheesy";
    return null;
  };

  return (
    <section id="menu" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold mb-6 shadow-gold">
            <Utensils className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary tracking-tight">
            Our <span className="text-gold-dark">Signature</span> Menu
          </h2>
          <div className="w-24 h-1 bg-gold-light mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Explore our authentic Sri Lankan flavors, meticulously prepared with premium ingredients and traditional techniques
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Category Selection */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 md:mb-16">
            {menuData.map((category, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (selectedCategory !== idx) {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setSelectedCategory(idx);
                      setIsAnimating(false);
                    }, 300);
                  }
                }}
                className={`px-3 sm:px-4 md:px-8 py-2 md:py-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                  selectedCategory === idx
                    ? "gradient-gold text-primary shadow-gold scale-105 border-b-2 border-gold-dark"
                    : "bg-secondary/60 text-foreground hover:bg-secondary border border-secondary/20"
                }`}
              >
                <span className="mr-1 sm:mr-3 text-lg sm:text-xl">{category.icon}</span>
                <span className="hidden xs:inline">{category.title}</span>
                <span className="xs:hidden">{category.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Menu Items Display */}
          <Card className={`shadow-elegant border-0 overflow-hidden ${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 bg-white/95 backdrop-blur-sm`}>
            <div className="bg-gradient-to-r from-primary to-ocean-blue p-8 relative">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold-light to-gold-dark"></div>
              <h3 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
                <span className="text-4xl shadow-text">{menuData[selectedCategory].icon}</span>
                <span className="tracking-wide shadow-text">{menuData[selectedCategory].title}</span>
              </h3>
            </div>
            <CardContent className="p-4 sm:p-6 md:p-10">
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {menuData[selectedCategory].items.map((item, idx) => (
                    <div
                    key={idx}
                    className={`group bg-cream hover:bg-secondary/70 transition-all duration-300 rounded-xl p-4 sm:p-7 hover:shadow-xl cursor-pointer border ${hoveredItem === idx ? 'border-gold/60 transform scale-[1.02] shadow-lg' : 'border-secondary/20'} overflow-hidden`}
                    onMouseEnter={() => setHoveredItem(idx)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <h4 className="text-lg sm:text-xl font-semibold text-primary group-hover:text-gold-dark transition-smooth tracking-tight">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
                        {menuData[selectedCategory].title === "Cheese Koththu" && (
                          <Badge className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-primary border-0 text-xs sm:text-sm">
                            Extra Cheesy
                          </Badge>
                        )}
                        {menuData[selectedCategory].title === "String Hoppers Koththu" && (
                          <Badge className="bg-gradient-to-r from-red-300 to-red-500 text-white border-0 text-xs sm:text-sm">
                            Traditional
                          </Badge>
                        )}
                        {menuData[selectedCategory].title === "Noodles" && (
                          <Badge className="bg-gradient-to-r from-amber-300 to-amber-500 text-primary border-0 text-xs sm:text-sm">
                            Wok Tossed
                          </Badge>
                        )}
                        {item.name.includes("Mixed") && (
                          <Badge className="gradient-gold text-primary border-0 text-xs sm:text-sm">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">Small Portion</p>
                          <p className="text-xl sm:text-2xl font-bold text-gold-dark flex items-center">
                            <span className="text-xs sm:text-sm font-normal text-muted-foreground mr-1">LKR</span> {item.smallPrice}
                          </p>
                        </div>
                        {item.largePrice !== "-" && (
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">Large Portion</p>
                            <p className="text-xl sm:text-2xl font-bold text-gold-dark flex items-center">
                              <span className="text-xs sm:text-sm font-normal text-muted-foreground mr-1">LKR</span> {item.largePrice}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All prices note */}
          <div className="mt-12 border-t border-secondary/30 pt-6">
            <p className="text-center text-muted-foreground text-sm italic">
              All prices are in Sri Lankan Rupees (LKR). Prices may vary on special occasions and holidays.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuNew;
