/**
 * Layout Component
 * Main layout with navbar and footer
 */

import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const Layout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-mark">TT</span>
            <span>
              <strong>TechTutorIn</strong>
              <small>JEE & NEET doubt-solving platform</small>
            </span>
          </Link>

          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            {user?.role === "admin" && (
              <li>
                <Link to="/materials">Study Materials</Link>
              </li>
            )}

            {isAuthenticated ? (
              <>
                <li>
                  <span className="nav-badge">{user?.role}</span>
                </li>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="btn-link">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="btn-primary">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>
          &copy; 2026 TechTutorIn. Built for serious exam prep and better tutor
          workflows.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
