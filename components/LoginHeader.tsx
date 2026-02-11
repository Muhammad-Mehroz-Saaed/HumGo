import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginHeader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <View style={styles.logoWrapper}>
        <View style={[styles.logoContainer, { backgroundColor: 'rgba(19, 236, 48, 0.2)' }]}>
          <MaterialIcons name="local-taxi" size={40} color="#13ec30" />
        </View>
      </View>

      {/* Welcome Text */}
      <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111812' }]}>
        Welcome to Humgo
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
        Join Pakistan's favorite ride-sharing community
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
});
