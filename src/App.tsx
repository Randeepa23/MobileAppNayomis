import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PageLoader } from "@/components/common/LoadingSkeleton";
import { lazy, Suspense } from "react";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Menu = lazy(() => import("./pages/Menu"));
const Checkout = lazy(() => import("./pages/Checkout"));
const IntelligentCheckout = lazy(() => import("./pages/IntelligentCheckout"));
const StudentSelectionCheckout = lazy(() => import("./pages/StudentSelectionCheckout"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PreOrderFood = lazy(() => import("./pages/PreOrderFood"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Suspense fallback={<PageLoader />}>
          <Index />
        </Suspense>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <Suspense fallback={<PageLoader />}>
          <Dashboard />
        </Suspense>
      ),
    },
    {
      path: "/menu",
      element: (
        <Suspense fallback={<PageLoader />}>
          <Menu />
        </Suspense>
      ),
    },
    {
      path: "/checkout",
      element: (
        <Suspense fallback={<PageLoader />}>
          <StudentSelectionCheckout />
        </Suspense>
      ),
    },
    {
      path: "/admin/login",
      element: (
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      ),
    },
    {
      path: "/admin",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/admin/dashboard",
      element: (
        <ProtectedAdminRoute>
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        </ProtectedAdminRoute>
      ),
    },
    {
      path: "/pre-order",
      element: (
        <Suspense fallback={<PageLoader />}>
          <PreOrderFood />
        </Suspense>
      ),
    },
    {
      path: "*",
      element: (
        <Suspense fallback={<PageLoader />}>
          <NotFound />
        </Suspense>
      ),
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <RouterProvider router={router} />
            </TooltipProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
