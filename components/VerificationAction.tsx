import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';

interface VerificationActionProps {
  onPress?: () => void;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function VerificationAction({
  onPress,
  title = 'Verify',
  disabled = false,
  loading = false,
}: VerificationActionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        Platform.OS === 'ios' && styles.iosShadow,
        Platform.OS === 'android' && styles.androidShadow,
        (disabled || loading) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#0a2e0e" size="small" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#13ec30',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
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
});
