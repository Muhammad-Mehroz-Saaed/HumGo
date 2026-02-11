# Humgo - Firebase Deployment Guide

## Prerequisites

1. **Firebase CLI**: Install globally if not already installed
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a project in [Firebase Console](https://console.firebase.google.com/)

## Setup Steps

### 1. Update Firebase Configuration

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "humgo-app-123"
  }
}
```

### 2. Update Environment Variables

Make sure your Firebase config in `firebaseConfig.ts` has the correct credentials from Firebase Console:

- Go to Firebase Console → Project Settings → General
- Scroll to "Your apps" → Web apps
- Copy the configuration values

Update `.env` or `firebaseConfig.ts` with:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

### 3. Enable Firebase Services

In Firebase Console, enable:

1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Anonymous (for demo mode)
   - Enable Phone (optional, requires setup)

2. **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **production mode** or **test mode** (for development)
   - Choose a location closest to your users

3. **Firebase Hosting**:
   - Go to Hosting → Get Started
   - Follow the setup wizard

### 4. Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trips collection
    match /trips/{tripId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Matches collection
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.senderId == request.auth.uid;
    }
  }
}
```

## Deployment Commands

### First Time Deployment

1. **Login to Firebase**:
   ```bash
   firebase login
   ```

2. **Build the web version**:
   ```bash
   npm run build:web
   ```

3. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

### Subsequent Deployments

Use the combined command:
```bash
npm run deploy
```

This will:
1. Build the optimized web version
2. Deploy to Firebase Hosting

## Post-Deployment

### Update Authentication Settings

1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", add your Firebase Hosting domain:
   - `your-project-id.web.app`
   - `your-project-id.firebaseapp.com`

### Test Your Deployment

1. Visit: `https://your-project-id.web.app`
2. Try demo mode (anonymous login)
3. Test ride booking flow
4. Verify Firestore is receiving data

## Troubleshooting

### Build Issues

If build fails, try:
```bash
rm -rf node_modules dist
npm install
npm run build:web
```

### Authentication Issues

- Check Firebase Console → Authentication → Sign-in method
- Verify authorized domains include your hosting URL
- Check browser console for CORS errors

### Firestore Issues

- Verify Firestore rules allow authenticated users
- Check Firebase Console → Firestore → Data to see if documents are created
- Review security rules if writes are blocked

## Mobile App (Expo Go)

For mobile deployment:

1. **Build APK/IPA**:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

2. **Submit to stores** (requires Expo EAS):
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## Environment-Specific Deployments

### Staging Environment

Create `.firebaserc`:
```json
{
  "projects": {
    "default": "humgo-production",
    "staging": "humgo-staging"
  }
}
```

Deploy to staging:
```bash
firebase use staging
firebase deploy --only hosting
```

## Monitoring

- **Analytics**: Firebase Console → Analytics
- **Crashlytics**: Firebase Console → Crashlytics
- **Performance**: Firebase Console → Performance Monitoring

## Support

For issues:
1. Check Firebase Console logs
2. Review browser console errors
3. Verify Firestore rules and indexes
4. Check Authentication configuration
