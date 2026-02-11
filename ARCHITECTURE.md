# Humgo MVP - Architecture & Implementation Guide

## ✅ Project Overview

Humgo is a **ride-sharing and fare-splitting app** similar to inDrive. The MVP implements the complete user flow from authentication through ride booking and matching.

---

## 📁 Project Structure

```
humgo/
├── app/
│   ├── _layout.tsx                 # Root layout with context providers
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Tab navigation
│   │   ├── index.tsx               # Splash screen (entry point)
│   │   ├── login.tsx               # Email/Phone login
│   │   ├── otp-verification.tsx    # OTP verification
│   │   ├── email-verification.tsx  # Email verification
│   │   ├── home.tsx                # Ride booking with map
│   │   ├── ride-confirmation.tsx   # Confirmation screen
│   │   ├── active-ride.tsx         # Active ride tracking
│   │   └── profile.tsx             # User profile & settings
│   └── modal.tsx
│
├── components/
│   ├── MapViewWrapper.tsx          # Full-screen map
│   ├── PickupDropInput.tsx         # Location inputs
│   ├── VehicleTypeSelector.tsx     # Vehicle selection
│   ├── RideRequestPanel.tsx        # Bottom sheet panel
│   ├── CurrentLocationButton.tsx   # Floating location button
│   ├── LoginHeader.tsx
│   ├── LoginInput.tsx
│   ├── LoginDivider.tsx
│   ├── LoginAction.tsx
│   ├── LoginSocial.tsx
│   ├── LoginFooter.tsx
│   ├── SplashLogo.tsx
│   ├── SplashFooter.tsx
│   ├── SplashBackground.tsx
│   ├── VerificationHeader.tsx
│   ├── VerificationInput.tsx
│   ├── VerificationAction.tsx
│   └── ResendCodeButton.tsx
│
├── context/
│   ├── AuthContext.tsx             # Authentication state
│   └── RideContext.tsx             # Ride/trip state
│
└── constants/, hooks/, etc.
```

---

## 🔄 Complete User Flow

### 1. **Splash Screen** (index.tsx)
- Displays logo & tagline
- Auto-navigates after 2.5 seconds
- Checks authentication status
- Routes to `Login` (not authenticated) or `Home` (authenticated)

### 2. **Login** (login.tsx)
- Two input options: Email OR Phone
- User selects preferred method
- Navigates to verification screen with email/phone as route param

### 3. **Verification** (otp-verification.tsx / email-verification.tsx)
- OTP: 4-6 digit code from SMS
- Email: 4-6 digit code from email
- On success: creates user, saves to localStorage
- Auto-navigates to Home screen

### 4. **Home / Ride Booking** (home.tsx)
- Full-screen Google Maps (native) or placeholder (web)
- User location marker (green)
- Pickup/Dropoff inputs
- Vehicle type selector (Bike, Rickshaw, Car, SUV)
- Floating "current location" button
- Confirm Ride button
- On confirm: navigates to Ride Confirmation screen

### 5. **Ride Confirmation** (ride-confirmation.tsx)
- Displays: ✅ "Your Ride is Booked!"
- Shows pickup, dropoff, vehicle, estimated price
- Disclaimer about app responsibility
- Continue button navigates to Active Ride screen

### 6. **Active Ride** (active-ride.tsx)
- Shows trip details
- Status badge: "Looking for a ride..."
- Placeholder for driver info
- Back to Home button

### 7. **Profile** (profile.tsx)
- User info display
- App info & disclaimer
- Settings (Privacy, Terms, Version)
- Logout button

---

## 🛠️ Context Management

### **AuthContext** (context/AuthContext.tsx)
Manages global authentication state:
```typescript
interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  createdAt: string;
}

// Usage
const { user, isLoading, setUser, logout } = useAuth();
```

**Key Features:**
- Checks localStorage for saved user on app start
- `isLoading` state while checking auth
- `setUser()` saves user data
- `logout()` clears user from context and storage

### **RideContext** (context/RideContext.tsx)
Manages ride/trip state:
```typescript
interface Trip {
  id: string;
  userId: string;
  pickup: { latitude, longitude, address }
  dropoff: { latitude, longitude, address }
  vehicleType: string;
  estimatedPrice: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

// Usage
const { currentTrip, activeTrips, setCurrentTrip, addTrip, updateTripStatus } = useRide();
```

---

## 🗺️ Key Components

### **MapViewWrapper.tsx**
- Native platforms: Google Maps with user/pickup/dropoff markers
- Web: Friendly fallback message ("Maps available on mobile only")
- Tap map to set pickup/dropoff locations

