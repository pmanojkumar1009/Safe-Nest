import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authAPI, adminAPI } from '../services/api';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for saved user and token on app start
    const savedUser = localStorage.getItem('safenest_user');
    const savedToken = localStorage.getItem('safenest_token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('safenest_user');
        localStorage.removeItem('safenest_token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Login attempt with:', email);
      
      // Ensure we're sending the correct data format
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data;
      
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Save user data and token
      localStorage.setItem('safenest_user', JSON.stringify(userData));
      localStorage.setItem('safenest_token', token);
      
      setUser(userData);
      
      console.log('✅ Login successful:', userData.name, userData.role, userData.department);
      
      // No redirect here - let the component handle it
      
      return userData; // Return user data for additional handling if needed
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token } = response.data;
      
      // Save user data and token
      localStorage.setItem('safenest_user', JSON.stringify(newUser));
      localStorage.setItem('safenest_token', token);
      
      setUser(newUser);
      
      console.log('✅ Registration successful:', newUser.name, newUser.role);
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      // Simulate API call for profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('safenest_user', JSON.stringify(updatedUser));
        console.log('✅ Profile updated successfully');
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safenest_user');
    localStorage.removeItem('safenest_token');
    console.log('✅ Logout successful');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};