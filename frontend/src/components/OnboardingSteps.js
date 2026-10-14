import React from 'react';
import { computeNutritionPlan } from '../utils/nutritionCalc';
import {
    FaRulerVertical, FaWeight, FaBirthdayCake, FaVenusMars,
    FaBed, FaWalking, FaRunning, FaDumbbell, FaFire,
    FaArrowDown, FaEquals, FaArrowUp, FaStethoscope
} from 'react-icons/fa';
import '../pages/Onboarding.css';

// Step 1: Physical Attributes
export const StepPhysical = ({ data, updateData }) => {
    return (
        <div className="step-animation">
            <div className="onboarding-header">
                <h2>Tell us about yourself</h2>
                <p>This helps us calculate your personalized plan</p>
            </div>

            <div className="step-form">
                <div className="form-row">
                    <div className="form-group">
                        <label><FaBirthdayCake /> Age</label>
                        <input
                            type="number"
                            value={data.age}
                            onChange={(e) => updateData({ age: e.target.value })}
                            placeholder="Years"
                            min="10" max="100"
                        />
                    </div>
                    <div className="form-group">
                        <label><FaVenusMars /> Gender</label>
                        <select
                            value={data.gender}
                            onChange={(e) => updateData({ gender: e.target.value })}
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label><FaRulerVertical /> Height (cm)</label>
                        <input
                            type="number"
                            value={data.height}
                            onChange={(e) => updateData({ height: e.target.value })}
                            placeholder="cm"
                        />
                    </div>
                    <div className="form-group">
                        <label><FaWeight /> Weight (kg)</label>
                        <input
                            type="number"
                            value={data.weight}
                            onChange={(e) => updateData({ weight: e.target.value })}
                            placeholder="kg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 2: Activity Level
export const StepActivity = ({ data, updateData }) => {
    const activities = [
        {
            value: 'sedentary',
            label: 'Sedentary',
            desc: 'Little or no exercise',
            icon: <FaBed />
        },
        {
            value: 'lightly_active',
            label: 'Lightly Active',
            desc: 'Exercise 1-3 days/week',
            icon: <FaWalking />
        },
        {
            value: 'moderately_active',
            label: 'Moderately Active',
            desc: 'Exercise 3-5 days/week',
            icon: <FaRunning />
        },
        {
            value: 'very_active',
            label: 'Very Active',
            desc: 'Hard exercise 6-7 days/week',
            icon: <FaDumbbell />
        },
        {
            value: 'extremely_active',
            label: 'Extremely Active',
            desc: 'Physical job or training 2x/day',
            icon: <FaFire />
        }
    ];

    return (
        <div className="step-animation">
            <div className="onboarding-header">
                <h2>Your Activity Level</h2>
                <p>Be honest! This affects your calorie target.</p>
            </div>

            <div className="activity-grid">
                {activities.map((option) => (
                    <div
                        key={option.value}
                        className={`activity-card ${data.activityLevel === option.value ? 'selected' : ''}`}
                        onClick={() => updateData({ activityLevel: option.value })}
                    >
                        <div className="activity-icon">{option.icon}</div>
                        <div className="activity-info">
                            <h4>{option.label}</h4>
                            <p>{option.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Step 3: Goals
export const StepGoals = ({ data, updateData }) => {
    const goals = [
        { value: 'lose', label: 'Lose Weight', icon: <FaArrowDown /> },
        { value: 'maintain', label: 'Maintain', icon: <FaEquals /> },
        { value: 'gain', label: 'Gain Muscle', icon: <FaArrowUp /> }
    ];

    return (
        <div className="step-animation">
            <div className="onboarding-header">
                <h2>Set Your Goal</h2>
                <p>What do you want to achieve?</p>
            </div>

            <div className="goal-options">
                {goals.map((option) => (
                    <div
                        key={option.value}
                        className={`goal-card ${data.goalType === option.value ? 'selected' : ''}`}
                        onClick={() => updateData({ goalType: option.value })}
                    >
                        <div className="goal-icon">{option.icon}</div>
                        <span>{option.label}</span>
                    </div>
                ))}
            </div>

            {data.goalType !== 'maintain' && (
                <div className="form-group slide-in">
                    <label>Target Weight (kg)</label>
                    <input
                        type="number"
                        value={data.targetWeight || ''}
                        onChange={(e) => updateData({ targetWeight: e.target.value })}
                        placeholder="Target Weight"
                    />
                    <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>
                        Current: {data.weight} kg
                    </small>
                </div>
            )}
        </div>
    );
};

// Step 4: Medical History
export const StepMedical = ({ data, updateData }) => {
    const conditions = [
        { value: 'none', label: 'None / Healthy', desc: 'No major medical conditions' },
        { value: 'diabetes', label: 'Diabetes', desc: 'Blood sugar management focus' },
        { value: 'hypertension', label: 'Hypertension', desc: 'Low sodium / Heart health focus' },
        { value: 'hypothyroidism', label: 'Hypothyroidism', desc: 'Meta-boost / Weight management' },
        { value: 'kidney_issues', label: 'Kidney Issues', desc: 'Low protein / Mineral management' },
        { value: 'other', label: 'Other', desc: 'General healthy lifestyle focus' }
    ];

    return (
        <div className="step-animation">
            <div className="onboarding-header">
                <h2>Medical History</h2>
                <p>Any medical conditions we should know about? (Used for macro adjustments)</p>
            </div>

            <div className="activity-grid">
                {conditions.map((option) => (
                    <div
                        key={option.value}
                        className={`activity-card ${data.medicalHistory === option.value ? 'selected' : ''}`}
                        onClick={() => updateData({ medicalHistory: option.value })}
                    >
                        <div className="activity-icon"><FaStethoscope /></div>
                        <div className="activity-info">
                            <h4>{option.label}</h4>
                            <p>{option.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Step 5: Review
export const StepReview = ({ data }) => {
    // Use the single authoritative pipeline — same values that will be saved
    const plan = computeNutritionPlan({
        weight: Number(data.weight),
        height: Number(data.height),
        age: Number(data.age),
        gender: data.gender,
        activityLevel: data.activityLevel,
        medicalHistory: data.medicalHistory,
        goalType: data.goalType,
    });

    const stats = plan.error
        ? { tdee: 0, protein: 0, carbs: 0, fat: 0, bmr: 0 }
        : {
            tdee: plan.dailyCalorieGoal,
            protein: plan.dailyProteinGoal,
            carbs: plan.dailyCarbsGoal,
            fat: plan.dailyFatGoal,
            bmr: plan.bmr,
        };

    return (
        <div className="step-animation">
            <div className="onboarding-header">
                <h2>Your Personalized Plan</h2>
                <p>Ready to start your journey?</p>
            </div>

            <div className="review-stats">
                <div className="stat-card">
                    <span className="stat-value">{stats.tdee}</span>
                    <span className="stat-label">Daily Calories</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{data.weight}kg</span>
                    <span className="stat-label">Starting Weight</span>
                </div>
            </div>

            <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Daily Targets</h3>
            <div className="macros-preview">
                <div className="macro-item">
                    <span className="macro-val" style={{ color: '#4ADE80' }}>{stats.protein}g</span>
                    <span className="macro-name">Protein</span>
                </div>
                <div className="macro-item">
                    <span className="macro-val" style={{ color: '#60A5FA' }}>{stats.carbs}g</span>
                    <span className="macro-name">Carbs</span>
                </div>
                <div className="macro-item">
                    <span className="macro-val" style={{ color: '#F472B6' }}>{stats.fat}g</span>
                    <span className="macro-name">Fat</span>
                </div>
            </div>
        </div>
    );
};
