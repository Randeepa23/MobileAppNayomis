import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student } from '@/types';
import { apiService, AUTH_SESSION_INVALID_EVENT } from '@/services/api';

interface AuthContextType {
  user: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  syncLoyaltyPoints: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const clearStoredSession = () => {
  localStorage.removeItem('nayomis_user');
  localStorage.removeItem('nayomis_token');
};

const normalizeStudent = (student: Student): Student => ({
  _id: (student as Student & { id?: string }).id || student._id,
  name: student.name,
  email: student.email,
  role: student.role || 'user',
  points: student.points || (student as Student & { loyaltyPoints?: number }).loyaltyPoints || 0,
  orders: student.orders || [],
  isAdmin: student.role === 'admin',
  school: student.school,
  grade: student.grade,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // A cached user is not proof that its token is still valid. Restore the
  // session only after the backend verifies the token.
  useEffect(() => {
    const savedUser = localStorage.getItem('nayomis_user');
    const savedToken = localStorage.getItem('nayomis_token');

    let active = true;
    const clearSession = () => {
      clearStoredSession();
      if (active) setUser(null);
    };
    const handleInvalidSession = () => clearSession();
    window.addEventListener(AUTH_SESSION_INVALID_EVENT, handleInvalidSession);

    const restoreSession = async () => {
      if (!savedUser || !savedToken) {
        clearSession();
        if (active) setIsLoading(false);
        return;
      }

      try {
        JSON.parse(savedUser);
        const response = await apiService.getCurrentStudent();
        if (!response.success || !response.data?.student) throw new Error('Session validation failed');
        if (active) {
          const student = normalizeStudent(response.data.student);
          setUser(student);
          localStorage.setItem('nayomis_user', JSON.stringify(student));
        }
      } catch (error) {
        console.error('Unable to restore customer session:', error);
        clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
      window.removeEventListener(AUTH_SESSION_INVALID_EVENT, handleInvalidSession);
    };
  }, []);



  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Clear any existing user state before login
      setUser(null);
      clearStoredSession();
      
      const response = await apiService.login({ email, password });
      
      // Backend contract: check success field explicitly
      if (response.success === true && response.data?.student && response.data?.token) {
        const validatedStudent = normalizeStudent(response.data.student);
        
        // Store token and user data
        localStorage.setItem('nayomis_token', response.data.token);
        localStorage.setItem('nayomis_user', JSON.stringify(validatedStudent));
        // Small delay for smooth state transition
        await new Promise(resolve => setTimeout(resolve, 150));
        setUser(validatedStudent);
        return true;
      } else {
        // Backend returned success: false
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const payload = { name, email, password };
      const response = await apiService.register(payload);
      
      if (response.success === true) {
        // Registration successful but do NOT authenticate the user
        // Clear any existing authentication state
        setUser(null);
        clearStoredSession();
        return { success: true, message: 'Account created successfully. Please sign in.' };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Try to extract error message from response
      let errorMessage = 'Registration failed';
      if (error.message && error.message.includes('400')) {
        errorMessage = 'Email already exists';
      }
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearStoredSession();
  };

  const syncLoyaltyPoints = async () => {
    if (!user?._id) return;
    
    try {
      const response = await apiService.getStudentProfile(user._id);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('nayomis_user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to sync loyalty points:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    syncLoyaltyPoints,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
