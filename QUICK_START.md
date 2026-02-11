# Quick Deployment Steps

## 1. Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

## 2. Login to Firebase
```bash
firebase login
```

## 3. Update `.firebaserc` 
Replace `your-firebase-project-id` with your actual Firebase project ID from Firebase Console.

## 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## 5. Build & Deploy Web App
```bash
npm run deploy
```

Your app will be live at: `https://your-project-id.web.app`

## What's Included

✅ `firebase.json` - Hosting configuration  
✅ `.firebaserc` - Project configuration  
✅ `firestore.rules` - Database security rules  
✅ `package.json` - Build and deploy scripts  
✅ `DEPLOYMENT.md` - Full deployment guide  

## Next Steps

1. **Create Firebase Project**: https://console.firebase.google.com/
2. **Enable Services**:
   - Authentication (Email, Anonymous)
   - Firestore Database
   - Hosting
3. **Update** `.firebaserc` with your project ID
4. **Run** `npm run deploy`
