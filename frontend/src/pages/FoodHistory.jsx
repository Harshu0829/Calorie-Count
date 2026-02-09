import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrash, FaCalendarAlt, FaClock, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';
import './FoodHistory.css';

const FoodHistory = () => {
    const [history, setHistory] = useState([]);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
        fetchDailyTotals();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/food/history?limit=50');
            setHistory(response.data.data);
        } catch (err) {
            setError('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyTotals = async () => {
        try {
            const response = await api.get('/food/daily-totals');
            setDailyTotals(response.data);
        } catch (err) {
            console.error('Failed to load daily totals:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            await api.delete(`/food/${id}`);
            setHistory(history.filter(item => item._id !== id));
            fetchDailyTotals(); // Refresh totals
        } catch (err) {
            alert('Failed to delete entry');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="food-history-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="food-history-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="history-container"
            >
                <div className="history-header">
                    <button onClick={() => navigate('/upload-food')} className="btn-back">
                        <FaArrowLeft /> Back to Upload
                    </button>
                    <h1>📊 Food Analysis History</h1>
                </div>

                {dailyTotals && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="daily-totals-card"
                    >
                        <div className="totals-header">
                            <h2>Today's Totals</h2>
                            <span className="date-badge">
                                <FaCalendarAlt /> {formatDate(new Date())}
                            </span>
                        </div>

                        <div className="totals-grid">
                            <div className="total-item calories">
                                <div className="total-icon">🔥</div>
                                <div className="total-content">
                                    <span className="total-label">Calories</span>
                                    <span className="total-value">{dailyTotals.totals.calories}</span>
                                    <span className="total-unit">kcal</span>
                                </div>
                            </div>

                            <div className="total-item protein">
                                <div className="total-icon">💪</div>
                                <div className="total-content">
                                    <span className="total-label">Protein</span>
                                    <span className="total-value">{dailyTotals.totals.protein}</span>
                                    <span className="total-unit">g</span>
                                </div>
                            </div>

                            <div className="total-item carbs">
                                <div className="total-icon">🌾</div>
                                <div className="total-content">
                                    <span className="total-label">Carbs</span>
                                    <span className="total-value">{dailyTotals.totals.carbs}</span>
                                    <span className="total-unit">g</span>
                                </div>
                            </div>

                            <div className="total-item fat">
                                <div className="total-icon">🥑</div>
                                <div className="total-content">
                                    <span className="total-label">Fat</span>
                                    <span className="total-value">{dailyTotals.totals.fat}</span>
                                    <span className="total-unit">g</span>
                                </div>
                            </div>
                        </div>

                        <div className="items-count">
                            {dailyTotals.itemCount} item{dailyTotals.itemCount !== 1 ? 's' : ''} analyzed today
                        </div>
                    </motion.div>
                )}

                {error && <div className="error-message">{error}</div>}

                <div className="history-list">
                    <h2>All Entries</h2>

                    {history.length === 0 ? (
                        <div className="empty-state">
                            <p>No food entries yet. Start by analyzing your first meal!</p>
                            <button
                                onClick={() => navigate('/upload-food')}
                                className="btn btn-primary"
                            >
                                Upload Food Image
                            </button>
                        </div>
                    ) : (
                        <div className="history-grid">
                            {history.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="history-card"
                                >
                                    <div className="card-header">
                                        <h3>{item.foodName}</h3>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="btn-delete"
                                            title="Delete entry"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="card-meta">
                                        <span className="meta-item">
                                            <FaCalendarAlt /> {formatDate(item.createdAt)}
                                        </span>
                                        <span className="meta-item">
                                            <FaClock /> {formatTime(item.createdAt)}
                                        </span>
                                        <span className="confidence-tag">
                                            {Math.round(item.confidence * 100)}% confident
                                        </span>
                                    </div>

                                    <div className="card-nutrients">
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Calories</span>
                                            <span className="nutrient-value">{item.calories} kcal</span>
                                        </div>
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Protein</span>
                                            <span className="nutrient-value">{item.protein}g</span>
                                        </div>
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Carbs</span>
                                            <span className="nutrient-value">{item.carbs}g</span>
                                        </div>
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Fat</span>
                                            <span className="nutrient-value">{item.fat}g</span>
                                        </div>
                                    </div>

                                    {item.micronutrients && (
                                        <div className="card-micronutrients">
                                            <span>Vit A: {item.micronutrients.vitaminA}</span>
                                            <span>Vit C: {item.micronutrients.vitaminC}</span>
                                            <span>Ca: {item.micronutrients.calcium}</span>
                                            <span>Fe: {item.micronutrients.iron}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default FoodHistory;
