# 📋 Step-by-Step GitHub Setup for Humgo

## Prerequisites

### Install Git (if not already installed)

**Windows**: Download from https://git-scm.com/download/win

After installation, restart PowerShell/Terminal.

---

## Steps to Create GitHub Repository

### 1️⃣ Install Git (Skip if already installed)

Download and install Git from: https://git-scm.com/download/win

Verify installation:
```powershell
git --version
```

### 2️⃣ Run the Setup Script

Open PowerShell in the Humgo folder and run:

```powershell
cd D:\HUMGO\Humgo
.\setup-github.ps1
```

**If you get "execution policy" error**, run this first:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then run the script again.

### 3️⃣ Create GitHub Repository

1. Go to: https://github.com/new

2. Fill in:
   - **Repository name**: `humgo`
   - **Description**: `Humgo - Ride-sharing app with fare splitting (React Native + Firebase)`
   - **Visibility**: Public (recommended) or Private
   - ⚠️ **Important**: DO NOT check any boxes (no README, no .gitignore, no license)

3. Click **"Create repository"**

### 4️⃣ Push to GitHub

After creating the repository, GitHub will show you commands. Run these in PowerShell:

```powershell
cd D:\HUMGO\Humgo

# Link your local repo to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/humgo.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Example** (if your username is "john"):
```powershell
git remote add origin https://github.com/john/humgo.git
git branch -M main
git push -u origin main
```

### 5️⃣ Verify Upload

Go to: `https://github.com/YOUR_USERNAME/humgo`

You should see all your code!

---

## ✅ Your Repository URL

```
https://github.com/YOUR_USERNAME/humgo
```

**This is the URL you use in Firebase Console** if it asks for a repository link.

---

## 📌 Manual Setup (If Script Doesn't Work)

If the PowerShell script has issues, here's the manual process:

```powershell
# Navigate to project
cd D:\HUMGO\Humgo

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Humgo ride-sharing app with Firebase integration"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/humgo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔧 Troubleshooting

### Error: "git is not recognized"

**Solution**: Install Git from https://git-scm.com/download/win and restart PowerShell

### Error: "execution policy" when running script

**Solution**: Run this command first:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Error: "repository not found" when pushing

**Solution**: 
1. Make sure you created the repository on GitHub first
2. Double-check your username in the URL
3. Verify you're logged into GitHub

### Error: "Permission denied (publickey)"

**Solution**: Use HTTPS URL instead of SSH:
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/humgo.git
```

---

## 🎉 Success!

Once pushed, your repository is live at:
```
https://github.com/YOUR_USERNAME/humgo
```

### Next Steps:

1. ⭐ Star your own repo (optional but fun!)
2. 📝 Edit the README on GitHub to add your username
3. 🚀 Use this URL in Firebase Console for CI/CD setup
4. 🔗 Share the link with collaborators

---

## 📁 What Got Uploaded?

✅ All source code (`app/`, `components/`, `context/`, etc.)  
✅ Firebase configuration files (`firebase.json`, `firestore.rules`)  
✅ Documentation (`DEPLOYMENT.md`, `QUICK_START.md`)  
✅ Package configuration (`package.json`)  

❌ **Not uploaded** (in .gitignore):  
- `node_modules/` (too large, can be reinstalled)
- `.env` files (keep credentials secret!)
- `dist/`, `.expo/` (build artifacts)
- Firebase debug logs

---

## 🔐 Important Security Note

**Never commit these files:**
- `.env` (environment variables)
- Firebase private keys
- API secrets
- Database credentials

They're already in `.gitignore` to prevent accidental uploads.

---

Need help? Open an issue on your new GitHub repo! 🚀
