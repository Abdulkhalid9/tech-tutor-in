/**
 * Auth API Functions
 */

import api from './axios';

export const authApi = {
  // Register
  register: (data) => api.post('/auth/register', data),
  
  // Login
  login: (data) => api.post('/auth/login', data),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  
  // Reset password
  resetPassword: (token, password) => api.post(`/auth/resetpassword/${token}`, { password }),
  
  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify/${token}`)
};

export default authApi;
