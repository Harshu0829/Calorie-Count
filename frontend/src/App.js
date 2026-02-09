import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// ... (imports)
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import FoodUpload from './pages/FoodUpload';
import FoodHistory from './pages/FoodHistory';
import OnboardingWizard from './pages/OnboardingWizard';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Force onboarding if not completed
  if (!user.hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  // Prevent accessing onboarding if already completed
  if (user.hasCompletedOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

// Keep-alive component to wake up backend
function KeepAlive() {
  React.useEffect(() => {
    // Simple fetch to wake up the server sans-credentials
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/health`)
      .catch(err => console.log('Keep-alive ping failed', err));
  }, []);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <KeepAlive />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-food"
              element={
                <ProtectedRoute>
                  <FoodUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-history"
              element={
                <ProtectedRoute>
                  <FoodHistory />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
