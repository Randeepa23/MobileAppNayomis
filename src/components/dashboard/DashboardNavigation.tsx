import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  User, 
  ShoppingBag, 
  Star, 
  Heart, 
  Bell,
  Home,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { DashboardSection } from '@/pages/Dashboard';

interface DashboardNavigationProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const menuItems = [
    {
      id: 'overview' as DashboardSection,
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Dashboard summary'
    },
    {
      id: 'profile' as DashboardSection,
      label: 'Profile',
      icon: User,
      description: 'Personal information'
    },
    {
      id: 'orders' as DashboardSection,
      label: 'Orders',
      icon: ShoppingBag,
      description: 'Order history & tracking'
    },
    {
      id: 'loyalty' as DashboardSection,
      label: 'Loyalty Program',
      icon: Star,
      description: 'Points & rewards'
    },
    {
      id: 'favorites' as DashboardSection,
      label: 'Favorites',
      icon: Heart,
      description: 'Saved menu items'
    },
    {
      id: 'notifications' as DashboardSection,
      label: 'Notifications',
      icon: Bell,
      description: 'Settings & preferences'
    }
  ];

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h2>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <div className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                  {item.label}
                </div>
                <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-8 pt-6 border-t space-y-2">
        <Button
          variant="ghost"
          onClick={handleGoHome}
          className="w-full justify-start"
        >
          <Home className="h-4 w-4 mr-3" />
          Back to Restaurant
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
};