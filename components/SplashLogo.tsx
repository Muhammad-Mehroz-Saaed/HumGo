import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SplashLogo() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Icon Container with Glow */}
      <View style={styles.iconWrapper}>
        {/* Glow Effect - Multiple layers for better effect */}
        <View style={[styles.glow, styles.glowOuter]} />
        <View style={[styles.glow, styles.glowInner]} />
        
        {/* Icon Container */}
        <View 
          style={[
            styles.iconContainer,
            { 
              backgroundColor: isDark ? '#102213' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
            },
            Platform.OS === 'ios' && styles.iosShadow,
            Platform.OS === 'android' && styles.androidShadow,
          ]}
        >
          <MaterialIcons 
            name="merge" 
            size={80} 
            color="#13ec30"
          />
        </View>
      </View>

      {/* App Name */}
      <View style={styles.textContainer}>
        <Text 
          style={[
            styles.appName,
            { color: isDark ? '#ffffff' : '#111812' }
          ]}
        >
          Humgo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowOuter: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(19, 236, 48, 0.15)',
    transform: [{ scale: 1.1 }],
  },
  glowInner: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(19, 236, 48, 0.25)',
  },
  iconContainer: {
    position: 'relative',
    zIndex: 10,
    width: 112,
    height: 112,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  androidShadow: {
    elevation: 2,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 48,
  },
});
