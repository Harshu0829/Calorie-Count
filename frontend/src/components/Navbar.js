import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

import logo from '../assets/Untitled.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <img src={logo} alt="Calorie Tracker" className="navbar-logo-img" />
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <span className="navbar-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

