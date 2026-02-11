import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoginActionProps {
  onPress?: () => void;
  title?: string;
  disabled?: boolean;
}

export default function LoginAction({ onPress, title = 'Continue', disabled = false }: LoginActionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        Platform.OS === 'ios' && styles.iosShadow,
        Platform.OS === 'android' && styles.androidShadow,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
      <MaterialIcons name="arrow-forward" size={24} color="#0a2e0e" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#13ec30',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2e0e',
  },
  iosShadow: {
    shadowColor: '#13ec30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  androidShadow: {
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
});
