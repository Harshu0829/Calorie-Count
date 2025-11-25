@echo off
echo Starting Calorie Tracker Backend...
cd /d "%~dp0"
python -m uvicorn main:app --reload
pause
