@echo off
echo ========================================
echo  Humgo GitHub Setup
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Check Git configuration
for /f "delims=" %%i in ('git config user.name') do set GIT_USER=%%i
for /f "delims=" %%i in ('git config user.email') do set GIT_EMAIL=%%i

if "%GIT_USER%"=="" (
    echo Git user.name not configured.
    set /p GIT_USER="Enter your name: "
    git config --global user.name "%GIT_USER%"
)

if "%GIT_EMAIL%"=="" (
    echo Git user.email not configured.
    set /p GIT_EMAIL="Enter your email: "
    git config --global user.email "%GIT_EMAIL%"
)

echo [OK] Git configured as: %GIT_USER% ^<%GIT_EMAIL%^>
echo.

REM Initialize Git if not already
if not exist .git (
    echo Initializing Git repository...
    git init
    echo [OK] Git initialized
) else (
    echo [OK] Git already initialized
)

echo.

REM Add files
echo Staging files...
git add .
echo [OK] Files staged
echo.

REM Commit
echo Creating commit...
git commit -m "Initial commit: Humgo ride-sharing app with Firebase integration"
echo [OK] Commit created
echo.

echo ========================================
echo  Next Steps
echo ========================================
echo.
echo 1. Go to: https://github.com/new
echo.
echo 2. Create repository:
echo    Name: humgo
echo    Description: Humgo ride-sharing app
echo    Visibility: Public or Private
echo    DO NOT initialize with README!
echo.
echo 3. After creating, enter your GitHub username below:
echo.

set /p GITHUB_USER="Enter your GitHub username: "

echo.
echo ========================================
echo  Run These Commands Next
echo ========================================
echo.
echo git remote add origin https://github.com/%GITHUB_USER%/humgo.git
echo git branch -M main
echo git push -u origin main
echo.

REM Create a reference file
(
echo Humgo GitHub Repository
echo =======================
echo.
echo Repository URL: https://github.com/%GITHUB_USER%/humgo
echo.
echo Commands to push:
echo   git remote add origin https://github.com/%GITHUB_USER%/humgo.git
echo   git branch -M main
echo   git push -u origin main
echo.
echo Use this URL in Firebase Console if needed.
) > GITHUB_SETUP.txt

echo [OK] Created GITHUB_SETUP.txt with details
echo.
echo Your repository URL will be:
echo https://github.com/%GITHUB_USER%/humgo
echo.

pause
