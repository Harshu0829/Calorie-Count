import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCamera, FaHistory, FaUser } from 'react-icons/fa';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: 'Home' },
    { path: '/', icon: FaCamera, label: 'Track' },
    { path: '/history', icon: FaHistory, label: 'History' },
    { path: '/profile', icon: FaUser, label: 'Profile' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || 
                        (item.path === '/dashboard' && location.pathname === '/dashboard');
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;

