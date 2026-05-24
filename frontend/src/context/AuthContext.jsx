import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user profile if token exists
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setUser({
          ...res.data.user,
          donorProfile: res.data.donorProfile || null
        });
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (formData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser(prev => ({
          ...prev,
          ...res.data.user,
        }));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Update failed' };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed.';
      return { success: false, message: errMsg };
    }
  };

  // Change password handler
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Password update failed.';
      return { success: false, message: errMsg };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refetchProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
