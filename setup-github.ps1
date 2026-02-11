# Humgo GitHub Setup Script
# Run this after installing Git: https://git-scm.com/download/win

Write-Host "🚀 Humgo GitHub Repository Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 1: Configure Git (if not already done)" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Yellow

$userName = git config user.name
if ([string]::IsNullOrEmpty($userName)) {
    $userName = Read-Host "Enter your GitHub username"
    git config --global user.name "$userName"
}

$userEmail = git config user.email
if ([string]::IsNullOrEmpty($userEmail)) {
    $userEmail = Read-Host "Enter your GitHub email"
    git config --global user.email "$userEmail"
}

Write-Host "✅ Git configured as: $userName <$userEmail>" -ForegroundColor Green
Write-Host ""

# Initialize repository
Write-Host "Step 2: Initialize Git Repository" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

if (Test-Path .git) {
    Write-Host "⚠️  Git already initialized" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
}

Write-Host ""

# Add files
Write-Host "Step 3: Stage Files" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow

git add .
Write-Host "✅ All files staged" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "Step 4: Create Initial Commit" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

git commit -m "Initial commit: Humgo ride-sharing app with Firebase integration"
Write-Host "✅ Initial commit created" -ForegroundColor Green
Write-Host ""

# Instructions for GitHub
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 NEXT STEPS - Create GitHub Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Fill in:" -ForegroundColor White
Write-Host "   Repository name: humgo" -ForegroundColor Gray
Write-Host "   Description: Humgo - Ride-sharing app with fare splitting (React Native + Firebase)" -ForegroundColor Gray
Write-Host "   Visibility: Public or Private (your choice)" -ForegroundColor Gray
Write-Host "   ⚠️  DO NOT initialize with README, .gitignore, or license" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Click 'Create repository'" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "After creating the repository on GitHub:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$githubUsername = Read-Host "Enter your GitHub username (for the repository URL)"

Write-Host ""
Write-Host "Run these commands:" -ForegroundColor Green
Write-Host ""
Write-Host "git remote add origin https://github.com/$githubUsername/humgo.git" -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📌 Your Repository URL will be:" -ForegroundColor Cyan
Write-Host "https://github.com/$githubUsername/humgo" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ This URL is what you use in Firebase Console!" -ForegroundColor Green
Write-Host ""

# Create a quick reference file
$quickRef = @"
# Humgo GitHub Repository

## Repository URL
https://github.com/$githubUsername/humgo

## Commands Used

1. Initialize Git:
   git init

2. Add files:
   git add .

3. Commit:
   git commit -m "Initial commit: Humgo ride-sharing app with Firebase integration"

4. Link to GitHub:
   git remote add origin https://github.com/$githubUsername/humgo.git
   git branch -M main
   git push -u origin main

## What's Included

✅ React Native + Expo app
✅ Firebase Authentication (Email, Phone, Anonymous)
✅ Firestore Database integration
✅ Ride booking & matching system
✅ Real-time chat
✅ Firebase Hosting configuration
✅ Deployment scripts

## Project Structure

- `/app` - React Native screens (Expo Router)
- `/components` - Reusable UI components
- `/context` - Auth & Ride context providers
- `/utils` - Security & validation utilities
- `/constants` - Theme & configuration
- `firebaseConfig.ts` - Firebase initialization
- `firebase.json` - Firebase Hosting config
- `firestore.rules` - Database security rules

## Deployment

See DEPLOYMENT.md for complete deployment instructions.

Quick deploy:
npm run deploy

## Tech Stack

- React Native 0.81.5
- Expo ~54.0.32
- Firebase 12.8.0
- TypeScript 5.9.2
- Expo Router 6.0.22

## License

[Add your license here]
"@

$quickRef | Out-File -FilePath "GITHUB_SETUP.txt" -Encoding UTF8

Write-Host "📄 Created GITHUB_SETUP.txt with repository details" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Setup complete! Follow the steps above to push to GitHub." -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
