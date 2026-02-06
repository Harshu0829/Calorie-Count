import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            console.log('Sending forgot password request for:', email);
            const response = await api.post('/auth/forgot-password', { email });
            console.log('Response received:', response.data);
            setMessage(response.data.message);
            setEmail('');
        } catch (err) {
            console.log('Error received:', err.response || err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auth-card"
                >
                    <div className="auth-header">
                        <h1>🔐 Forgot Password</h1>
                        <p>Enter your email address and we'll send you a password reset link</p>
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="alert alert-success"
                        >
                            ✅ {message}
                        </motion.div>
                    )}

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
                            <label htmlFor="email">
                                <FaEnvelope /> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/login" className="auth-link">
                            <FaArrowLeft /> Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
