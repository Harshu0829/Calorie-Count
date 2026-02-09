import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaTrash, FaArrowLeft, FaChartPie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './FoodHistory.css';

const FoodHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dailyTotals, setDailyTotals] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/meals');

            // Filter unified entries to only show AI analyzed items
            // Also include legacy items if they exist
            const allEntries = response.data.combined || [];
            const aiEntries = allEntries.filter(item => item.entryType === 'ai' || item.confidence);

            setHistory(aiEntries);

            // Calculate totals for AI entries today (Local Time)
            const today = new Date().toISOString().split('T')[0];
            const todaysAI = aiEntries.filter(item => {
                const itemDate = new Date(item.date).toISOString().split('T')[0];
                return itemDate === today;
            });

            const totals = todaysAI.reduce((acc, curr) => ({
                calories: acc.calories + (curr.totalCalories || curr.calories || 0),
                protein: acc.protein + (curr.totalProtein || curr.protein || 0),
                carbs: acc.carbs + (curr.totalCarbs || curr.carbs || 0),
                fat: acc.fat + (curr.totalFat || curr.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            // Round values
            totals.calories = Math.round(totals.calories);
            totals.protein = Math.round(totals.protein * 10) / 10;
            totals.carbs = Math.round(totals.carbs * 10) / 10;
            totals.fat = Math.round(totals.fat * 10) / 10;

            setDailyTotals({
                totals,
                itemCount: todaysAI.length
            });

        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to load food history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            await api.delete(`/meals/${id}`);
            setHistory(history.filter(item => item._id !== id));
            // Refresh totals after delete
            fetchHistory();
        } catch (err) {
            console.error('Error deleting entry:', err);
            alert('Failed to delete entry');
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="food-history-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Fetching your nutritional journey...</p>
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
                    <div className="history-header-left">
                        <button onClick={() => navigate('/history')} className="btn-back">
                            <FaArrowLeft /> Back to Calendar
                        </button>
                        <h1>📊 Analysis History</h1>
                    </div>
                </div>

                {dailyTotals && dailyTotals.itemCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="daily-totals-card"
                    >
                        <div className="totals-header">
                            <h2>AI Analysis - Today</h2>
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
                                    <span className="total-value">{dailyTotals.totals.protein}g</span>
                                </div>
                            </div>

                            <div className="total-item carbs">
                                <div className="total-icon">🌾</div>
                                <div className="total-content">
                                    <span className="total-label">Carbs</span>
                                    <span className="total-value">{dailyTotals.totals.carbs}g</span>
                                </div>
                            </div>

                            <div className="total-item fat">
                                <div className="total-icon">🥑</div>
                                <div className="total-content">
                                    <span className="total-label">Fat</span>
                                    <span className="total-value">{dailyTotals.totals.fat}g</span>
                                </div>
                            </div>
                        </div>

                        <div className="items-count">
                            {dailyTotals.itemCount} AI analysis completed today
                        </div>
                    </motion.div>
                )}

                {error && <div className="error-message">{error}</div>}

                <div className="history-list">
                    <h2><FaChartPie /> All AI Entries</h2>

                    {history.length === 0 ? (
                        <div className="empty-state">
                            <p>No analyzed food entries yet. Start by taking a photo of your meal!</p>
                            <button
                                onClick={() => navigate('/upload-food')}
                                className="btn btn-primary"
                            >
                                Analyze Food Now
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
                                            <FaCalendarAlt /> {formatDate(item.date || item.createdAt)}
                                        </span>
                                        <span className="meta-item">
                                            <FaClock /> {formatTime(item.date || item.createdAt)}
                                        </span>
                                        {item.confidence && (
                                            <span className="confidence-tag">
                                                {Math.round(item.confidence * 100)}% Match
                                            </span>
                                        )}
                                    </div>

                                    <div className="card-nutrients">
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Calories</span>
                                            <span className="nutrient-value">{Math.round(item.totalCalories || item.calories)} kcal</span>
                                        </div>
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Protein</span>
                                            <span className="nutrient-value">{item.totalProtein || item.protein}g</span>
                                        </div>
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Carbs</span>
                                            <span className="nutrient-value">{item.totalCarbs || item.carbs}g</span>
                                        </div>
                                        <div className="nutrient-item">
                                            <span className="nutrient-label">Fat</span>
                                            <span className="nutrient-value">{item.totalFat || item.fat}g</span>
                                        </div>
                                    </div>

                                    {item.micronutrients && (
                                        <div className="card-micronutrients">
                                            <span>Vit A: {item.micronutrients.vitaminA || 0}</span>
                                            <span>Vit C: {item.micronutrients.vitaminC || 0}</span>
                                            <span>Ca: {item.micronutrients.calcium || 0}</span>
                                            <span>Fe: {item.micronutrients.iron || 0}</span>
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
