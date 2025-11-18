from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import cv2
import numpy as np
from PIL import Image
import io
import json
import os
from typing import List, Dict

app = FastAPI(title="Calorie Tracker API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Food database with calories per 100g
FOOD_DATABASE = {
    "apple": {"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2},
    "banana": {"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3},
    "orange": {"calories": 47, "protein": 0.9, "carbs": 12, "fat": 0.1},
    "chicken_breast": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6},
    "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3},
    "bread": {"calories": 265, "protein": 9, "carbs": 49, "fat": 3.2},
    "egg": {"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11},
    "milk": {"calories": 42, "protein": 3.4, "carbs": 5, "fat": 1},
    "yogurt": {"calories": 59, "protein": 10, "carbs": 3.6, "fat": 0.4},
    "salmon": {"calories": 208, "protein": 20, "carbs": 0, "fat": 12},
    "broccoli": {"calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4},
    "pasta": {"calories": 131, "protein": 5, "carbs": 25, "fat": 1.1},
    "potato": {"calories": 77, "protein": 2, "carbs": 17, "fat": 0.1},
    "carrot": {"calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2},
    "tomato": {"calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2},
    "spinach": {"calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4},
    "chicken_thigh": {"calories": 209, "protein": 26, "carbs": 0, "fat": 10},
    "beef": {"calories": 250, "protein": 26, "carbs": 0, "fat": 17},
    "pork": {"calories": 242, "protein": 27, "carbs": 0, "fat": 14},
    "fish": {"calories": 206, "protein": 22, "carbs": 0, "fat": 12},
}

# Simple food detection (in production, use ML model)
def detect_food_in_image(image: np.ndarray) -> List[Dict]:
    """
    Simple food detection - returns detected foods with confidence.
    In production, this would use a trained ML model.
    """
    # Convert to RGB if needed
    if len(image.shape) == 3 and image.shape[2] == 3:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    else:
        image_rgb = image
    
    # Placeholder: In real implementation, use food recognition ML model
    # For now, we'll return a simple detection based on image analysis
    detected_foods = []
    
    # Analyze image colors and features to detect food types
    # This is a simplified version - in production use trained model
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV) if len(image.shape) == 3 else None
    
    # Simple heuristics (production would use ML)
    avg_brightness = np.mean(image_rgb) if image_rgb.ndim == 3 else np.mean(image_rgb)
    
    # Mock detection for demo purposes
    # In production, integrate with food recognition API or trained model
    foods_to_check = ["apple", "banana", "chicken_breast", "rice", "bread", "egg"]
    
    for food in foods_to_check:
        # Mock confidence based on random factors
        confidence = np.random.uniform(0.3, 0.9)
        if confidence > 0.5:
            detected_foods.append({
                "name": food,
                "confidence": round(confidence, 2)
            })
    
    # If no foods detected, return a default item
    if not detected_foods:
        detected_foods.append({
            "name": "apple",
            "confidence": 0.7
        })
    
    return detected_foods[:3]  # Return top 3

def estimate_weight(food_name: str, image: np.ndarray) -> float:
    """Estimate food weight in grams based on image."""
    # Simple weight estimation (in production, use size detection)
    base_weights = {
        "apple": 182,  # average apple
        "banana": 118,
        "orange": 154,
        "chicken_breast": 100,
        "rice": 100,  # per serving
        "bread": 25,  # per slice
        "egg": 50,
        "milk": 100,
        "yogurt": 100,
        "salmon": 100,
        "broccoli": 100,
        "pasta": 100,
        "potato": 173,
        "carrot": 61,
        "tomato": 123,
        "spinach": 100,
        "chicken_thigh": 100,
        "beef": 100,
        "pork": 100,
        "fish": 100,
    }
    
    return base_weights.get(food_name.lower(), 100)

def calculate_calories(food_name: str, weight_grams: float) -> Dict:
    """Calculate calories and macros for given food and weight."""
    food_name_lower = food_name.lower()
    
    # Try to find exact match first
    food_data = None
    for key in FOOD_DATABASE.keys():
        if food_name_lower in key or key in food_name_lower:
            food_data = FOOD_DATABASE[key]
            break
    
    if not food_data:
        # Default values if food not found
        food_data = {"calories": 100, "protein": 5, "carbs": 15, "fat": 3}
    
    # Calculate per serving
    multiplier = weight_grams / 100.0
    
    return {
        "food": food_name,
        "weight_grams": round(weight_grams, 1),
        "calories": round(food_data["calories"] * multiplier, 1),
        "protein": round(food_data["protein"] * multiplier, 1),
        "carbs": round(food_data["carbs"] * multiplier, 1),
        "fat": round(food_data["fat"] * multiplier, 1),
    }

@app.get("/")
async def root():
    return {"message": "Calorie Tracker API", "status": "running"}

@app.get("/api/foods")
async def get_foods():
    """Get list of all available foods."""
    return {"foods": list(FOOD_DATABASE.keys())}

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """Analyze uploaded image and return calorie count."""
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Detect foods in image
        detected_foods = detect_food_in_image(image)
        
        # Calculate calories for each detected food
        results = []
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        for food_info in detected_foods:
            food_name = food_info["name"]
            weight = estimate_weight(food_name, image)
            calorie_info = calculate_calories(food_name, weight)
            
            results.append({
                **calorie_info,
                "confidence": food_info["confidence"]
            })
            
            total_calories += calorie_info["calories"]
            total_protein += calorie_info["protein"]
            total_carbs += calorie_info["carbs"]
            total_fat += calorie_info["fat"]
        
        return {
            "detected_foods": results,
            "totals": {
                "calories": round(total_calories, 1),
                "protein": round(total_protein, 1),
                "carbs": round(total_carbs, 1),
                "fat": round(total_fat, 1),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calculate-calories")
async def calculate_calories_endpoint(food_name: str, weight_grams: float):
    """Calculate calories for a specific food item."""
    result = calculate_calories(food_name, weight_grams)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

