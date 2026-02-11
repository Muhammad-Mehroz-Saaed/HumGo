import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CurrentLocationButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function CurrentLocationButton({ onPress, disabled = false }: CurrentLocationButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        Platform.OS === 'ios' && styles.iosShadow,
        Platform.OS === 'android' && styles.androidShadow,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <MaterialIcons name="my-location" size={24} color={disabled ? '#94a3b8' : '#13ec30'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  androidShadow: {
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#f1f5f9',
    opacity: 0.5,
  },
});
