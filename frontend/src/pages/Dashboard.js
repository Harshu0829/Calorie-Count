import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaQuoteLeft, FaQuoteRight, FaTrophy, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CircularProgress from '../components/CircularProgress';
import AchievementBadge from '../components/AchievementBadge';
import BottomNavigation from '../components/BottomNavigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [manualMeals, setManualMeals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [editingMeal, setEditingMeal] = useState(null);
  const getMealTypeByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snack';
  };

  const [mealForm, setMealForm] = useState({
    mealType: getMealTypeByTime(),
    foodName: '',
    portion: 100
  });
  const [submitting, setSubmitting] = useState(false);
  const { user: authUser } = useAuth();

  const motivationalQuotes = [
    { text: "Every meal is a step toward your goal!", author: "Your Future Self" },
    { text: "You're stronger than your cravings!", author: "Fitness Coach" },
    { text: "Small steps lead to big results!", author: "Wellness Expert" },
    { text: "Your dedication is inspiring!", author: "Health Community" },
    { text: "Progress, not perfection!", author: "Motivational Quote" }
  ];

  const [dailyQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);



  const calculateManualTotals = (manualList = []) => {
    return manualList.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.calories || 0),
        protein: totals.protein + (meal.protein || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fat: totals.fat + (meal.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  // Simplified streak calculation - TODO: Move to backend
  const calculateStreak = useCallback(async () => {
    // Temporarily disabled to fix performance issues
    // This was making 60 API calls on every page load
    return { currentStreak: 0, streakStartDate: new Date() };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, mealsRes, manualRes] = await Promise.all([
        api.get(`/meals/summary?date=${date}`).catch(() => ({ data: { summary: null } })),
        api.get(`/meals?date=${date}`).catch(() => ({ data: { meals: [] } })),
        api.get(`/manual-meals?date=${date}`).catch(() => ({ data: { manualMeals: [] } }))
      ]);

      const manualData = manualRes.data.manualMeals || [];
      setManualMeals(manualData);

      const manualTotals = calculateManualTotals(manualData);
      const summaryData = summaryRes.data.summary || {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: 0
      };

      setSummary({
        totalCalories: (summaryData.totalCalories || 0) + manualTotals.calories,
        totalProtein: (summaryData.totalProtein || 0) + manualTotals.protein,
        totalCarbs: (summaryData.totalCarbs || 0) + manualTotals.carbs,
        totalFat: (summaryData.totalFat || 0) + manualTotals.fat,
        meals: (summaryData.meals || 0) + manualData.length
      });

      setMeals(mealsRes.data.meals || []);

      // Simplified achievements - TODO: Implement backend calculation
      // Temporarily disabled streak achievements to fix performance
      setStreak(0);
      setAchievements([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, calculateStreak]);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      fetchDashboardData();
    }
  }, [authUser, fetchDashboardData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCalorieProgressColor = () => {
    if (!summary || !user) return 'var(--electric-blue)';
    const percentage = (summary.totalCalories / (user.dailyCalorieGoal || 2000)) * 100;
    if (percentage >= 100) return 'var(--success-color)';
    if (percentage >= 80) return 'var(--warning-color)';
    return 'var(--electric-blue)';
  };

  const getMacroChartData = () => {
    if (!summary || !user) return [];
    return [
      { name: 'Protein', consumed: summary.totalProtein || 0, goal: user.dailyProteinGoal || 50 },
      { name: 'Carbs', consumed: summary.totalCarbs || 0, goal: user.dailyCarbsGoal || 250 },
      { name: 'Fat', consumed: summary.totalFat || 0, goal: user.dailyFatGoal || 65 }
    ];
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealTypeLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' };

  const handleMealInputChange = (e) => {
    const { name, value } = e.target;
    setMealForm(prev => ({
      ...prev,
      [name]: name === 'portion' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddMeal = async () => {
    const description = mealForm.foodName.trim();

    if (!description || mealForm.portion <= 0) {
      alert('Please enter a food name and valid portion amount');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate nutrition for the food
      const calcResponse = await api.post('/foods/calculate', {
        food_name: description,
        weight_grams: mealForm.portion
      });

      const foodData = calcResponse.data;

      // Persist manual meal entry
      await api.post('/manual-meals', {
        mealType: mealForm.mealType,
        description,
        portion: mealForm.portion,
        nutrition: {
          calories: foodData.calories || 0,
          protein: foodData.protein || 0,
          carbs: foodData.carbs || 0,
          fat: foodData.fat || 0
        },
        date: new Date().toISOString()
      });

      // Reset form
      setMealForm({
        mealType: getMealTypeByTime(),
        foodName: '',
        portion: 100
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding manual meal:', error);
      alert(error.response?.data?.message || 'Unable to save meal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal({
      ...meal,
      editForm: {
        mealType: meal.mealType,
        foodName: meal.foods[0]?.foodName || '',
        portion: meal.foods[0]?.quantity || 100
      }
    });
  };

  const handleUpdateMeal = async (meal) => {
    if (!editingMeal.editForm.foodName.trim() || editingMeal.editForm.portion <= 0) {
      alert('Please enter a valid food name and portion');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate calories for the updated food
      const calcResponse = await api.post('/foods/calculate', {
        food_name: editingMeal.editForm.foodName.trim(),
        weight_grams: editingMeal.editForm.portion
      });

      const foodData = calcResponse.data;

      if (editingMeal.isManual) {
        await api.put(`/manual-meals/${meal._id}`, {
          mealType: editingMeal.editForm.mealType,
          description: editingMeal.editForm.foodName.trim(),
          portion: editingMeal.editForm.portion,
          nutrition: {
            calories: foodData.calories || 0,
            protein: foodData.protein || 0,
            carbs: foodData.carbs || 0,
            fat: foodData.fat || 0
          }
        });
      } else {
        await api.put(`/meals/${meal._id}`, {
          mealType: editingMeal.editForm.mealType,
          foods: [{
            foodName: editingMeal.editForm.foodName.trim(),
            quantity: editingMeal.editForm.portion,
            calories: foodData.calories || 0,
            protein: foodData.protein || 0,
            carbs: foodData.carbs || 0,
            fat: foodData.fat || 0
          }]
        });
      }

      setEditingMeal(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating meal:', error);
      alert(error.response?.data?.message || 'Error updating meal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (meal) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      if (meal.isManual) {
        await api.delete(`/manual-meals/${meal._id}`);
      } else {
        await api.delete(`/meals/${meal._id}`);
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert(error.response?.data?.message || 'Error deleting meal. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingMeal(null);
  };

  const formatManualMealForDisplay = (meal) => ({
    ...meal,
    isManual: true,
    foods: [{
      foodName: meal.description,
      quantity: meal.portion,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat
    }],
    totalCalories: meal.calories,
    totalProtein: meal.protein,
    totalCarbs: meal.carbs,
    totalFat: meal.fat
  });

  const formatTrackedMealForDisplay = (meal) => ({
    ...meal,
    isManual: meal.isManual ?? false
  });

  const getMealsByType = (type) => {
    const trackedMealsByType = (meals || [])
      .filter(meal => meal.mealType === type)
      .map(formatTrackedMealForDisplay);

    const manualMealsByType = (manualMeals || [])
      .filter(meal => meal.mealType === type)
      .map(formatManualMealForDisplay);

    return [...trackedMealsByType, ...manualMealsByType].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  };

  const getRecentMeals = () => {
    const combinedMeals = [
      ...(meals || []).map(formatTrackedMealForDisplay),
      ...(manualMeals || []).map(formatManualMealForDisplay)
    ];

    return combinedMeals
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const recentMeals = getRecentMeals();

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const caloriesGoal = user?.dailyCalorieGoal || 2000;
  const caloriesConsumed = summary?.totalCalories || 0;
  const caloriesRemaining = Math.max(0, caloriesGoal - caloriesConsumed);

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header with Profile and Streak */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <div className="header-top">
            <div>
              <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
              <p className="header-subtitle">{formatDate(date)}</p>
            </div>
            {user?.profilePicture && (
              <img src={user.profilePicture} alt="Profile" className="profile-picture" />
            )}
          </div>
          {streak > 0 && (
            <div className="streak-badge">
              <FaFire /> {streak} Day Streak!
            </div>
          )}
        </motion.header>

        {/* Manual Meal Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="manual-meal-input card"
        >
          <h2>Add Meal</h2>
          <div className="meal-input-form">
            <div className="form-group">
              <label htmlFor="mealType">Meal Type</label>
              <select
                id="mealType"
                name="mealType"
                value={mealForm.mealType}
                onChange={handleMealInputChange}
                className="form-control"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snacks</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="foodName">Food Description</label>
              <input
                type="text"
                id="foodName"
                name="foodName"
                value={mealForm.foodName}
                onChange={handleMealInputChange}
                placeholder="e.g., Grilled Chicken Breast"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="portion">Portion (grams)</label>
              <input
                type="number"
                id="portion"
                name="portion"
                value={mealForm.portion}
                onChange={handleMealInputChange}
                placeholder="100"
                min="1"
                className="form-control"
              />
            </div>
            <button
              onClick={handleAddMeal}
              disabled={submitting || !mealForm.foodName.trim() || mealForm.portion <= 0}
              className="btn btn-primary btn-add-meal"
            >
              <FaPlus /> {submitting ? 'Adding...' : 'Add Meal'}
            </button>
          </div>
        </motion.div>

        {/* Today's Summary with Circular Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="today-summary card"
        >
          <h2>Today's Summary</h2>
          <div className="summary-content">
            <div className="calorie-progress">
              <CircularProgress
                value={caloriesConsumed}
                max={caloriesGoal}
                label="Calories"
                color={getCalorieProgressColor()}
                size={200}
              />
              <div className="calorie-info">
                <div className="calorie-remaining">
                  <span className="label">Remaining</span>
                  <span className="value">{Math.round(caloriesRemaining)} kcal</span>
                </div>
                <div className="motivational-message">
                  {caloriesRemaining > 0
                    ? `You're ${Math.round(caloriesRemaining)} calories away from your goal!`
                    : 'Great job! You\'ve reached your daily goal! 🎉'}
                </div>
              </div>
            </div>

            {/* Macros Breakdown */}
            <div className="macros-breakdown">
              <h3>Macros Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getMacroChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    cursor={{ fill: 'rgba(56, 189, 248, 0.12)' }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                    wrapperStyle={{ outline: 'none' }}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Bar dataKey="consumed" fill="var(--electric-blue)" radius={[8, 8, 0, 0]}>
                    {getMacroChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.consumed >= entry.goal ? 'var(--success-color)' :
                          entry.consumed >= entry.goal * 0.8 ? 'var(--warning-color)' :
                            'var(--electric-blue)'
                      } />
                    ))}
                  </Bar>
                  <Bar dataKey="goal" fill="rgba(255, 255, 255, 0.1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="macros-grid">
                <div className="macro-item">
                  <span className="macro-label">Protein</span>
                  <span className="macro-value">
                    {Math.round(summary?.totalProtein || 0)} / {user?.dailyProteinGoal || 50}g
                  </span>
                  <div className="macro-bar">
                    <div
                      className="macro-fill protein"
                      style={{
                        width: `${Math.min(100, ((summary?.totalProtein || 0) / (user?.dailyProteinGoal || 50)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="macro-item">
                  <span className="macro-label">Carbs</span>
                  <span className="macro-value">
                    {Math.round(summary?.totalCarbs || 0)} / {user?.dailyCarbsGoal || 250}g
                  </span>
                  <div className="macro-bar">
                    <div
                      className="macro-fill carbs"
                      style={{
                        width: `${Math.min(100, ((summary?.totalCarbs || 0) / (user?.dailyCarbsGoal || 250)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="macro-item">
                  <span className="macro-label">Fat</span>
                  <span className="macro-value">
                    {Math.round(summary?.totalFat || 0)} / {user?.dailyFatGoal || 65}g
                  </span>
                  <div className="macro-bar">
                    <div
                      className="macro-fill fat"
                      style={{
                        width: `${Math.min(100, ((summary?.totalFat || 0) / (user?.dailyFatGoal || 65)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Meal Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="meal-timeline card"
        >
          <h2>Meal Timeline</h2>
          <div className="timeline">
            {mealTypes.map((type) => {
              const mealItems = getMealsByType(type);
              return (
                <div key={type} className="timeline-item">
                  <div className="timeline-marker">{mealTypeLabels[type]}</div>
                  <div className="timeline-content">
                    {mealItems.length > 0 ? (
                      mealItems.map((meal) => (
                        <div key={meal._id} className="timeline-meal">
                          {editingMeal && editingMeal._id === meal._id ? (
                            <div className="meal-edit-form">
                              <div className="edit-form-row">
                                <select
                                  value={editingMeal.editForm.mealType}
                                  onChange={(e) => setEditingMeal({
                                    ...editingMeal,
                                    editForm: { ...editingMeal.editForm, mealType: e.target.value }
                                  })}
                                  className="form-control form-control-sm"
                                >
                                  <option value="breakfast">Breakfast</option>
                                  <option value="lunch">Lunch</option>
                                  <option value="dinner">Dinner</option>
                                  <option value="snack">Snacks</option>
                                </select>
                                <input
                                  type="text"
                                  value={editingMeal.editForm.foodName}
                                  onChange={(e) => setEditingMeal({
                                    ...editingMeal,
                                    editForm: { ...editingMeal.editForm, foodName: e.target.value }
                                  })}
                                  placeholder="Food name"
                                  className="form-control form-control-sm"
                                />
                                <input
                                  type="number"
                                  value={editingMeal.editForm.portion}
                                  onChange={(e) => setEditingMeal({
                                    ...editingMeal,
                                    editForm: { ...editingMeal.editForm, portion: parseFloat(e.target.value) || 0 }
                                  })}
                                  placeholder="Portion (g)"
                                  min="1"
                                  className="form-control form-control-sm"
                                />
                              </div>
                              <div className="edit-form-actions">
                                <button
                                  onClick={() => handleUpdateMeal(meal)}
                                  disabled={submitting}
                                  className="btn btn-sm btn-success"
                                >
                                  <FaSave /> Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="btn btn-sm btn-secondary"
                                >
                                  <FaTimes /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="meal-time">
                                {new Date(meal.date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="meal-details">
                                {meal.isManual && <span className="manual-tag">Manual Entry</span>}
                                {meal.foods.map((food, idx) => (
                                  <span key={idx} className="food-tag">
                                    {food.foodName} ({food.quantity}g)
                                  </span>
                                ))}
                              </div>
                              <div className="meal-calories">{Math.round(meal.totalCalories)} kcal</div>
                              <div className="meal-actions">
                                <button
                                  onClick={() => handleEditMeal(meal)}
                                  className="btn-icon btn-edit"
                                  title="Edit meal"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteMeal(meal)}
                                  className="btn-icon btn-delete"
                                  title="Delete meal"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="no-meal">No {type} recorded yet</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="achievements-section card"
          >
            <h2>
              <FaTrophy /> Recent Achievements
            </h2>
            <div className="achievements-grid">
              {achievements.slice(0, 3).map((achievement, idx) => (
                <AchievementBadge key={idx} achievement={achievement} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="motivational-quote-card card"
        >
          <FaQuoteLeft className="quote-icon" />
          <p className="quote-text">{dailyQuote.text}</p>
          <p className="quote-author">— {dailyQuote.author}</p>
          <FaQuoteRight className="quote-icon quote-icon-right" />
        </motion.div>

        {/* Recent Meals */}
        {recentMeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="recent-meals card"
          >
            <h2>Recent Meals</h2>
            <div className="meals-list">
              {recentMeals.map((meal) => (
                <div key={meal._id} className="meal-card">
                  <div className="meal-card-header">
                    <div className="meal-card-title">
                      <span className="meal-type-badge">{mealTypeLabels[meal.mealType]}</span>
                      {meal.isManual && <span className="manual-tag">Manual Entry</span>}
                    </div>
                    <span className="meal-card-time">
                      {new Date(meal.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="meal-card-foods">
                    {meal.foods.map((food, idx) => (
                      <span key={idx} className="food-chip">
                        {food.foodName}
                      </span>
                    ))}
                  </div>
                  <div className="meal-card-footer">
                    <span className="meal-card-calories">{Math.round(meal.totalCalories)} kcal</span>
                    <span className="meal-card-macros">
                      P: {Math.round(meal.totalProtein)}g • C: {Math.round(meal.totalCarbs)}g • F: {Math.round(meal.totalFat)}g
                    </span>
                  </div>
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

export default Dashboard;
