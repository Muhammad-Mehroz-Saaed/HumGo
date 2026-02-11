# 🚗 Humgo - Smart Ride Sharing App

**Go together. Pay less.**

A modern ride-sharing app with fare splitting, real-time matching, and chat functionality. Built with React Native, Expo, and Firebase.

## ✨ Features

- 🔐 **Multi-Auth**: Email, Phone OTP, Anonymous Demo
- 🗺️ **Interactive Maps**: Pick locations, view routes
- 🤝 **Smart Matching**: Find riders going your direction
- 💬 **Real-time Chat**: Message matched riders
- 🔥 **Firebase Backend**: Secure & scalable
- 🌐 **Cross-Platform**: iOS, Android, Web

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

Update `firebaseConfig.ts` with your Firebase project credentials from [Firebase Console](https://console.firebase.google.com/)

### 3. Run the App

```bash
# Development
npm start

# Web
npm run web

# Android
npm run android

# iOS  
npm run ios
```

## 📁 Project Structure

```
app/(tabs)/        # Main screens with Expo Router
  ├── index.tsx    # Splash screen
  ├── login.tsx    # Authentication
  ├── home.tsx     # Ride booking
  ├── active-ride.tsx
  ├── match-list.tsx
  └── chat.tsx     # Real-time messaging

context/           # State management
  ├── AuthContext.tsx
  └── RideContext.tsx

firebaseConfig.ts  # Firebase setup
firestore.rules    # Database security
```

## 🌐 Deployment

### Firebase Hosting

```bash
# 1. Update .firebaserc with your project ID
# 2. Install Firebase CLI
npm install -g firebase-tools

# 3. Deploy
npm run deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- ✅ Firebase Auth is single source of truth
- ✅ Firestore security rules enforce access control  
- ✅ Input validation & sanitization
- ✅ Rate limiting on critical operations
- ✅ No local auth flags or bypasses

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [QUICK_START.md](QUICK_START.md) - Fast setup reference  
- [README_DEPLOY.md](README_DEPLOY.md) - Firebase hosting steps

## 🛠️ Tech Stack

- React Native 0.81.5
- Expo ~54.0.32
- Firebase 12.8.0
- TypeScript 5.9.2
- Expo Router 6.0.22
- React Native Maps

## 📝 License

MIT License - see LICENSE file for details

---

**Made with ❤️ using React Native + Firebase**
