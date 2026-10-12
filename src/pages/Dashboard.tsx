import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Package, Award, Heart, Bell } from 'lucide-react';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ProfileSettings } from '@/components/dashboard/ProfileSettings';
import { OrderTracking } from '@/components/dashboard/OrderTracking';
import { LoyaltyProgram } from '@/components/dashboard/LoyaltyProgram';
import { Favorites } from '@/components/dashboard/Favorites';
import { NotificationSettings } from '@/components/dashboard/NotificationSettings';
import Hero from '@/components/Hero';

export type DashboardSection = 'overview' | 'profile' | 'orders' | 'loyalty' | 'favorites' | 'notifications';

interface DashboardRouteState {
  section?: DashboardSection;
  orderId?: string;
}

const isDashboardSection = (value: unknown): value is DashboardSection => (
  typeof value === 'string'
  && ['overview', 'profile', 'orders', 'loyalty', 'favorites', 'notifications'].includes(value)
);

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as DashboardRouteState | null;
  const [activeSection, setActiveSection] = useState<DashboardSection>(() => (
    isDashboardSection(routeState?.section) ? routeState.section : 'overview'
  ));
  const contentRef = useRef<HTMLDivElement>(null);

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    // Smooth scroll to content area
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'profile':
        return <ProfileSettings />;
      case 'orders':
        return <OrderTracking />;
      case 'loyalty':
        return <LoyaltyProgram />;
      case 'favorites':
        return <Favorites />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with User Info Overlay */}
      <div className="relative">
        <Hero variant="dashboard" />
        
        {/* Compact Modern Header - Nayomi's Dashboard - Light & Fresh */}
        <motion.div
          className="absolute top-0 left-0 right-0 bg-gradient-to-r from-white via-orange-50/80 to-white backdrop-blur-xl border-b-2 border-orange-200 shadow-lg shadow-orange-100/50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        >
          <div className="container mx-auto px-6 py-3 max-w-7xl">
            
            {/* Single Compact Row */}
            <div className="flex items-center justify-between gap-6">
              
              {/* Left: Logo + Welcome */}
              <div className="flex items-center gap-5">
                {/* Nayomi's Logo */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="flex-shrink-0 relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-300 via-amber-300 to-orange-300 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition duration-300"></div>
                  <div className="relative bg-white p-2 rounded-2xl shadow-md border-2 border-orange-300/70">
                    <img 
                      src="/src/assets/herologo.png" 
                      alt="Nayomi's" 
                      className="h-10 w-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><text x="10" y="28" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="%23f97316">Nayomi%27s</text></svg>';
                      }}
                    />
                  </div>
                </motion.div>

                {/* Subtle Divider */}
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-orange-300 to-transparent shadow-sm"></div>

                {/* Avatar + Welcome */}
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-300 to-pink-300 rounded-xl blur opacity-50 animate-pulse"></div>
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 p-0.5 shadow-lg shadow-orange-300/50">
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <span className="text-white font-black text-base drop-shadow-lg">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </motion.div>

                  <div>
                    <h1 className="text-base font-bold text-gray-800 tracking-tight leading-tight">
                      Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 font-black">{user?.name}</span>
                    </h1>
                    <p className="text-xs text-gray-600 font-semibold">
                      Manage your delicious orders
                    </p>
                  </div>
                </div>
              </div>

              {/* Center: Colorful Navigation Pills */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'orders', label: 'Orders', icon: Package },
                  { id: 'loyalty', label: 'Loyalty', icon: Award },
                  { id: 'favorites', label: 'Favorites', icon: Heart },
                  { id: 'notifications', label: 'Alerts', icon: Bell }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeSection === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleSectionChange(tab.id as DashboardSection)}
                      className={`relative group px-4 py-2 rounded-full font-bold text-xs transition-all duration-300 ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                      whileHover={{ y: -2, scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {/* Active background - Soft gradient */}
                      {isActive && (
                        <motion.div
                          layoutId="compactActiveTab"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-full shadow-md shadow-orange-300/60"
                          transition={{ type: "spring", stiffness: 380, damping: 25 }}
                        />
                      )}
                      
                      {/* Inactive background - Subtle */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/60 to-amber-100/60 group-hover:from-orange-200/80 group-hover:to-amber-200/80 border border-orange-200 group-hover:border-orange-300 rounded-full transition-all duration-300 shadow-sm"></div>
                      )}
                      
                      {/* Content */}
                      <span className="relative flex items-center gap-1.5 z-10">
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Right: Colorful Points + Back */}
              <div className="flex items-center gap-3">
                {/* Loyalty Points - Vibrant */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative flex items-center gap-2.5 bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 border-2 border-orange-300 rounded-xl px-3 py-2 shadow-lg shadow-orange-200/60">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 shadow-md">
                      <Award className="w-4.5 h-4.5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-white/95 uppercase tracking-widest leading-none mb-0.5">Points</p>
                      <p className="text-lg font-black text-white leading-none">{user?.points || 0}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Back Button - Light */}
                <Button
                  onClick={() => navigate('/')}
                  className="bg-white hover:bg-orange-50 border-2 border-orange-300 hover:border-orange-400 text-orange-600 hover:text-orange-700 shadow-md hover:shadow-lg transition-all duration-300 h-9 px-4 rounded-xl font-bold"
                >
                  <Home className="w-4 h-4 mr-1.5" />
                  <span className="text-xs">Back</span>
                </Button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div ref={contentRef} className="container mx-auto px-4 py-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          {renderActiveSection()}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
