# Firebase Configuration Guide

## Environment Variables Setup

Create a `.env` file in the root of your Humgo project (`D:\HUMGO\Humgo\.env`):

```env
# Firebase Configuration (replace with your Firebase project credentials)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## How to Get Firebase Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** or select existing
3. **Add a Web app**:
   - Click "Add app" → Web icon
   - Register your app (name: "Humgo")
   - Copy the firebaseConfig object
4. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Anonymous" (for demo OTP flow)
   - Optional: Enable "Phone" (requires setup)
5. **Create Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in "test mode" (for development)
   - Select a region close to your users

## Firebase Rules (Firestore)

Set these rules in Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Trips collection
    match /trips/{tripId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.senderId == request.auth.uid;
    }
  }
}
```

## After Setup

1. **Restart Metro bundler**: Stop the server and run `npm start` again
2. **Test login**: Email login should create Firebase users
3. **Verify Firestore**: Check Firebase Console → Firestore to see trips/messages

## Current Implementation

- ✅ Firebase Auth with `onAuthStateChanged` listener
- ✅ Email/Password authentication (auto-create accounts)
- ✅ Anonymous auth for phone/email verification demo
- ✅ Firestore for trips and messages
- ✅ Real-time listeners for matches and chat
- ✅ User ID from Firebase UID (not random)
- ✅ Cross-platform (Expo Go + web)

## Production Notes

Replace demo auth flows:
- **Phone Auth**: Use Firebase Phone Auth with reCAPTCHA (web) or native verifier (mobile)
- **Email Auth**: Use Email Link authentication or proper passwords
- Remove anonymous auth fallback
