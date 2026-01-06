import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.detail || error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.detail || error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await api.post('/auth/google', googleData);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser,
    requestPasswordReset,
    resetPassword,
    googleLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
