/**
 * App.jsx - Main Application Component
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AskQuestionPage from './pages/AskQuestionPage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import MaterialsPage from './pages/MaterialsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Toast styles
const toastOptions = {
  duration: 3000,
  position: 'top-right',
  style: {
    background: '#333',
    color: '#fff',
  }
};

// Guest routes (only for logged out users)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Protected routes wrapper
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="register" element={
          <GuestRoute><RegisterPage /></GuestRoute>
        } />
        <Route path="materials" element={<MaterialsPage />} />
        
        {/* Protected routes */}
        <Route path="dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="ask-question" element={
          <ProtectedRoute allowedRoles={['student']}><AskQuestionPage /></ProtectedRoute>
        } />
        <Route path="questions" element={
          <ProtectedRoute><QuestionsPage /></ProtectedRoute>
        } />
        <Route path="questions/:id" element={
          <ProtectedRoute><QuestionDetailPage /></ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        
        {/* Role-specific dashboards */}
        <Route path="student/*" element={
          <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="tutor/*" element={
          <ProtectedRoute allowedRoles={['tutor']}><TutorDashboard /></ProtectedRoute>
        } />
        <Route path="admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster {...toastOptions} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
