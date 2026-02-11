import React, { createContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  User as FirebaseUser,
  PhoneAuthProvider,
  signInWithCredential,
  ApplicationVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { secureLog, isValidEmail, isValidUserState } from '../utils/security';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  firebaseUser: FirebaseUser | null;
  confirmationResult: ConfirmationResult | null;
  setUser: (user: User | null) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  loginAnonymously: () => Promise<void>;
  sendPhoneOTP: (phoneNumber: string, appVerifier?: ApplicationVerifier) => Promise<void>;
  verifyPhoneOTP: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearListeners: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sync or create user profile in Firestore
async function syncUserToFirestore(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  
  try {
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User exists, return existing data
      const data = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: data.email || firebaseUser.email || undefined,
        phone: data.phone || firebaseUser.phoneNumber || undefined,
        name: data.name || firebaseUser.displayName || undefined,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      };
    } else {
      // New user, create profile
      const newUserData = {
        email: firebaseUser.email || null,
        phone: firebaseUser.phoneNumber || null,
        name: firebaseUser.displayName || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userRef, newUserData);
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        phone: firebaseUser.phoneNumber || undefined,
        name: firebaseUser.displayName || undefined,
        createdAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    secureLog.warn('Failed to sync user to Firestore');
    // Return basic user data even if Firestore fails
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      phone: firebaseUser.phoneNumber || undefined,
      name: firebaseUser.displayName || undefined,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Track all active listeners for cleanup
  const userProfileUnsubRef = useRef<Unsubscribe | null>(null);
  const authUnsubRef = useRef<Unsubscribe | null>(null);

  // Clear all Firestore listeners
  const clearListeners = useCallback(() => {
    userProfileUnsubRef.current?.();
    userProfileUnsubRef.current = null;
  }, []);

  // Listen to user profile changes in Firestore
  const listenToUserProfile = useCallback((uid: string) => {
    // Clear previous listener
    userProfileUnsubRef.current?.();
    
    const userRef = doc(db, 'users', uid);
    const unsub = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser((prev) => ({
            ...prev,
            id: uid,
            email: data.email || prev?.email,
            phone: data.phone || prev?.phone,
            name: data.name || prev?.name,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() || prev?.createdAt || new Date().toISOString(),
          }));
        }
      },
      (error) => {
        secureLog.warn('User profile listener error');
      }
    );
    
    userProfileUnsubRef.current = unsub;
  }, []);

  // Listen to Firebase Auth state changes with timeout protection
  useEffect(() => {
    let isSubscribed = true;
    
    // Timeout to prevent infinite loading if Firebase is unreachable
    const timeoutId = setTimeout(() => {
      if (isSubscribed && isLoading) {
        secureLog.warn('Auth state timeout - setting loading to false');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!isSubscribed) return;
        
        clearTimeout(timeoutId);
        setFirebaseUser(firebaseUser);

        if (firebaseUser) {
          try {
            // Sync user to Firestore and get profile
            const appUser = await syncUserToFirestore(firebaseUser);
            if (isSubscribed) {
              setUser(appUser);
              // Start real-time listener for user profile updates
              listenToUserProfile(firebaseUser.uid);
            }
          } catch (error) {
            secureLog.error('Error syncing user', error);
            // Fallback to basic user data
            if (isSubscribed) {
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || undefined,
                phone: firebaseUser.phoneNumber || undefined,
                name: firebaseUser.displayName || undefined,
                createdAt: new Date().toISOString(),
              });
            }
          }
        } else {
          clearListeners();
          if (isSubscribed) {
            setUser(null);
          }
        }

        if (isSubscribed) {
          setIsLoading(false);
        }
      },
      (error) => {
        secureLog.error('Auth state error', error);
        clearTimeout(timeoutId);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    );

    authUnsubRef.current = unsubscribe;

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      unsubscribe();
      clearListeners();
    };
  }, [clearListeners, listenToUserProfile]);

  // Login with email/password
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Security: Validate email format
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle the rest
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Sign up with email/password
  const signUpWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      // Security: Validate email format
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile with name
      if (name && typeof name === 'string' && name.length > 0 && name.length <= 100) {
        const userRef = doc(db, 'users', credential.user.uid);
        await setDoc(userRef, {
          email,
          name,
          phone: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      // Auth state listener will handle the rest
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Login anonymously (for demo/testing)
  const loginAnonymously = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      // Auth state listener will handle the rest
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Send phone OTP (requires reCAPTCHA verifier on web)
  const sendPhoneOTP = useCallback(async (phoneNumber: string, appVerifier?: ApplicationVerifier) => {
    try {
      if (!appVerifier) {
        const error = new Error('Phone auth requires reCAPTCHA verifier. RecaptchaVerifier must be initialized before calling sendPhoneOTP.');
        (error as any).code = 'auth/recaptcha-not-initialized';
        throw error;
      }
      
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(phoneNumber, appVerifier);
      
      if (!verificationId) {
        const error = new Error('Failed to obtain verification ID from Firebase');
        (error as any).code = 'auth/missing-verification-id';
        throw error;
      }
      
      // Store verification ID for later use
      setConfirmationResult({
        verificationId,
        confirm: async (code: string) => {
          const credential = PhoneAuthProvider.credential(verificationId, code);
          return signInWithCredential(auth, credential);
        },
      } as ConfirmationResult);
    } catch (error: any) {
      secureLog.error('Send OTP error', error);
      throw error;
    }
  }, []);

  // Verify phone OTP
  const verifyPhoneOTP = useCallback(async (code: string) => {
    if (!confirmationResult) {
      const error = new Error('No pending verification. Please request OTP first.');
      (error as any).code = 'auth/missing-verification-id';
      throw error;
    }
    
    if (!code || code.length < 6) {
      const error = new Error('Invalid verification code format');
      (error as any).code = 'auth/invalid-verification-code';
      throw error;
    }
    
    setIsLoading(true);
    try {
      await confirmationResult.confirm(code);
      setConfirmationResult(null);
      // Auth state listener will handle the rest
    } catch (error: any) {
      setIsLoading(false);
      secureLog.error('Verify OTP error', error);
      throw error;
    }
  }, [confirmationResult]);

  // Logout - clear all state and listeners
  const logout = useCallback(async () => {
    try {
      // Clear listeners BEFORE signing out
      clearListeners();
      
      await signOut(auth);
      
      // Clear all local state
      setUser(null);
      setFirebaseUser(null);
      setConfirmationResult(null);
    } catch (error) {
      secureLog.error('Logout error', error);
      throw error;
    }
  }, [clearListeners]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        confirmationResult,
        setUser,
        loginWithEmail,
        signUpWithEmail,
        loginAnonymously,
        sendPhoneOTP,
        verifyPhoneOTP,
        logout,
        clearListeners,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
