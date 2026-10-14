import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StepPhysical, StepActivity, StepGoals, StepMedical, StepReview } from '../components/OnboardingSteps';
import api from '../services/api';
import { computeNutritionPlan } from '../utils/nutritionCalc';
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
            // Use the single authoritative calculation pipeline
            const plan = computeNutritionPlan({
                weight: Number(data.weight),
                height: Number(data.height),
                age: Number(data.age),
                gender: data.gender,
                activityLevel: data.activityLevel,
                medicalHistory: data.medicalHistory,
                goalType: data.goalType,
            });

            if (plan.error) {
                alert(`Please fix profile data: ${plan.error}`);
                setLoading(false);
                return;
            }

            const payload = {
                ...data,
                age: Number(data.age),
                height: Number(data.height),
                weight: Number(data.weight),
                dailyCalorieGoal: plan.dailyCalorieGoal,
                dailyProteinGoal: plan.dailyProteinGoal,
                dailyCarbsGoal: plan.dailyCarbsGoal,
                dailyFatGoal: plan.dailyFatGoal,
                hasCompletedOnboarding: true,
            };

            // Ensure targetWeight is a number if present
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
