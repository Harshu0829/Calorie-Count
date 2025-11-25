from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
import uvicorn
import cv2
import numpy as np
from PIL import Image
import io
import json
import os
import time
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from anthropic import AsyncAnthropic
import redis.asyncio as redis
import aiohttp
from bson import ObjectId

# --- Configuration ---
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "calorie_tracker"
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
NUTRITIONIX_APP_ID = os.getenv("NUTRITIONIX_APP_ID")
NUTRITIONIX_API_KEY = os.getenv("NUTRITIONIX_API_KEY")

# --- App Setup ---
app = FastAPI(title="Calorie Tracker API Enhanced")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database & Cache ---
client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]
redis_client = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)

# --- Auth Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Models ---
class User(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class FoodItem(BaseModel):
    name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    weight_grams: float = 100.0
    confidence: Optional[float] = None

class AnalysisResponse(BaseModel):
    detected_foods: List[FoodItem]
    totals: Dict[str, float]

# --- Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    return UserInDB(**user)

async def get_nutrition_from_external(query: str):
    """Fetch nutrition data from Nutritionix or fallback."""
    # Check cache first
    cache_key = f"nutrition:{query.lower()}"
    cached_data = await redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    if NUTRITIONIX_APP_ID and NUTRITIONIX_API_KEY:
        url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
        headers = {
            "x-app-id": NUTRITIONIX_APP_ID,
            "x-app-key": NUTRITIONIX_API_KEY,
            "Content-Type": "application/json"
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json={"query": query}, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data["foods"]:
                        food = data["foods"][0]
                        result = {
                            "calories": food["nf_calories"],
                            "protein": food["nf_protein"],
                            "carbs": food["nf_total_carbohydrate"],
                            "fat": food["nf_total_fat"],
                            "weight_grams": food["serving_weight_grams"]
                        }
                        # Cache for 24 hours
                        await redis_client.setex(cache_key, 86400, json.dumps(result))
                        return result
    
    # Fallback to local DB or generic estimation
    return {"calories": 100, "protein": 5, "carbs": 15, "fat": 3, "weight_grams": 100}

async def analyze_image_with_claude(image_bytes: bytes):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="Anthropic API Key not configured")
    
    client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    
    # Convert to base64
    import base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    
    prompt = """
    Analyze this image and identify the food items present. 
    Estimate the weight of each item in grams based on visual portion size.
    Return a JSON object with a key 'foods' containing a list of items.
    Each item should have: 'name', 'weight_grams' (integer), and 'confidence' (0.0-1.0).
    Example: {"foods": [{"name": "grilled chicken", "weight_grams": 150, "confidence": 0.95}]}
    """
    
    try:
        message = await client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_b64,
                            },
                        },
                        {"type": "text", "text": prompt}
                    ],
                }
            ],
        )
        
        # Extract JSON from response
        content = message.content[0].text
        # Simple parsing logic (robustness could be improved)
        start = content.find('{')
        end = content.rfind('}') + 1
        json_str = content[start:end]
        return json.loads(json_str)
        
    except Exception as e:
        print(f"Claude API Error: {e}")
        raise HTTPException(status_code=500, detail="Error analyzing image with AI")

# --- Routes ---

# --- Routes ---

@app.post("/api/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/users", response_model=User)
async def create_user(user: UserInDB):
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    user.hashed_password = get_password_hash(user.hashed_password)
    await db.users.insert_one(user.dict())
    return user

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/api/users/me", response_model=User)
async def update_user_me(user_update: dict, current_user: User = Depends(get_current_user)):
    """Update current user profile."""
    # Filter allowed fields
    allowed_fields = ["full_name", "email", "age", "height", "weight", "activityLevel", 
                      "dailyCalorieGoal", "dailyProteinGoal", "dailyCarbsGoal", "dailyFatGoal",
                      "weightHistory", "heightHistory", "goalHistory"]
    
    update_data = {k: v for k, v in user_update.items() if k in allowed_fields}
    
    if update_data:
        await db.users.update_one(
            {"username": current_user.username},
            {"$set": update_data}
        )
        
        # Fetch updated user
        updated_user = await db.users.find_one({"username": current_user.username})
        return UserInDB(**updated_user)
    
    return current_user

@app.post("/api/analyze-image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    """
    Analyze uploaded image using Claude 3 and enrich with nutrition data.
    """
    contents = await file.read()
    
    # 1. Get Food Detection & Weight from Claude
    try:
        analysis_result = await analyze_image_with_claude(contents)
        detected_items = analysis_result.get("foods", [])
    except Exception:
        # Fallback to simple mock if API fails/not configured
        detected_items = [{"name": "unknown food", "weight_grams": 100, "confidence": 0.5}]

    results = []
    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}

    # 2. Get Nutrition Data for each item
    for item in detected_items:
        name = item["name"]
        weight = item.get("weight_grams", 100)
        
        nutrition = await get_nutrition_from_external(name)
        
        # Scale nutrition by weight
        scale = weight / nutrition["weight_grams"]
        
        food_item = FoodItem(
            name=name,
            calories=round(nutrition["calories"] * scale, 1),
            protein=round(nutrition["protein"] * scale, 1),
            carbs=round(nutrition["carbs"] * scale, 1),
            fat=round(nutrition["fat"] * scale, 1),
            weight_grams=weight,
            confidence=item.get("confidence")
        )
        
        results.append(food_item)
        totals["calories"] += food_item.calories
        totals["protein"] += food_item.protein
        totals["carbs"] += food_item.carbs
        totals["fat"] += food_item.fat

    # 3. Log to MongoDB (User History)
    log_entry = {
        "user_id": current_user.username,
        "timestamp": datetime.utcnow(),
        "foods": [f.dict() for f in results],
        "totals": totals
    }
    await db.food_logs.insert_one(log_entry)

    return {"detected_foods": results, "totals": totals}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "db": "connected" if client else "disconnected"}

# --- Static Files & SPA Fallback ---
# Mount the static directory (CSS, JS, media)
# Check if build directory exists to avoid errors during dev if not built
if os.path.exists("../frontend/build"):
    app.mount("/static", StaticFiles(directory="../frontend/build/static"), name="static")
    # You might also want to mount other root-level files like manifest.json, favicon.ico if needed,
    # or just rely on the catch-all if they are in the build root.
    
    # Catch-all route for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Check if the file exists in build directory (e.g. manifest.json, favicon.ico)
        file_path = os.path.join("../frontend/build", full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html
        return FileResponse("../frontend/build/index.html")
else:
    print("Warning: ../frontend/build directory not found. Frontend will not be served.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
