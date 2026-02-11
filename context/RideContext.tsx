import React, { createContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  doc,
  FirestoreError,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  secureLog,
  isValidCoordinate,
  isValidPrice,
  isValidMessage,
  sanitizeText,
  sanitizeUserId,
  isRateLimited,
  isValidRideDistance,
  isOperationProcessed,
  generateIdempotencyKey,
} from '../utils/security';

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

// Valid vehicle types (whitelist)
const VALID_VEHICLE_TYPES = ['bike', 'rickshaw', 'car', 'suv'] as const;
type VehicleType = typeof VALID_VEHICLE_TYPES[number];

export interface Trip {
  id: string;
  userId: string;
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoff: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicleType: string;
  estimatedPrice: number;
  status: 'pending' | 'active' | 'matched' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface Match {
  id: string;
  tripA: string;          // Owner's trip ID
  tripB: string;          // Matched trip ID
  tripId: string;         // For backward compatibility
  riders: number;
  etaMinutes: number;
  distanceKm: number;
  pickupAddress: string;
  dropoffAddress: string;
  status: 'pending' | 'matched' | 'chatting';
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  tripId?: string;
  senderId: string;
  text: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// SECURITY VALIDATION FUNCTIONS
// ─────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;
const DEFAULT_MATCH_RADIUS_KM = 10;
const MAX_MATCH_RADIUS_KM = 50;
const MAX_MESSAGE_LENGTH = 5000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Validate trip data structure (security check)
 */
function isValidTrip(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Validate userId
  if (typeof data.userId !== 'string' || data.userId.length === 0) return false;
  
  // Validate coordinates
  if (!isValidCoordinate(data.pickup?.latitude, data.pickup?.longitude)) return false;
  if (!isValidCoordinate(data.dropoff?.latitude, data.dropoff?.longitude)) return false;
  
  // Validate vehicle type (whitelist)
  if (data.vehicleType && !VALID_VEHICLE_TYPES.includes(data.vehicleType)) return false;
  
  return true;
}

/**
 * Validate vehicle type against whitelist
 */
function isValidVehicleType(type: string): type is VehicleType {
  return VALID_VEHICLE_TYPES.includes(type as VehicleType);
}

// ─────────────────────────────────────────────────────────────
// CONTEXT DEFINITION
// ─────────────────────────────────────────────────────────────

interface RideContextType {
  currentTrip: Trip | null;
  activeTrips: Trip[];
  matches: Match[];
  messages: Message[];
  isTripLoading: boolean;
  matchesLoading: boolean;
  messagesLoading: boolean;
  setCurrentTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => Promise<void>;
  updateTripStatus: (tripId: string, status: Trip['status']) => Promise<void>;
  cancelTrip: (tripId: string) => Promise<void>;
  generateMatches: (trip: Trip, radiusKm?: number) => void;
  addMessage: (matchId: string, senderId: string, text: string) => Promise<void>;
  listenToMessages: (matchId: string) => () => void;
  listenToUserActiveTrip: (userId: string) => () => void;
  clearAllListeners: () => void;
}

export const RideContext = createContext<RideContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// PROVIDER COMPONENT
// ─────────────────────────────────────────────────────────────

export function RideProvider({ children }: { children: ReactNode }) {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTripLoading, setIsTripLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Listener refs for proper cleanup
  const matchesUnsubRef = useRef<Unsubscribe | null>(null);
  const messagesUnsubRef = useRef<Unsubscribe | null>(null);
  const tripUnsubRef = useRef<Unsubscribe | null>(null);
  
  // Track current user to prevent stale listener issues
  const currentUserIdRef = useRef<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // LISTENER MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * Clear all active Firestore listeners
   * Call this on logout or when switching users
   */
  const clearAllListeners = useCallback(() => {
    matchesUnsubRef.current?.();
    matchesUnsubRef.current = null;
    
    messagesUnsubRef.current?.();
    messagesUnsubRef.current = null;
    
    tripUnsubRef.current?.();
    tripUnsubRef.current = null;
    
    // Reset state
    setCurrentTrip(null);
    setActiveTrips([]);
    setMatches([]);
    setMessages([]);
    currentUserIdRef.current = null;
  }, []);

  // ─────────────────────────────────────────────────────────────
  // TRIP MANAGEMENT (Security Hardened)
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a new trip and persist to Firestore
   * Security: Validates all inputs, enforces ownership, rate limits
   */
  const addTrip = useCallback(async (trip: Trip): Promise<void> => {
    // Security: Validate userId
    const sanitizedUserId = sanitizeUserId(trip.userId);
    if (!sanitizedUserId) {
      throw new Error('Invalid user ID');
    }

    // Security: Rate limit trip creation (1 per 5 seconds)
    if (isRateLimited(`trip_create_${sanitizedUserId}`, 5000)) {
      throw new Error('Please wait before creating another trip');
    }

    // Security: Validate coordinates
    if (!isValidCoordinate(trip.pickup?.latitude, trip.pickup?.longitude)) {
      throw new Error('Invalid pickup coordinates');
    }
    if (!isValidCoordinate(trip.dropoff?.latitude, trip.dropoff?.longitude)) {
      throw new Error('Invalid drop-off coordinates');
    }

    // Security: Validate ride distance
    const distanceCheck = isValidRideDistance(
      trip.pickup.latitude,
      trip.pickup.longitude,
      trip.dropoff.latitude,
      trip.dropoff.longitude
    );
    if (!distanceCheck.valid) {
      throw new Error(distanceCheck.error || 'Invalid ride distance');
    }

    // Security: Validate vehicle type (whitelist)
    if (!isValidVehicleType(trip.vehicleType)) {
      throw new Error('Invalid vehicle type');
    }

    // Security: Validate price range
    if (!isValidPrice(trip.estimatedPrice)) {
      throw new Error('Invalid price');
    }

    // Security: Idempotency check (prevent duplicate submissions)
    const idempotencyKey = generateIdempotencyKey('create_trip', sanitizedUserId, trip.id);
    if (isOperationProcessed(idempotencyKey)) {
      secureLog.warn('Duplicate trip creation attempt blocked');
      return;
    }

    try {
      // Cancel any existing active/pending trips for this user
      const tripsRef = collection(db, 'trips');
      const existingTripsQuery = query(
        tripsRef,
        where('userId', '==', sanitizedUserId),
        where('status', 'in', ['pending', 'active'])
      );
      
      const existingTrips = await getDocs(existingTripsQuery);
      
      if (!existingTrips.empty) {
        const batch = writeBatch(db);
        existingTrips.forEach((docSnap) => {
          batch.update(docSnap.ref, { 
            status: 'cancelled',
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // Create new trip document with sanitized data
      const tripRef = doc(db, 'trips', trip.id);
      await setDoc(tripRef, {
        userId: sanitizedUserId,
        pickup: {
          latitude: trip.pickup.latitude,
          longitude: trip.pickup.longitude,
          address: sanitizeText(trip.pickup.address || '', 500),
        },
        dropoff: {
          latitude: trip.dropoff.latitude,
          longitude: trip.dropoff.longitude,
          address: sanitizeText(trip.dropoff.address || '', 500),
        },
        vehicleType: trip.vehicleType,
        estimatedPrice: trip.estimatedPrice,
        status: 'pending', // Always start as pending
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setActiveTrips((prev) => [...prev.filter((t) => t.id !== trip.id), trip]);
      setCurrentTrip(trip);
    } catch (error) {
      secureLog.error('Failed to create trip', error);
      throw error;
    }
  }, []);

  /**
   * Update trip status in Firestore
   * Security: Validates status transitions
   */
  const updateTripStatus = useCallback(async (tripId: string, status: Trip['status']): Promise<void> => {
    // Security: Validate tripId format
    if (!tripId || typeof tripId !== 'string' || tripId.length > 128) {
      throw new Error('Invalid trip ID');
    }

    // Security: Validate status is a valid value
    const validStatuses: Trip['status'][] = ['pending', 'active', 'matched', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, { 
        status,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setActiveTrips((prev) =>
        prev.map((trip) => (trip.id === tripId ? { ...trip, status } : trip))
      );
      
      if (currentTrip?.id === tripId) {
        setCurrentTrip((prev) => prev ? { ...prev, status } : null);
      }

      // If trip is completed/cancelled, clean up matches
      if (status === 'completed' || status === 'cancelled') {
        await cleanupMatchesForTrip(tripId);
      }
    } catch (error) {
      secureLog.error('Failed to update trip status', error);
      throw error;
    }
  }, [currentTrip]);

  /**
   * Cancel a trip and clean up associated matches
   */
  const cancelTrip = useCallback(async (tripId: string): Promise<void> => {
    await updateTripStatus(tripId, 'cancelled');
    
    // Clear matches if current trip was cancelled
    if (currentTrip?.id === tripId) {
      matchesUnsubRef.current?.();
      matchesUnsubRef.current = null;
      setMatches([]);
      setCurrentTrip(null);
    }
  }, [currentTrip, updateTripStatus]);

  /**
   * Remove stale matches when trip is completed/cancelled
   */
  const cleanupMatchesForTrip = async (tripId: string): Promise<void> => {
    try {
      const matchesRef = collection(db, 'matches');
      const matchQuery = query(
        matchesRef,
        where('tripA', '==', tripId)
      );
      
      const matchDocs = await getDocs(matchQuery);
      
      if (!matchDocs.empty) {
        const batch = writeBatch(db);
        matchDocs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      secureLog.warn('Failed to cleanup matches');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TRIP LISTENER (Security Hardened)
  // ─────────────────────────────────────────────────────────────

  /**
   * Real-time listener for user's active/pending trip
   * Security: Validates userId before creating listener
   */
  const listenToUserActiveTrip = useCallback((userId: string): (() => void) => {
    // Security: Validate and sanitize userId
    const sanitizedUserId = sanitizeUserId(userId);
    if (!sanitizedUserId) {
      secureLog.warn('Invalid userId for trip listener');
      return () => {};
    }
    // Prevent duplicate listeners
    if (currentUserIdRef.current === sanitizedUserId && tripUnsubRef.current) {
      return tripUnsubRef.current;
    }
    
    // Clean up previous listener
    tripUnsubRef.current?.();
    currentUserIdRef.current = sanitizedUserId;
    setIsTripLoading(true);

    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef,
      where('userId', '==', sanitizedUserId),
      where('status', 'in', ['pending', 'active', 'matched']),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docSnap = snapshot.docs[0];
        
        if (!docSnap) {
          setCurrentTrip(null);
          setIsTripLoading(false);
          return;
        }
        
        const data = docSnap.data();
        
        if (!isValidTrip(data)) {
          secureLog.warn('Invalid trip data received');
          setCurrentTrip(null);
          setIsTripLoading(false);
          return;
        }

        const trip: Trip = {
          id: docSnap.id,
          userId: data.userId,
          pickup: data.pickup,
          dropoff: data.dropoff,
          vehicleType: data.vehicleType,
          estimatedPrice: data.estimatedPrice,
          status: data.status,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.(),
        };
        
        setCurrentTrip(trip);
        setIsTripLoading(false);
      },
      (error: FirestoreError) => {
        secureLog.error('Active trip listener error', error);
        setIsTripLoading(false);
      }
    );

    tripUnsubRef.current = unsub;
    return unsub;
  }, []);

  // ─────────────────────────────────────────────────────────────
  // MATCHING ENGINE (Security Hardened)
  // ─────────────────────────────────────────────────────────────

  /**
   * Real-time listener for nearby trip matches
   * Security: Prevents self-matching, validates coordinates, rate limits
   */
  const attachMatchListener = useCallback((trip: Trip, radiusKm: number = DEFAULT_MATCH_RADIUS_KM) => {
    // Security: Validate input trip
    if (!isValidTrip(trip) || !trip.id || !trip.userId) {
      secureLog.warn('Invalid trip for match listener');
      setMatches([]);
      setMatchesLoading(false);
      return;
    }

    // Security: Clamp radius to max allowed
    const clampedRadius = Math.min(Math.max(radiusKm || DEFAULT_MATCH_RADIUS_KM, 1), MAX_MATCH_RADIUS_KM);

    matchesUnsubRef.current?.();
    setMatchesLoading(true);

    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef,
      where('status', 'in', ['pending', 'active']),
      orderBy('createdAt', 'desc'),
      limit(50) // Get more candidates, then filter client-side
    );

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        const candidateMatches: Match[] = [];
        const seenMatchIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // Security: Skip invalid data
          if (!isValidTrip(data)) return;
          
          // Security: Skip own trip (prevents self-matching)
          if (docSnap.id === trip.id) return;
          
          // Security: Skip own user's trips (prevents self-matching)
          if (data.userId === trip.userId) return;
          
          // Security: Prevent duplicate matches
          const matchKey = [trip.id, docSnap.id].sort().join('-');
          if (seenMatchIds.has(matchKey)) return;
          seenMatchIds.add(matchKey);

          // Security: Validate coordinates before calculation
          if (!isValidCoordinate(data.pickup?.latitude, data.pickup?.longitude)) return;
          if (!isValidCoordinate(data.dropoff?.latitude, data.dropoff?.longitude)) return;

          // Calculate proximity
          const pickupDistance = haversineKm(
            trip.pickup.latitude,
            trip.pickup.longitude,
            data.pickup.latitude,
            data.pickup.longitude
          );
          
          const dropDistance = haversineKm(
            trip.dropoff.latitude,
            trip.dropoff.longitude,
            data.dropoff.latitude,
            data.dropoff.longitude
          );

          // Filter by radius (both pickup and dropoff must be within range)
          if (pickupDistance <= clampedRadius && dropDistance <= clampedRadius) {
            const distanceKm = Math.max(pickupDistance, dropDistance);
            
            candidateMatches.push({
              id: docSnap.id,
              tripA: trip.id,
              tripB: docSnap.id,
              tripId: docSnap.id, // Backward compatibility
              riders: data.riders || 1,
              etaMinutes: Math.max(3, Math.round(distanceKm * 2)),
              distanceKm: Math.round(distanceKm * 10) / 10,
              pickupAddress: sanitizeText(data.pickup.address || 'Pickup', 500),
              dropoffAddress: sanitizeText(data.dropoff.address || 'Drop-off', 500),
              status: 'pending',
              createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            });
          }
        });

        // Sort by distance (closest first) and limit to 10
        candidateMatches.sort((a, b) => a.distanceKm - b.distanceKm);
        const topMatches = candidateMatches.slice(0, 10);
        
        setMatches(topMatches);
        setMatchesLoading(false);

        // Persist matches to Firestore for the matched trip owners to see
        await persistMatches(trip.id, topMatches);
      },
      (error: FirestoreError) => {
        secureLog.error('Match listener error', error);
        setMatchesLoading(false);
      }
    );

    matchesUnsubRef.current = unsub;
  }, []);

  /**
   * Persist calculated matches to Firestore
   */
  const persistMatches = async (tripId: string, matches: Match[]): Promise<void> => {
    if (matches.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      const matchesRef = collection(db, 'matches');
      
      for (const match of matches) {
        // Security: Validate tripA and tripB are different
        if (match.tripA === match.tripB) {
          secureLog.warn('Skipping invalid match: tripA == tripB');
          continue;
        }
        
        const matchId = [match.tripA, match.tripB].sort().join('_');
        const matchDoc = doc(matchesRef, matchId);
        
        batch.set(matchDoc, {
          tripA: match.tripA,
          tripB: match.tripB,
          distanceKm: match.distanceKm,
          status: match.status,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      
      await batch.commit();
    } catch (error) {
      secureLog.warn('Failed to persist matches');
    }
  };

  /**
   * Public API: Start match generation for a trip
   * Security: Validates trip data before processing
   */
  const generateMatches = useCallback((trip: Trip, radiusKm?: number) => {
    if (!trip || !trip.id || !trip.userId || !isValidTrip(trip)) {
      secureLog.warn('Cannot generate matches: invalid trip');
      return;
    }
    
    setCurrentTrip(trip);
    attachMatchListener(trip, radiusKm);
  }, [attachMatchListener]);

  // ─────────────────────────────────────────────────────────────
  // MESSAGING (Security Hardened)
  // ─────────────────────────────────────────────────────────────

  /**
   * Real-time listener for messages in a match/trip chat
   * Security: Validates matchId format
   */
  const listenToMessages = useCallback((matchId: string): (() => void) => {
    // Security: Validate matchId is not empty
    if (!matchId || typeof matchId !== 'string' || matchId.length > 256) {
      secureLog.warn('Invalid matchId for message listener');
      setMessages([]);
      setMessagesLoading(false);
      return () => {};
    }

    messagesUnsubRef.current?.();
    setMessagesLoading(true);

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('matchId', '==', matchId),
      orderBy('createdAt', 'asc'),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const chatMessages: Message[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            matchId: data.matchId,
            tripId: data.tripId,
            senderId: data.senderId,
            text: sanitizeText(data.text || '', MAX_MESSAGE_LENGTH),
            createdAt:
              data.createdAt?.toDate?.()?.toISOString?.() ||
              data.createdAt ||
              new Date().toISOString(),
          };
        });
        
        setMessages(chatMessages);
        setMessagesLoading(false);
      },
      (error: FirestoreError) => {
        secureLog.error('Messages listener error', error);
        setMessagesLoading(false);
      }
    );

    messagesUnsubRef.current = unsub;
    return unsub;
  }, []);

  /**
   * Send a message to a chat
   * Security: Validates senderId, message content, rate limits
   */
  const addMessage = useCallback(async (matchId: string, senderId: string, text: string): Promise<void> => {
    // Security: Validate parameters
    if (!matchId || typeof matchId !== 'string' || matchId.length > 256) {
      throw new Error('Invalid matchId');
    }
    if (!senderId || typeof senderId !== 'string' || senderId.length > 128) {
      throw new Error('Invalid senderId');
    }

    // Security: Validate message content
    const messageValidation = isValidMessage(text);
    if (!messageValidation.valid) {
      throw new Error(messageValidation.error || 'Invalid message');
    }

    // Security: Rate limit messages (1 per second per user)
    if (isRateLimited(`msg_${senderId}`, 1000)) {
      throw new Error('Too many messages. Please wait a moment.');
    }

    const sanitizedText = sanitizeText(text, MAX_MESSAGE_LENGTH);

    // Optimistic update for instant UI feedback
    const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const localMessage: Message = {
      id: localId,
      matchId,
      tripId: currentTrip?.id,
      senderId,
      text: sanitizedText,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, localMessage]);

    try {
      await addDoc(collection(db, 'messages'), {
        matchId,
        tripId: currentTrip?.id || null,
        senderId,
        text: sanitizedText,
        createdAt: serverTimestamp(),
      });
      
      // The real message will come through the listener and replace the optimistic one
    } catch (error) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== localId));
      secureLog.error('Failed to send message', error);
      throw error;
    }
  }, [currentTrip]);

  // ─────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearAllListeners();
    };
  }, [clearAllListeners]);

  // ─────────────────────────────────────────────────────────────
  // PROVIDER RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <RideContext.Provider
      value={{
        currentTrip,
        activeTrips,
        matches,
        messages,
        isTripLoading,
        matchesLoading,
        messagesLoading,
        setCurrentTrip,
        addTrip,
        updateTripStatus,
        cancelTrip,
        generateMatches,
        addMessage,
        listenToMessages,
        listenToUserActiveTrip,
        clearAllListeners,
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

export function useRide(): RideContextType {
  const context = React.useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
}
