import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Results.css';

const Results = ({ results, onSaveMeal, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      onSaveMeal();
    }
  };

  return (
    <div className="results card">
      <h2>📊 Analysis Results</h2>

      <div className="detected-foods">
        <h3>Detected Foods</h3>
        <div className="foods-list">
          {results.detected_foods.map((food, index) => (
            <div key={index} className="food-item">
              <div className="food-info">
                <div className="food-name">
                  {food.food.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="food-details">
                  <span>Weight: {food.weight_grams}g</span>
                  <span>Protein: {food.protein}g</span>
                  <span>Carbs: {food.carbs}g</span>
                  <span>Fat: {food.fat}g</span>
                  <span>Confidence: {Math.round(food.confidence * 100)}%</span>
                </div>
                {food.micronutrients && (
                  <div className="food-micros">
                    <small>Vit A: {food.micronutrients.vitaminA}IU • Vit C: {food.micronutrients.vitaminC}mg • Ca: {food.micronutrients.calcium}mg • Fe: {food.micronutrients.iron}mg</small>
                  </div>
                )}
              </div>
              <div className="food-calories">{food.calories} kcal</div>
            </div>
          ))}
        </div>
      </div>

      <div className="nutrition-summary">
        <h3>Nutrition Summary</h3>
        <div className="summary-grid">
          <div className="summary-card calories">
            <div className="summary-label">Calories</div>
            <div className="summary-value">{results.totals.calories.toFixed(1)}</div>
            <div className="summary-unit">kcal</div>
          </div>
          <div className="summary-card protein">
            <div className="summary-label">Protein</div>
            <div className="summary-value">{results.totals.protein.toFixed(1)}</div>
            <div className="summary-unit">g</div>
          </div>
          <div className="summary-card carbs">
            <div className="summary-label">Carbs</div>
            <div className="summary-value">{results.totals.carbs.toFixed(1)}</div>
            <div className="summary-unit">g</div>
          </div>
          <div className="summary-card fat">
            <div className="summary-label">Fat</div>
            <div className="summary-value">{results.totals.fat.toFixed(1)}</div>
            <div className="summary-unit">g</div>
          </div>
        </div>

        {results.totals.micronutrients && (
          <div className="micros-summary">
            <h4>Micronutrients</h4>
            <div className="micros-grid">
              <div className="micro-item">
                <span className="micro-label">Vitamin A</span>
                <span className="micro-value">{results.totals.micronutrients.vitaminA} IU</span>
              </div>
              <div className="micro-item">
                <span className="micro-label">Vitamin C</span>
                <span className="micro-value">{results.totals.micronutrients.vitaminC} mg</span>
              </div>
              <div className="micro-item">
                <span className="micro-label">Calcium</span>
                <span className="micro-value">{results.totals.micronutrients.calcium} mg</span>
              </div>
              <div className="micro-item">
                <span className="micro-label">Iron</span>
                <span className="micro-value">{results.totals.micronutrients.iron} mg</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <button onClick={handleSaveClick} className="btn btn-primary save-meal-btn">
          💾 Save as Meal
        </button>
      )}
    </div>
  );
};

export default Results;

