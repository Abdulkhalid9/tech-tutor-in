/**
 * Layout Component
 * Main layout with navbar and footer
 */

import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">

          {/* Logo — clicking goes to dashboard if logged in, home if not */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="logo">
            <span className="logo-mark">TT</span>
            <span>
              <strong>TechTutorIn</strong>
              <small>JEE & NEET doubt-solving platform</small>
            </span>
          </Link>

          <ul className="nav-links">

            {/* Guest navbar — not logged in */}
            {!isAuthenticated && (
              <>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register" className="btn-primary">Register</Link></li>
              </>
            )}

            {/* Student navbar */}
            {isAuthenticated && user?.role === 'student' && (
              <>
                <li><span className="nav-badge">Student</span></li>
                <li><Link to="/student">Dashboard</Link></li>
                <li><Link to="/ask-question">Ask Question</Link></li>
                <li><Link to="/questions">Browse Library</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><button onClick={handleLogout} className="btn-link">Logout</button></li>
              </>
            )}

            {/* Tutor navbar */}
            {isAuthenticated && user?.role === 'tutor' && (
              <>
                <li><span className="nav-badge">Tutor</span></li>
                <li><Link to="/tutor">Dashboard</Link></li>
                <li><Link to="/questions">Questions</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><button onClick={handleLogout} className="btn-link">Logout</button></li>
              </>
            )}

            {/* Admin navbar */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <li><span className="nav-badge">Admin</span></li>
                <li><Link to="/admin">Dashboard</Link></li>
                <li><Link to="/materials">Study Materials</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><button onClick={handleLogout} className="btn-link">Logout</button></li>
              </>
            )}

          </ul>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2026 TechTutorIn. Built for serious exam prep and better tutor workflows.</p>
      </footer>
    </div>
  );
};

export default Layout;