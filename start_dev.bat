@echo off
echo Starting Audio to Guitar Tab Converter Development Servers...

echo.
echo Installing/Updating Backend Dependencies...
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "python main.py"

echo.
echo Installing/Updating Frontend Dependencies...
cd ..\frontend
call npm install

echo.
echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "npm start"

echo.
echo ===================================
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ===================================
echo.
echo Press any key to exit...
pause > nul