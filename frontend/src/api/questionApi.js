/**
 * Question API Functions
 */

import api from './axios';

export const questionApi = {
  // Create question
  create: (data) => api.post('/questions', data),
  
  // Get all questions (for tutors - pending)
  getAll: (params) => api.get('/questions', { params }),
  
  // Get pending questions (for tutors)
  getPending: () => api.get('/questions/pending'),
  
  // Get my questions (for students)
  getMyQuestions: () => api.get('/questions/my'),
  
  // Get my assigned questions (for tutors)
  getMyAssigned: () => api.get('/questions/my-assigned'),
  
  // Get single question
  getOne: (id) => api.get(`/questions/${id}`),
  
  // Update question
  update: (id, data) => api.put(`/questions/${id}`, data),
  
  // Delete question
  delete: (id) => api.delete(`/questions/${id}`),
  
  // Accept question (tutor)
  accept: (id) => api.put(`/questions/${id}/accept`)
};

export default questionApi;
