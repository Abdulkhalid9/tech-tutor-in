/* eslint-disable react-refresh/only-export-components */
/**
 * Auth Context
 * Manages authentication state across the app
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.data);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Register
  const register = async (userData) => {
    const response = await authApi.register(userData);
    const { token, data } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Login
  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { token, data } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Check role
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
