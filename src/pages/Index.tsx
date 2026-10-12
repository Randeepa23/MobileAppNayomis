import { useState } from "react";
import { Navigation as OldNavigation } from "@/components/Navigation";
import { ModernNavigation } from "@/components/navigation/ModernNavigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import { MenuSection } from "@/components/menu/MenuSection";
import Gallery from "@/components/Gallery";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { OrderHistory } from "@/components/orders/OrderHistory";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Professional role-based admin check
  const isAdmin = user?.role === 'admin';

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 bg-white shadow-sm border-b">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAdminPanel(false)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Website</span>
              </Button>
              <Badge variant="destructive" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Admin Panel</span>
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Modern Navigation with Auth */}
      <ModernNavigation />

      {/* Hero Section */}
      <section id="hero">
        <Hero />
      </section>

      {/* About Section */}
      <section id="about">
        <About />
      </section>

      {/* Menu Section with API Integration */}
      <section id="menu">
        <MenuSection />
      </section>

      {/* Order History Section - Only show if authenticated */}
      {isAuthenticated && (
        <motion.section 
          id="orders"
          className="py-16 bg-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <OrderHistory />
          </div>
        </motion.section>
      )}

      {/* Admin Access Button - Only show for admin users */}
      {isAuthenticated && isAdmin && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={() => setShowAdminPanel(true)}
            className="bg-red-600 hover:bg-red-700 shadow-lg"
            size="lg"
          >
            <Shield className="mr-2 h-5 w-5" />
            Admin Panel
          </Button>
        </motion.div>
      )}

      {/* Gallery Section */}
      <section id="gallery">
        <Gallery />
      </section>

      {/* Services Section */}
      <section id="services">
        <Services />
      </section>

      {/* Contact Section */}
      <section id="contact">
        <Contact />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Index;