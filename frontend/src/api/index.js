/**
 * API Exports
 * Centralized API functions
 */

import api from './axios';
import authApi from './authApi';
import questionApi from './questionApi';

// Answer API
export const answerApi = {
  submit: (data) => api.post('/answers', data),
  getByQuestion: (questionId) => api.get(`/answers/question/${questionId}`),
  getMyAnswers: () => api.get('/answers/my-answers'),
  getOne: (id) => api.get(`/answers/${id}`),
  accept: (id) => api.put(`/answers/${id}/accept`),
  reject: (id, reason) => api.put(`/answers/${id}/reject`, { reason })
};

// Payment API
export const paymentApi = {
  getKey: () => api.get('/payments/key'),
  createOrder: (questionId) => api.post('/payments/create-order', { questionId }),
  verify: (data) => api.post('/payments/verify', data),
  getMyPayments: () => api.get('/payments/my'),
  getOne: (id) => api.get(`/payments/${id}`)
};

// Upload API
export const uploadApi = {
  upload: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (publicId) => api.delete(`/upload/${publicId}`)
};

// Material API
export const materialApi = {
  getAll: (params) => api.get('/materials', { params }),
  getOne: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
};

// User API
export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getQuestions: (params) => api.get('/admin/questions', { params }),
  getAnswers: (params) => api.get('/admin/answers', { params }),
  getPayments: () => api.get('/admin/payments'),
  approveTutor: (id, status) => api.put(`/admin/tutors/${id}/approve`, { status }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// QA Library API
export const qaApi = {
  getAll: (params) => api.get('/qa', { params }),
  mockUnlock: (questionId) => api.post(`/qa/mock-unlock/${questionId}`),
};

export { api, authApi, questionApi };
