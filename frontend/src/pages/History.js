import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaFileExport, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import './History.css';

const History = () => {
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dailyCalories, setDailyCalories] = useState({});
  const { user } = useAuth();

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();



  const formatManualMeal = (meal) => ({
    ...meal,
    isManual: true,
    totalCalories: meal.calories || 0,
    totalProtein: meal.protein || 0,
    totalCarbs: meal.carbs || 0,
    totalFat: meal.fat || 0,
    foods: [{
      foodName: meal.description,
      quantity: meal.portion,
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0
    }]
  });

  const fetchMonthlyMeals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/meals');
      const allMeals = res.data.combined || [];

      // Group meals by date
      const caloriesByDate = {};
      allMeals.forEach(meal => {
        const date = new Date(meal.date).toISOString().split('T')[0];
        if (!caloriesByDate[date]) {
          caloriesByDate[date] = 0;
        }
        caloriesByDate[date] += (meal.totalCalories || meal.calories || 0);
      });

      setDailyCalories(caloriesByDate);
      setMeals(allMeals);
    } catch (error) {
      console.error('Error fetching monthly meals:', error);
      setDailyCalories({});
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthlyMeals();
  }, [fetchMonthlyMeals]);

  const getDateMeals = (day) => {
    const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return meals.filter(meal => {
      const mealDate = new Date(meal.date).toISOString().split('T')[0];
      return mealDate === date;
    });
  };

  const getCalorieStatus = (day) => {
    const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    const calories = dailyCalories[date] || 0;
    const goal = user?.dailyCalorieGoal || 2000;

    if (calories === 0) return 'none';
    if (calories < goal * 0.7) return 'low';
    if (calories < goal) return 'good';
    if (calories <= goal * 1.2) return 'perfect';
    return 'over';
  };

  const prevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [selectedDay, setSelectedDay] = useState(null);

  const selectedDayMeals = selectedDay ? getDateMeals(selectedDay) : [];

  const exportData = () => {
    const csvContent = [
      ['Date', 'Meal Type', 'Food', 'Quantity (g)', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
      ...meals.flatMap(meal => {
        if (meal.foods && meal.foods.length > 0) {
          return meal.foods.map(food => [
            new Date(meal.date).toLocaleDateString(),
            meal.mealType,
            food.foodName,
            food.quantity,
            food.calories,
            food.protein,
            food.carbs,
            food.fat
          ]);
        } else {
          return [[
            new Date(meal.date).toLocaleDateString(),
            meal.mealType,
            meal.foodName,
            meal.portion,
            meal.calories,
            meal.protein,
            meal.carbs,
            meal.fat
          ]];
        }
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calorie-tracker-${monthNames[currentMonth]}-${currentYear}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="history">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading history...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="history">
      <div className="container">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="history-header"
        >
          <h1>
            <FaCalendarAlt /> Meal History
          </h1>
          <button onClick={exportData} className="btn btn-secondary export-btn">
            <FaFileExport /> Export CSV
          </button>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="calendar-container card"
        >
          <div className="calendar-header">
            <button onClick={prevMonth} className="calendar-nav-btn">
              <FaChevronLeft />
            </button>
            <h2>
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="calendar-nav-btn">
              <FaChevronRight />
            </button>
          </div>

          <div className="calendar-grid-wrapper">
            <div className="calendar-grid">
              {weekDays.map(day => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="calendar-day empty" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const status = getCalorieStatus(day);
                const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
                const calories = dailyCalories[date] || 0;
                const isSelected = selectedDay === day;

                return (
                  <motion.div
                    key={day}
                    className={`calendar-day ${status} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDay(day)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="day-number">{day}</div>
                    {calories > 0 && (
                      <div className="day-calories">{Math.round(calories)}</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color none"></div>
              <span>No data</span>
            </div>
            <div className="legend-item">
              <div className="legend-color low"></div>
              <span>Under 70%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color good"></div>
              <span>70-100%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color perfect"></div>
              <span>100-120%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color over"></div>
              <span>Over 120%</span>
            </div>
          </div>
        </motion.div>

        {selectedDay && selectedDayMeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="selected-day-meals card"
          >
            <h2>
              {monthNames[currentMonth]} {selectedDay}, {currentYear}
            </h2>
            <div className="meals-list">
              {selectedDayMeals.map(meal => (
                <div key={meal._id} className="meal-item">
                  <div className="meal-header">
                    <div className="meal-header-title">
                      <h3>{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</h3>
                      {meal.entryType === 'manual' && <span className="manual-tag small">Manual Entry</span>}
                      {meal.entryType === 'ai' && <span className="ai-tag small">AI Analysis</span>}
                    </div>
                    <span className="meal-time">
                      {new Date(meal.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="meal-foods">
                    {meal.foods && meal.foods.length > 0 ? (
                      meal.foods.map((food, idx) => (
                        <div key={idx} className="food-item">
                          <span className="food-name">{food.foodName}</span>
                          <span className="food-details">
                            {food.quantity}g • {Math.round(food.calories)} kcal
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="food-item">
                        <span className="food-name">{meal.foodName}</span>
                        <span className="food-details">
                          {meal.portion}g • {Math.round(meal.calories)} kcal
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="meal-total">
                    Total: {Math.round(meal.totalCalories || meal.calories)} kcal
                    {' • '}
                    P: {Math.round(meal.totalProtein || meal.protein)}g • C: {Math.round(meal.totalCarbs || meal.carbs)}g • F: {Math.round(meal.totalFat || meal.fat)}g
                  </div>
                  {meal.micronutrients && (
                    <div className="meal-micronutrients small" style={{ marginTop: '5px', opacity: 0.8, fontSize: '0.85em' }}>
                      Vit A: {meal.micronutrients.vitaminA} • Vit C: {meal.micronutrients.vitaminC} • Ca: {meal.micronutrients.calcium} • Fe: {meal.micronutrients.iron}
                    </div>
                  )}
                  {meal.confidence < 1 && (
                    <div className="confidence-label small" style={{ marginTop: '5px', fontStyle: 'italic' }}>
                      AI Confidence: {Math.round(meal.confidence * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default History;

