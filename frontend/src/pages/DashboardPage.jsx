/**
 * Dashboard Page - Redirects to role-specific dashboard
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  // Redirect to appropriate dashboard based on role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'tutor':
      return <Navigate to="/tutor" replace />;
    case 'student':
    default:
      return <Navigate to="/student" replace />;
  }
};

export default DashboardPage;
