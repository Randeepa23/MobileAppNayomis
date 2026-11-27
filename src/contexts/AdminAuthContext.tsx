import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '@/services/api';

const API_URL = `${API_BASE_URL}/admin-auth`;

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
  verifyAdminToken: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('nayomis_admin_token');
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem('nayomis_admin_email');
  });

  // Check for existing admin token on mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('nayomis_admin_token');
      if (token) {
        const isValid = await verifyAdminToken();
        if (!isValid) {
          logoutAdmin();
        }
      }
    };
    checkAdminAuth();
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid admin credentials');
      }

      const data = await response.json();
      const { token, admin } = data;

      // Store admin token and email
      localStorage.setItem('nayomis_admin_token', token);
      localStorage.setItem('nayomis_admin_email', admin.email);

      setIsAdminAuthenticated(true);
      setAdminEmail(admin.email);

    } catch (error: any) {
      console.error('Admin login error:', error);
      throw new Error(error.message || 'Invalid admin credentials');
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('nayomis_admin_token');
    localStorage.removeItem('nayomis_admin_email');
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
  };

  const verifyAdminToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('nayomis_admin_token');
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_URL}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data.valid) {
        setIsAdminAuthenticated(true);
        setAdminEmail(data.admin.email);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Admin token verification failed:', error);
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminEmail,
        loginAdmin,
        logoutAdmin,
        verifyAdminToken
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
