import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUpload, FaCamera, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../services/api';
import './FoodUpload.css';

const FoodUpload = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await api.post('/food/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setResults(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetUpload = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResults(null);
        setError('');
    };

    return (
        <div className="food-upload-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="upload-container"
            >
                <h1 className="page-title">🍽️ AI Food Analysis</h1>
                <p className="page-subtitle">Upload a photo and let AI analyze the nutrition</p>

                {!results && (
                    <>
                        <div
                            className="upload-area"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            {!previewUrl ? (
                                <div className="upload-prompt">
                                    <FaUpload className="upload-icon" />
                                    <h3>Drag & Drop your food image</h3>
                                    <p>or</p>
                                    <label className="btn btn-primary">
                                        <FaCamera /> Choose Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="image-preview">
                                    <img src={previewUrl} alt="Food preview" />
                                    <button onClick={resetUpload} className="btn-remove">
                                        <FaTimesCircle /> Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="error-message"
                            >
                                {error}
                            </motion.div>
                        )}

                        {previewUrl && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="btn btn-analyze"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
                                        Analyzing with AI...
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle /> Analyze Food
                                    </>
                                )}
                            </motion.button>
                        )}
                    </>
                )}

                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="results-container"
                    >
                        <div className="results-header">
                            <FaCheckCircle className="success-icon" />
                            <h2>Analysis Complete!</h2>
                            <p className="food-name">{results.foodName}</p>
                            <span className="confidence-badge">
                                {Math.round(results.confidence * 100)}% Confidence
                            </span>
                        </div>

                        <div className="nutrition-grid">
                            <div className="nutrition-card calories">
                                <div className="card-icon">🔥</div>
                                <div className="card-content">
                                    <span className="label">Calories</span>
                                    <span className="value">{results.calories}</span>
                                    <span className="unit">kcal</span>
                                </div>
                            </div>

                            <div className="nutrition-card protein">
                                <div className="card-icon">💪</div>
                                <div className="card-content">
                                    <span className="label">Protein</span>
                                    <span className="value">{results.protein}</span>
                                    <span className="unit">g</span>
                                </div>
                            </div>

                            <div className="nutrition-card carbs">
                                <div className="card-icon">🌾</div>
                                <div className="card-content">
                                    <span className="label">Carbs</span>
                                    <span className="value">{results.carbs}</span>
                                    <span className="unit">g</span>
                                </div>
                            </div>

                            <div className="nutrition-card fat">
                                <div className="card-icon">🥑</div>
                                <div className="card-content">
                                    <span className="label">Fat</span>
                                    <span className="value">{results.fat}</span>
                                    <span className="unit">g</span>
                                </div>
                            </div>
                        </div>

                        {results.micronutrients && (
                            <div className="micronutrients-section">
                                <h3>Micronutrients</h3>
                                <div className="micro-grid">
                                    <div className="micro-item">
                                        <span className="micro-label">Vitamin A</span>
                                        <span className="micro-value">{results.micronutrients.vitaminA} mcg</span>
                                    </div>
                                    <div className="micro-item">
                                        <span className="micro-label">Vitamin C</span>
                                        <span className="micro-value">{results.micronutrients.vitaminC} mg</span>
                                    </div>
                                    <div className="micro-item">
                                        <span className="micro-label">Calcium</span>
                                        <span className="micro-value">{results.micronutrients.calcium} mg</span>
                                    </div>
                                    <div className="micro-item">
                                        <span className="micro-label">Iron</span>
                                        <span className="micro-value">{results.micronutrients.iron} mg</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="action-buttons">
                            <button onClick={resetUpload} className="btn btn-secondary">
                                Analyze Another
                            </button>
                            <button
                                onClick={() => navigate('/food-history')}
                                className="btn btn-primary"
                            >
                                View History
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default FoodUpload;