### **RideRequestPanel.tsx**
- Bottom sheet with:
  - Pickup/Dropoff inputs (PickupDropInput)
  - Vehicle type selector (VehicleTypeSelector)
  - Confirm button (disabled until both locations filled)
  - Drag handle for visual UX

### **VehicleTypeSelector.tsx**
- Horizontal scroll of vehicle types
- Shows: Icon, name, price estimate, seat count
- Selected vehicle highlighted in green

---

## 🔐 Authentication Flow

1. **Login Screen**: User enters email OR phone
2. **Verification**: User receives code, enters 4-6 digits
3. **On Success**:
   - Creates user object with `id`, `email/phone`, `createdAt`
   - Saves to `localStorage.setItem('humgo_user', JSON.stringify(user))`
   - AuthContext updates with new user
   - Auto-navigates to Home

4. **Logout**: Clears localStorage and context, returns to Login

---

## 🚗 Ride Booking Flow

1. **Home Screen**: User enters pickup & dropoff
2. **Select Vehicle**: Bike, Rickshaw, Car, or SUV
3. **Confirm Ride**: Creates Trip object with:
   - Random ID
   - User's ID from context
   - Pickup/Dropoff coordinates
   - Vehicle type & estimated price
   - Status: "pending"
4. **Confirmation Screen**: Shows "Your Ride is Booked!"
5. **Active Ride**: Shows trip details, waiting for match

---

## 📱 Navigation Structure

```
Splash (index.tsx)
├─ If authenticated → Home (home.tsx)
└─ If not authenticated → Login (login.tsx)
   ├─ OTP Verification (otp-verification.tsx) → Home
   └─ Email Verification (email-verification.tsx) → Home

Home (home.tsx)
├─ Book Ride → Ride Confirmation (ride-confirmation.tsx)
│   └─ Continue → Active Ride (active-ride.tsx)
│       └─ Back to Home
├─ Profile Tab → Profile (profile.tsx)
│   └─ Logout → Login

Tab Bar Navigation:
├─ Home (Splash screen - index.tsx)
├─ Book Ride (home.tsx)
├─ Profile (profile.tsx)
└─ Explore (explore.tsx)
```

---

## 💾 State Persistence

- **User Data**: Saved to localStorage as JSON
- **Trip Data**: Saved to RideContext (in-memory during session)
- **On App Restart**: AuthContext checks localStorage, restores user

---

## 🎨 UI/UX Improvements

✅ Dark/Light mode support throughout
✅ Keyboard-aware layouts
✅ Floating buttons with shadows
✅ Bottom sheet animations
✅ Proper spacing & alignment
✅ Accessible color contrasts
✅ Loading states on buttons

---

## 🔗 Firebase Integration Points

Ready for backend connection at:

1. **Login**: `firebase.auth().signInWithPhoneNumber()` or `.signInWithEmailAndPassword()`
2. **OTP Verification**: `firebase.auth().confirmationResult.confirm()`
3. **Trip Creation**: `firestore.collection('trips').add(trip)`
4. **Trip Matching**: Query nearby trips: `firestore.collection('trips').where('status', '==', 'pending').where(...)`
5. **Notifications**: FCM setup for new matches
6. **Logout**: `firebase.auth().signOut()`

---

## 📝 TODO: Backend Implementation

- [ ] Firebase Authentication setup
- [ ] Firestore trips collection
- [ ] Trip matching algorithm
- [ ] Real-time message chat (Firestore)
- [ ] Push notifications (FCM)
- [ ] Driver profile & ratings
- [ ] Payment integration
- [ ] Ride history

---

## ✨ MVP Features Completed

✅ Splash screen with auto-navigation
✅ Email & Phone login
✅ OTP & Email verification
✅ Ride booking with map
✅ Vehicle selection with pricing
✅ Ride confirmation flow
✅ Active ride tracking
✅ User profile & logout
✅ Dark/Light mode
✅ Context-based state management
✅ Responsive mobile UI

---

## 🚀 Next Steps

1. **Connect Firebase**
   - Set up Firebase project
   - Enable Auth (Phone + Email)
   - Create Firestore database

2. **Implement Trip Matching**
   - Query nearby trips
   - Calculate distance
   - Show match list

3. **Add Real-time Chat**
   - Firestore messages collection
   - Realtime listeners
   - Chat screen UI

4. **Push Notifications**
   - FCM setup
   - New match notifications
   - Driver accept notifications

5. **Testing & Deployment**
   - Test auth flow
   - Test ride booking
   - iOS & Android builds
   - App Store deployment

---

## 📞 Support & Debugging

- Check `/home` tab for active rides
- Use Profile tab to logout and test auth
- Browser console for web debugging
- Expo Go logs for mobile debugging

---

**Version**: 1.0.0 MVP
**Last Updated**: January 22, 2026
