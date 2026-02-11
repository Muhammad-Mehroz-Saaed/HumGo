// ═══════════════════════════════════════════════════════════════════════════
// SECURITY UTILITIES
// Production-safe helpers for input validation, sanitization, and rate limiting
// ═══════════════════════════════════════════════════════════════════════════

import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/** Check if running in development mode */
export const isDev = __DEV__ === true;

/** Check if running in production mode */
export const isProd = !isDev;

// ─────────────────────────────────────────────────────────────────────────────
// SECURE LOGGING
// Only logs in development, prevents sensitive data leaks in production
// ─────────────────────────────────────────────────────────────────────────────

export const secureLog = {
  /** Log info (dev only) */
  info: (message: string, ...args: any[]) => {
    if (isDev) console.log(`[INFO] ${message}`, ...args);
  },
  /** Log warning (dev only) */
  warn: (message: string, ...args: any[]) => {
    if (isDev) console.warn(`[WARN] ${message}`, ...args);
  },
  /** Log error - sanitized for production */
  error: (message: string, error?: any) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In production, log only safe error codes, never full stack traces
      const safeCode = error?.code || 'unknown';
      console.error(`[ERROR] ${message} (code: ${safeCode})`);
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/** Validate email format */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/** Validate phone number format (Pakistani format) */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  // Pakistani numbers: 10-12 digits
  return cleaned.length >= 10 && cleaned.length <= 12;
}

/** Validate OTP code format */
export function isValidOTP(code: string, length: number = 6): boolean {
  if (!code || typeof code !== 'string') return false;
  return /^\d+$/.test(code) && code.length === length;
}

/** Validate coordinate values */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/** Validate trip price is within reasonable range */
export function isValidPrice(price: number): boolean {
  const MIN_PRICE = 10;
  const MAX_PRICE = 50000;
  return typeof price === 'number' && !isNaN(price) && price >= MIN_PRICE && price <= MAX_PRICE;
}

/** Validate message text */
export function isValidMessage(text: string): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Message cannot be empty' };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (trimmed.length > 5000) {
    return { valid: false, error: 'Message too long (max 5000 characters)' };
  }
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SANITIZATION
// ─────────────────────────────────────────────────────────────────────────────

/** Sanitize text input to prevent injection */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

/** Sanitize user ID to prevent path traversal */
export function sanitizeUserId(userId: string): string {
  if (!userId || typeof userId !== 'string') return '';
  // Only allow alphanumeric and limited special chars
  return userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
}

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITING (Client-side throttle)
// ─────────────────────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, number>();

/** 
 * Check if action is rate limited
 * @returns true if action should be blocked
 */
export function isRateLimited(key: string, cooldownMs: number = 1000): boolean {
  const now = Date.now();
  const lastAction = rateLimitMap.get(key) || 0;
  
  if (now - lastAction < cooldownMs) {
    return true;
  }
  
  rateLimitMap.set(key, now);
  return false;
}

/** Reset rate limit for a specific key */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTANCE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;
const MAX_RIDE_DISTANCE_KM = 200; // Maximum reasonable ride distance
const MIN_RIDE_DISTANCE_KM = 0.1; // Minimum 100 meters

/** Calculate distance between two coordinates using Haversine formula */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/** Validate ride distance is within reasonable bounds */
export function isValidRideDistance(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
): { valid: boolean; distance: number; error?: string } {
  if (!isValidCoordinate(pickupLat, pickupLng) || !isValidCoordinate(dropLat, dropLng)) {
    return { valid: false, distance: 0, error: 'Invalid coordinates' };
  }

  const distance = calculateDistanceKm(pickupLat, pickupLng, dropLat, dropLng);

  if (distance < MIN_RIDE_DISTANCE_KM) {
    return { valid: false, distance, error: 'Pickup and drop-off are too close' };
  }

  if (distance > MAX_RIDE_DISTANCE_KM) {
    return { valid: false, distance, error: 'Distance exceeds maximum limit' };
  }

  return { valid: true, distance };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH STATE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/** Check if user object is valid and not stale */
export function isValidUserState(user: any): boolean {
  return (
    user !== null &&
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    user.id.length > 0
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IDEMPOTENCY KEYS
// ─────────────────────────────────────────────────────────────────────────────

const processedOperations = new Set<string>();
const OPERATION_EXPIRY_MS = 60000; // 1 minute

/** Generate idempotency key for an operation */
export function generateIdempotencyKey(operation: string, ...args: string[]): string {
  return `${operation}:${args.join(':')}:${Math.floor(Date.now() / OPERATION_EXPIRY_MS)}`;
}

/** Check if operation was already processed (prevents duplicate submissions) */
export function isOperationProcessed(key: string): boolean {
  if (processedOperations.has(key)) {
    return true;
  }
  processedOperations.add(key);
  // Cleanup old keys periodically
  if (processedOperations.size > 100) {
    processedOperations.clear();
  }
  return false;
}
