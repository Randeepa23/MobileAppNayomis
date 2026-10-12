import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { 
  User, 
  LogOut, 
  History, 
  Star,
  Menu as MenuIcon,
  X,
  Settings,
  ShoppingCart,
  Search,
  Facebook,
  Instagram
} from 'lucide-react';
import TripAdvisorIcon from '@/components/icons/TripAdvisorIcon';
import IDBIcon from '@/components/icons/IDBIcon';
import UberEatsIcon from '@/components/icons/UberEatsIcon';
import { useAuth } from '@/contexts/AuthContext';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { AuthForm } from '@/components/auth/AuthForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from '@/assets/logo1.png';

interface NavigationProps {
  className?: string;
}

export const ModernNavigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { scrollY } = useScroll();

  // Check for auth query parameter and open dialog
  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'register' || authParam === 'login') {
      setIsAuthDialogOpen(true);
      // Remove the parameter from URL
      searchParams.delete('auth');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  const handleNavigation = (item: { label: string; href: string }) => {
    if (item.label === 'Home') {
      navigate('/');
      // Scroll to top/hero section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.href.startsWith('/')) {
      // Handle route navigation (like /pre-order)
      navigate(item.href);
    } else {
      // For section links (starting with #), check if we're on the home page
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        // Navigate to home page first, then scroll to section
        navigate('/');
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          scrollToSection(item.href.replace('#', ''));
        }, 100);
      } else {
        // Already on home page, just scroll
        scrollToSection(item.href.replace('#', ''));
      }
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to menu section with search query
      navigate('/?search=' + encodeURIComponent(searchQuery));
      scrollToSection('menu');
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const socialLinks = [
    { 
      icon: Facebook, 
      href: 'https://www.facebook.com/share/1GVzhNCEZ6/?mibextid=wwXIfr',
      label: 'Facebook',
      color: 'hover:bg-blue-600'
    },
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/nayomiswaterfront/?hl=en',
      label: 'Instagram',
      color: 'hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-600'
    },
    { 
      icon: TripAdvisorIcon, 
      href: 'https://www.tripadvisor.com/Restaurant_Review-g1500185-d14769780-Reviews-Nayomi_s_Waterfront-Katunayake_Negombo_Western_Province.html',
      label: 'TripAdvisor',
      color: 'hover:bg-green-600'
    },
    { 
      icon: IDBIcon, 
      href: 'https://bizconnect.idb.gov.lk/listing/gampaha/food-and-beverages/nayomis/',
      label: 'IDB',
      color: 'hover:bg-red-700'
    },
    { 
      icon: UberEatsIcon, 
      href: 'https://www.ubereats.com/lk/store/nayomis-fortress-negombo/pobCGo44QMCZk0OQG0AlBw?srsltid=AfmBOooMaJmZltXZg1DBTrdXv4pHN6kxBMqkXcTl0TnLxnCyipKIo3Gh',
      label: 'Uber Eats',
      color: 'hover:bg-green-500'
    }
  ];

  const navItems = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Menu', href: '#menu' },
    { label: 'Pre-Order Food', href: '/pre-order' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ];

  const mobileMenuVariants = {
    closed: {
      x: '100%',
      transition: {
        duration: 0.3
      }
    },
    open: {
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      {/* Top Bar - Social & Branding */}
      <motion.div 
        className="fixed w-full top-0 z-[51] bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 border-b border-orange-400/30 shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-11">
            {/* Left - Social Links */}
            <div className="flex items-center space-x-2.5">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full bg-white/10 backdrop-blur-sm text-white transition-all duration-300 ${social.color} hover:bg-white hover:text-orange-600`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>

            {/* Center - Tagline */}
            <motion.div 
              className="hidden md:block text-white text-sm font-semibold tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ✨Plan Ahead. Eat Fresh. Stress Less✨
            </motion.div>

            {/* Right - Contact */}
            <div className="text-white text-sm font-semibold tracking-wide">
              📞 +94 76 799 3874
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <motion.nav 
        className={`fixed w-full top-11 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white shadow-2xl border-b-2 border-orange-500' 
            : 'bg-white/95 backdrop-blur-xl shadow-lg'
        } ${className}`}
        style={{ fontFamily: "'Playfair Display', 'Poppins', serif" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="container mx-auto px-8 lg:px-16">
          <div className="flex items-center justify-between h-24">
            {/* Logo Only */}
            <motion.div 
              className="cursor-pointer flex-shrink-0"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src={logo} 
                alt="Nayomi's" 
                className="h-20 w-20 object-contain block"
                onError={(e) => console.error('Logo failed to load:', e)}
              />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center mx-16">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavigation(item)}
                  className="relative group px-1 py-2 whitespace-nowrap"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  whileHover={{ y: -2 }}
                >
                  <span className="text-gray-800 group-hover:text-orange-600 font-semibold tracking-wide transition-colors duration-300 text-base uppercase">
                    {item.label}
                  </span>
                  
                  {/* Animated underline */}
                  <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300 rounded-full" />
                  
                  {/* Dot indicator */}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search an item..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-56 h-10 pr-12 pl-4 border-2 border-blue-600 focus:border-blue-700 focus:ring-2 focus:ring-blue-400 rounded-full text-sm text-gray-800 placeholder:text-gray-500 shadow-md focus:shadow-lg transition-all bg-white"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800 hover:shadow-md hover:scale-105 transition-all duration-300"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Cart */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CartSidebar />
              </motion.div>

              {/* Authentication */}
              <AnimatePresence mode="wait">
              {isAuthenticated && user ? (
                <motion.div
                  key="user-menu"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                <DropdownMenu defaultOpen={false}>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="relative p-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-white/40">
                        <AvatarFallback className="bg-white/20 text-white font-bold text-base">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent className="w-64 bg-white border-orange-200 mt-2" align="end">
                    <DropdownMenuLabel className="font-normal border-b border-gray-100 pb-2">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold text-gray-900">{user.name.charAt(0).toUpperCase() + user.name.slice(1)}</p>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:bg-orange-50 focus:bg-orange-50 py-2.5">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Dashboard</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => scrollToSection('orders')} className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:bg-orange-50 focus:bg-orange-50 py-2.5">
                    <History className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Order History</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:bg-orange-50 focus:bg-orange-50 py-2.5">
                    <Star className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Reviews</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-orange-100" />
                  
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 py-2.5">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                </motion.div>
            ) : (
              <motion.div
                  key="auth-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
              <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 border border-orange-400"
                    aria-label="Sign In"
                  >
                    <User className="h-5 w-5" />
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-md bg-white border-orange-200">
                  <VisuallyHidden>
                    <DialogTitle>Authentication</DialogTitle>
                    <DialogDescription>Sign in or register for your account</DialogDescription>
                  </VisuallyHidden>
                  <AuthForm onClose={() => setIsAuthDialogOpen(false)} />
                </DialogContent>
              </Dialog>
                </motion.div>
            )}
              </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200 rounded-xl p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 right-0 w-80 bg-gradient-to-b from-white via-orange-50/30 to-white shadow-2xl z-[52] lg:hidden border-l-2 border-orange-300"
            style={{ top: '140px' }}
          >
            <div className="flex flex-col h-full">
              {/* Header with Search */}
              <div className="p-5 border-b border-orange-200 bg-gradient-to-r from-orange-500 to-red-600">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pr-12 border-2 border-white/30 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 placeholder:text-gray-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-2 rounded-full bg-gradient-to-r from-orange-600 to-red-700 text-white hover:shadow-lg transition-all"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* User Section */}
              {isAuthenticated && user ? (
                <div className="p-5 border-b border-orange-200 bg-gradient-to-r from-orange-100/50 to-red-100/50">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-orange-500">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-orange-700 font-medium">⭐ {user.points} points</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Navigation Items */}
              <div className="flex-1 py-3 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item)}
                    className="w-full text-left px-6 py-4 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-orange-600"
                  >
                    {item.label}
                  </button>
                ))}
                
                {isAuthenticated && user && (
                  <>
                    <div className="px-6 py-2">
                      <div className="h-px bg-orange-200" />
                    </div>
                    <button
                      onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-6 py-4 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-orange-600 flex items-center"
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { scrollToSection('orders'); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-6 py-4 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all duration-200 font-semibold border-l-4 border-transparent hover:border-orange-600 flex items-center"
                    >
                      <History className="mr-3 h-5 w-5" />
                      Order History
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-5 border-t-2 border-orange-200 space-y-3 bg-gradient-to-r from-orange-50 to-red-50">
                {/* Social Links */}
                <div className="flex items-center justify-center space-x-3 pb-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-full bg-white text-orange-600 shadow-md hover:shadow-xl transition-all duration-300 ${social.color}`}
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>

                {/* Cart */}
                <div className="flex justify-center">
                  <CartSidebar />
                </div>
                
                {/* Auth */}
                <AnimatePresence mode="wait">
                {isAuthenticated ? (
                  <motion.div
                    key="mobile-logout"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-center bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-semibold rounded-full py-6"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-signin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                  <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-xl rounded-full py-6">
                        <User className="mr-2 h-5 w-5" />
                        Sign In
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 max-w-md bg-white border-orange-200">
                      <VisuallyHidden>
                        <DialogTitle>Authentication</DialogTitle>
                        <DialogDescription>Sign in or register for your account</DialogDescription>
                      </VisuallyHidden>
                      <AuthForm onClose={() => setIsAuthDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[51] lg:hidden"
            style={{ top: '140px' }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};