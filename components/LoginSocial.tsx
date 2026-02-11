import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginSocial() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Google */}
      <TouchableOpacity
        style={[
          styles.socialButton,
          {
            borderColor: isDark ? '#475569' : '#e2e8f0',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
          },
        ]}
        activeOpacity={0.7}
      >
        <MaterialIcons 
          name="android" 
          size={24} 
          color={isDark ? '#ffffff' : '#1f2937'} 
        />
      </TouchableOpacity>

      {/* Apple */}
      <TouchableOpacity
        style={[
          styles.socialButton,
          {
            borderColor: isDark ? '#475569' : '#e2e8f0',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
          },
        ]}
        activeOpacity={0.7}
      >
        <MaterialIcons 
          name="apple" 
          size={24} 
          color={isDark ? '#ffffff' : '#1f2937'} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
