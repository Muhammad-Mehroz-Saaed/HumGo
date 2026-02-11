import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

// Screens that don't require authentication (including index which shows splash)
const PUBLIC_SCREENS = ['index', 'login', 'otp-verification', 'email-verification'];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  
  // Prevent double navigation
  const hasNavigatedRef = useRef(false);

  // Auth guard: redirect based on authentication state
  useEffect(() => {
    // Wait for auth state to resolve
    if (isLoading) {
      hasNavigatedRef.current = false;
      return;
    }

    // Prevent navigation if already navigated for this auth state
    if (hasNavigatedRef.current) return;

    const currentScreen = (segments[segments.length - 1] || 'index') as string;
    const isOnLoginFlow = ['login', 'otp-verification'].includes(currentScreen);
    const isOnSplash = currentScreen === 'index';

    if (!user) {
      // User is not authenticated
      if (!isOnLoginFlow && !isOnSplash) {
        // On protected screen, redirect to login
        hasNavigatedRef.current = true;
        router.replace('/(tabs)/login');
      } else if (isOnSplash) {
        // On splash, redirect to login
        hasNavigatedRef.current = true;
        router.replace('/(tabs)/login');
      }
    } else {
      // User is authenticated
      if (isOnLoginFlow || isOnSplash) {
        // On login flow or splash, redirect to home
        hasNavigatedRef.current = true;
        router.replace('/(tabs)/home');
      }
    }
  }, [user, isLoading, segments, router]);

  // Reset navigation flag when user changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [user]);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Book Ride',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="mappin.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null, // Hide from tab bar
          title: 'Login',
        }}
      />
      <Tabs.Screen
        name="otp-verification"
        options={{
          href: null, // Hide from tab bar
          title: 'OTP Verification',
        }}
      />
      <Tabs.Screen
        name="email-verification"
        options={{
          href: null, // Hide from tab bar
          title: 'Email Verification',
        }}
      />
      <Tabs.Screen
        name="ride-confirmation"
        options={{
          href: null, // Hide from tab bar
          title: 'Ride Confirmation',
        }}
      />
      <Tabs.Screen
        name="active-ride"
        options={{
          href: null, // Hide from tab bar
          title: 'Active Ride',
        }}
      />
      <Tabs.Screen
        name="match-list"
        options={{
          href: null, // Hide from tab bar
          title: 'Matches',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Hide from tab bar
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
