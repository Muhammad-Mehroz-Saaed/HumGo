import React from 'react';
import { Text, StyleSheet, useColorScheme } from 'react-native';

export default function LoginFooter() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Text style={[styles.text, { color: isDark ? '#64748b' : '#94a3b8' }]}>
      By continuing, you agree to our{' '}
      <Text style={[styles.link, { color: isDark ? '#cbd5e1' : '#475569' }]}>
        Terms of Service
      </Text>
      {' '}and{' '}
      <Text style={[styles.link, { color: isDark ? '#cbd5e1' : '#475569' }]}>
        Privacy Policy
      </Text>.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
