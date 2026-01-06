import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCamera, FaUpload, FaChartLine, FaRunning } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Home.css';
import fitnessHero from '../assets/fitness_hero.png';

const Home = () => {
  const { user } = useAuth();

  // Guest View
  if (!user) {
    return (
      <div className="home guest-home">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hero-section"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${fitnessHero})` }}
        >
          <div className="hero-content">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hero-text"
            >
              <h1 className="hero-title">
                Fuel Your Ambition,<br />
                <span className="gradient-text">Track Your Progress</span>
              </h1>
              <p className="hero-subtitle">
                The ultimate AI-powered nutrition companion for your fitness journey.
              </p>
              <div className="hero-cta">
                <Link to="/login" className="btn btn-primary btn-large explore-btn">
                  Explore Now
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="features-section">
          <h2 className="section-title">Why Choose Calorie Tracker?</h2>
          <div className="features-grid">
            <motion.div
              whileHover={{ y: -10 }}
              className="feature-card"
            >
              <div className="feature-icon"><FaCamera /></div>
              <h3>AI Food Recognition</h3>
              <p>Snap a photo of your meal and let our AI instantly calculate calories and macros.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="feature-card"
            >
              <div className="feature-icon"><FaChartLine /></div>
              <h3>Detailed Analytics</h3>
              <p>Track your daily intake, monitor trends, and stay on top of your nutrition goals.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="feature-card"
            >
              <div className="feature-icon"><FaRunning /></div>
              <h3>Fitness Integration</h3>
              <p>Seamlessly connect your nutrition data with your workout routines.</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated User View - Coming Soon
  return (
    <div className="home user-home">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="user-home-section"
      >
        <div className="coming-soon-container">
          <div className="coming-soon-glow"></div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="coming-soon-icon"
          >
            <FaRunning />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="coming-soon-title"
          >
            Evolution <br />
            <span className="gradient-text">In Progress</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="coming-soon-subtitle"
          >
            The next generation of AI-driven nutrition tracking is almost here.
            We're building the future of fitness, one byte at a time.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12"
          >
            <Link to="/dashboard" className="btn btn-futuristic">
              Enter Dashboard
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
