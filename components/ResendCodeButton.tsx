import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';

interface ResendCodeButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

export default function ResendCodeButton({ onPress, disabled = false }: ResendCodeButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: disabled ? '#94a3b8' : '#13ec30' }]}>
        Didn't receive the code?{' '}
        <Text style={styles.linkText}>Resend</Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
