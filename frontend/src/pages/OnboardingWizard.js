import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StepPhysical, StepActivity, StepGoals, StepMedical, StepReview } from '../components/OnboardingSteps';
import api from '../services/api';
import './Onboarding.css';

const OnboardingWizard = () => {
    const { user, fetchUser } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        age: '',
        gender: '',
        height: '',
        weight: '',
        activityLevel: 'sedentary',
        goalType: 'maintain',
        targetWeight: '',
        medicalHistory: 'none'
    });

    // Pre-fill data if user already has some (e.g. from registration)
    useEffect(() => {
        if (user) {
            setData(prev => ({
                ...prev,
                // name is not in wizard, preserving it
                age: user.age || '',
                gender: user.gender || '',
                height: user.height || '',
                weight: user.weight || '',
                activityLevel: user.activityLevel || 'sedentary',
                medicalHistory: user.medicalHistory || 'none'
            }));
        }
    }, [user]);

    const updateData = (newData) => {
        setData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => {
        if (currentStep < 5) setCurrentStep(curr => curr + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(curr => curr - 1);
    };

    // Validation
    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return data.age && data.gender && data.height && data.weight;
            case 2:
                return data.activityLevel;
            case 3:
                return data.goalType && (data.goalType === 'maintain' || data.targetWeight);
            default:
                return true;
        }
    };

    // Final Calculation & Submission
    const finishOnboarding = async () => {
        setLoading(true);
        try {
            // Calculate final targets
            const weight = Number(data.weight);
            const height = Number(data.height) / 100;
            const age = Number(data.age);

            let bmr = (10 * weight) + (6.25 * height * 100) - (5 * age);
            if (data.gender === 'male') bmr += 5;
            else bmr -= 161;

            const activityMultipliers = {
                sedentary: 1.2,
                lightly_active: 1.375,
                moderately_active: 1.55,
                very_active: 1.725,
                extremely_active: 1.9
            };

            const maintenanceCalories = Math.round(bmr * (activityMultipliers[data.activityLevel] || 1.2));

            let targetCalories = maintenanceCalories;
            if (data.goalType === 'lose') targetCalories -= 500;
            if (data.goalType === 'gain') targetCalories += 300;

            // Medical Adjustments
            if (data.medicalHistory === 'hypothyroidism') {
                targetCalories = Math.round(targetCalories * 0.9);
            }

            // Macros
            let protein, fat, carbs;

            if (data.medicalHistory === 'kidney_issues') {
                protein = Math.round(weight * 1.0);
            } else {
                protein = Math.round(weight * 2);
            }

            if (data.medicalHistory === 'diabetes') {
                carbs = Math.round((targetCalories * 0.35) / 4);
                fat = Math.round((targetCalories - (protein * 4) - (carbs * 4)) / 9);
            } else {
                fat = Math.round((targetCalories * 0.25) / 9);
                carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
            }

            const payload = {
                ...data,
                dailyCalorieGoal: targetCalories,
                dailyProteinGoal: protein,
                dailyCarbsGoal: carbs,
                dailyFatGoal: fat,
                hasCompletedOnboarding: true
            };

            // Ensure targetWeight is number if present
            if (payload.targetWeight) payload.targetWeight = Number(payload.targetWeight);

            // Send to backend
            await api.post('/auth/onboarding', payload);

            // Refresh user context and redirect
            await fetchUser();
            navigate('/dashboard');

        } catch (error) {
            console.error('Onboarding error:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const Steps = [StepPhysical, StepActivity, StepGoals, StepMedical, StepReview];
    const CurrentStepComponent = Steps[currentStep - 1];

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        ></div>
                    </div>
                    <p className="step-indicator">Step {currentStep} of 5</p>
                </div>

                {/* Content */}
                <div className="onboarding-content">
                    <CurrentStepComponent data={data} updateData={updateData} />

                    <div className="onboarding-footer">
                        <button
                            className="btn btn-back"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            style={{ opacity: currentStep === 1 ? 0 : 1 }}
                        >
                            Back
                        </button>

                        {currentStep < 5 ? (
                            <button
                                className="btn btn-primary"
                                onClick={nextStep}
                                disabled={!isStepValid()}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={finishOnboarding}
                                disabled={loading}
                            >
                                {loading ? 'Creating Plan...' : 'Finish & Start'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
