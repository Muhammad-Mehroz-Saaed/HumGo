import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Dimensions } from '@/constants/theme';

/**
 * Splash/Index Screen
 * 
 * This screen only shows loading UI. Navigation is handled by the auth guard
 * in _layout.tsx to prevent race conditions and double navigation.
 */
export default function SplashScreen() {
  // Always show splash UI - auth guard in _layout.tsx handles navigation
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="directions-car" size={48} color={Colors.textInverse} />
        </View>
        <Text style={styles.appName}>Humgo</Text>
        <Text style={styles.tagline}>Go together. Pay less.</Text>
        <ActivityIndicator 
          size="small" 
          color={Colors.primary} 
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: Dimensions.logoSize,
    height: Dimensions.logoSize,
    borderRadius: Dimensions.logoSize / 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing['4xl'],
  },
  loader: {
    marginTop: Spacing.lg,
  },
});

