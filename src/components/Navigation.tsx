import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  User, 
  LogOut, 
  Star, 
  UtensilsCrossed,
  ClipboardList,
  Crown,
  Waves
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { AuthForm } from '@/components/auth/AuthForm';
import logo from '@/assets/logo1.png';

interface NavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeSection = 'menu', 
  onSectionChange 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();

  const handleSectionChange = (section: string) => {
    onSectionChange?.(section);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'orders', label: 'My Orders', icon: ClipboardList, requireAuth: true },
  ];

  const getLoyaltyTier = (points: number) => {
    if (points >= 1000) return { name: 'Gold', color: 'text-yellow-600', icon: Crown };
    if (points >= 500) return { name: 'Silver', color: 'text-gray-500', icon: Star };
    return { name: 'Bronze', color: 'text-amber-600', icon: Star };
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSectionChange('menu')}
            >
              <img 
                src={logo} 
                alt="Nayomi's Waterfront Logo" 
                className="h-14 w-auto object-contain"
              />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const canAccess = !item.requireAuth || isAuthenticated;
                
                if (!canAccess) return null;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Cart */}
              <CartSidebar isOpen={isCartOpen} onOpenChange={setIsCartOpen} />

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {/* Loyalty Points */}
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    {React.createElement(getLoyaltyTier(user.points).icon, {
                      className: `h-4 w-4 ${getLoyaltyTier(user.points).color}`
                    })}
                    <span className="text-sm font-medium text-blue-700">
                      {user.points} pts
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {getLoyaltyTier(user.points).name}
                    </Badge>
                  </motion.div>

                  {/* User Menu */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-right">
                      <p className="text-sm font-medium text-gray-700">{user.name.charAt(0).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {getTotalItems() > 0 && (
                <CartSidebar isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
              )}
              
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    
                    {/* Mobile Header */}
                    <div className="flex items-center gap-2 mb-6">
                      <Waves className="h-6 w-6 text-blue-600" />
                      <div>
                        <h2 className="font-bold text-blue-900">Nayomi's Waterfront</h2>
                        <p className="text-xs text-blue-500">Fresh • Delicious • Authentic</p>
                      </div>
                    </div>

                    {/* User Info */}
                    {isAuthenticated && user ? (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{user.name.charAt(0).toUpperCase()}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {React.createElement(getLoyaltyTier(user.points).icon, {
                              className: `h-4 w-4 ${getLoyaltyTier(user.points).color}`
                            })}
                            <span className="text-sm font-medium">{user.points} points</span>
                          </div>
                          <Badge variant="secondary">
                            {getLoyaltyTier(user.points).name}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <Button 
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </div>
                    )}

                    <Separator className="mb-6" />

                    {/* Mobile Navigation */}
                    <div className="flex-1 space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        const canAccess = !item.requireAuth || isAuthenticated;
                        
                        if (!canAccess) return null;
                        
                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => handleSectionChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                              isActive 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Mobile Logout */}
                    {isAuthenticated && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsAuthModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AuthForm onClose={() => setIsAuthModalOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
