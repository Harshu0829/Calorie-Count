import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            console.log('Resetting password for token:', token);
            await api.post(`/auth/reset-password/${token}`, {
                password: formData.password
            });
            console.log('Password reset successful');

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.log('Reset password error:', err.response || err);
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="auth-card"
                    >
                        <div className="success-message">
                            <FaCheckCircle className="success-icon" />
                            <h1>Password Reset Successful!</h1>
                            <p>Your password has been successfully reset.</p>
                            <p>Redirecting to login page...</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auth-card"
                >
                    <div className="auth-header">
                        <h1>🔑 Reset Password</h1>
                        <p>Enter your new password below</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="alert alert-error"
                        >
                            ❌ {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="password">
                                <FaLock /> New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter new password (min 6 characters)"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                <FaLock /> Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/login" className="auth-link">
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
