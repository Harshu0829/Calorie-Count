import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCamera, FaUpload, FaChartLine, FaRunning } from 'react-icons/fa';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import Results from '../components/Results';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';
import fitnessHero from '../assets/fitness_hero.png';

const Home = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weight, setWeight] = useState('');
  const [tempImage, setTempImage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnalyze = (imageFile) => {
    setTempImage(imageFile);
  };

  const submitAnalysis = async () => {
    if (!tempImage || !weight) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', tempImage);
      formData.append('weight', weight);

      const response = await api.post('/analyze/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
      setActiveTab('results');
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!results) return;

    try {
      const mealData = {
        mealType: 'snack',
        foods: results.detected_foods.map(food => ({
          foodName: food.food,
          quantity: food.weight_grams,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          confidence: food.confidence,
          micronutrients: food.micronutrients
        }))
      };

      await api.post('/meals', mealData);
      alert('Meal saved successfully! 🎉');
      setResults(null);
      setActiveTab('hero');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving meal');
    }
  };

  const motivationalQuotes = [
    "Every meal is a step toward your goal! 💪",
    "You're stronger than your cravings! 🔥",
    "Small steps lead to big results! ⭐",
    "Your future self will thank you! 🌟"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

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

  // Authenticated User View
  return (
    <div className="home user-home">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="user-home-section"
      >
        <div className="welcome-message">
          <h2>Track Your Meal</h2>
          <p className="motivational-quote" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{randomQuote}</p>
        </div>

        {!results && (
          <>
            <div className="upload-camera-container">
              <div className="button-row">
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setTempImage(null);
                    setResults(null);
                  }}
                  className={`upload-camera-btn ${activeTab === 'upload' ? 'active' : ''}`}
                >
                  <FaUpload className="btn-icon" />
                  Upload Image
                </button>
                <button
                  onClick={() => {
                    setActiveTab('camera');
                    setTempImage(null);
                    setResults(null);
                  }}
                  className={`upload-camera-btn ${activeTab === 'camera' ? 'active' : ''}`}
                >
                  <FaCamera className="btn-icon" />
                  Start Camera
                </button>
              </div>

              <div className="upload-camera-area">
                {!tempImage && (
                  <>
                    {activeTab === 'camera' && (
                      <CameraCapture onAnalyze={handleAnalyze} loading={loading} />
                    )}

                    {activeTab === 'upload' && (
                      <ImageUpload onAnalyze={handleAnalyze} loading={loading} />
                    )}

                    {activeTab === 'hero' && (
                      <div className="empty-state">
                        <FaCamera className="empty-icon" />
                        <p>Click "Start Camera" or upload an image to begin</p>
                      </div>
                    )}
                  </>
                )}

                {tempImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="preview-area"
                  >
                    <img
                      src={URL.createObjectURL(tempImage)}
                      alt="Food preview"
                      className="preview-image"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {tempImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="weight-analysis-section"
              >
                <div className="weight-input-section">
                  <label>Total Weight (grams)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 500"
                      autoFocus
                    />
                    <span>g</span>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="analysis-actions">
                  <button
                    onClick={() => {
                      setTempImage(null);
                      setWeight('');
                    }}
                    className="btn btn-secondary"
                  >
                    Retake / Cancel
                  </button>
                  <button
                    onClick={submitAnalysis}
                    className="btn btn-primary"
                    disabled={!weight || loading}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Meal'}
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="results-section"
          >
            <div className="results-header">
              <h2>Analyzed! ✨</h2>
              <p className="results-quote">"{randomQuote}"</p>
            </div>
            <Results results={results} onSaveMeal={handleSaveMeal} isAuthenticated={!!user} />
            <button
              onClick={() => {
                setResults(null);
                setTempImage(null);
                setWeight('');
                setActiveTab('hero');
              }}
              className="btn btn-secondary mt-4"
            >
              Analyze Another Meal
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
