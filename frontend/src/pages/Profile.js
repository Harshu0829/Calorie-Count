import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaCog, FaSignOutAlt, FaEdit, FaSave, FaTimes, FaHistory } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import './Profile.css';

const Profile = () => {
  const { user, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 50,
    dailyCarbsGoal: 250,
    dailyFatGoal: 65,
    weightHistory: [],
    heightHistory: [],
    goalHistory: []
  });

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
    { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
    { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' },
    { value: 'extremely_active', label: 'Extremely Active (very hard exercise, physical job)' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        activityLevel: user.activityLevel || 'sedentary',
        dailyCalorieGoal: user.dailyCalorieGoal || 2000,
        dailyProteinGoal: user.dailyProteinGoal || 50,
        dailyCarbsGoal: user.dailyCarbsGoal || 250,
        dailyFatGoal: user.dailyFatGoal || 65,
        weightHistory: user.weightHistory || [],
        heightHistory: user.heightHistory || [],
        goalHistory: user.goalHistory || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Goal') || name === 'age' || name === 'height' || name === 'weight'
        ? Number(value)
        : value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/users/me', formData);
      await fetchUser();
      alert('Profile updated successfully! 🎉');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const calculateBMR = () => {
    if (!formData.weight || !formData.height || !formData.age) return null;

    const weight = formData.weight;
    const height = formData.height / 100; // Convert cm to m
    const age = formData.age;

    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height * 100) - (5 * age);

    return Math.round(bmr);
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr) return null;

    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    return Math.round(bmr * (activityMultipliers[formData.activityLevel] || 1.2));
  };

  const suggestedCalorieGoal = calculateTDEE() || formData.dailyCalorieGoal;

  if (!user) {
    return (
      <div className="profile">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="container">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-header"
        >
          <h1>
            <FaUser /> Profile & Settings
          </h1>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-card card"
        >
          <div className="profile-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <FaUser />
              </div>
            )}
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                    max="120"
                    placeholder="Enter your age"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="form-input"
                    min="50"
                    max="250"
                    placeholder="Enter height in cm"
                  />
                </div>

                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                    max="300"
                    step="0.1"
                    placeholder="Enter weight in kg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="form-input"
                >
                  {activityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {suggestedCalorieGoal && (
                  <p className="form-hint">
                    Suggested daily calorie goal: {suggestedCalorieGoal} kcal
                  </p>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Daily Goals</h3>
              <div className="goals-grid">
                <div className="form-group">
                  <label>Calorie Goal (kcal)</label>
                  <input
                    type="number"
                    name="dailyCalorieGoal"
                    value={formData.dailyCalorieGoal}
                    onChange={handleChange}
                    className="form-input"
                    min="1000"
                    max="5000"
                    step="50"
                    placeholder="Enter calorie goal"
                  />
                </div>

                <div className="form-group">
                  <label>Protein Goal (g)</label>
                  <input
                    type="number"
                    name="dailyProteinGoal"
                    value={formData.dailyProteinGoal}
                    onChange={handleChange}
                    className="form-input"
                    min="20"
                    max="300"
                    placeholder="Enter protein goal"
                  />
                </div>

                <div className="form-group">
                  <label>Carbs Goal (g)</label>
                  <input
                    type="number"
                    name="dailyCarbsGoal"
                    value={formData.dailyCarbsGoal}
                    onChange={handleChange}
                    className="form-input"
                    min="50"
                    max="500"
                    placeholder="Enter carbs goal"
                  />
                </div>

                <div className="form-group">
                  <label>Fat Goal (g)</label>
                  <input
                    type="number"
                    name="dailyFatGoal"
                    value={formData.dailyFatGoal}
                    onChange={handleChange}
                    className="form-input"
                    min="20"
                    max="200"
                    placeholder="Enter fat goal"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="profile-history card"
        >
          <h3>
            <FaHistory /> History Logs
          </h3>

          <div className="history-section">
            <h4>Weight History</h4>
            {formData.weightHistory && formData.weightHistory.length > 0 ? (
              <ul className="history-list">
                {formData.weightHistory.slice().reverse().map((entry, index) => (
                  <li key={index} className="history-item">
                    <span className="history-date">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="history-value">{entry.weight} kg</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-history">No weight history available</p>
            )}
          </div>

          <div className="history-section">
            <h4>Height History</h4>
            {formData.heightHistory && formData.heightHistory.length > 0 ? (
              <ul className="history-list">
                {formData.heightHistory.slice().reverse().map((entry, index) => (
                  <li key={index} className="history-item">
                    <span className="history-date">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="history-value">{entry.height} cm</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-history">No height history available</p>
            )}
          </div>

          <div className="history-section">
            <h4>Goal History</h4>
            {formData.goalHistory && formData.goalHistory.length > 0 ? (
              <ul className="history-list">
                {formData.goalHistory.slice().reverse().map((entry, index) => (
                  <li key={index} className="history-item">
                    <span className="history-date">{new Date(entry.date).toLocaleDateString()}</span>
                    <div className="history-goals">
                      <span>{entry.dailyCalorieGoal} kcal</span>
                      <span>P: {entry.dailyProteinGoal}g</span>
                      <span>C: {entry.dailyCarbsGoal}g</span>
                      <span>F: {entry.dailyFatGoal}g</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-history">No goal history available</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="profile-actions card"
        >
          <h3>
            <FaCog /> Account Settings
          </h3>
          <button
            onClick={handleLogout}
            className="btn btn-danger logout-btn"
          >
            <FaSignOutAlt /> Logout
          </button>
        </motion.div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;
