import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface VerificationHeaderProps {
  title: string;
  subtitle: string;
  contactInfo: string;
}

export default function VerificationHeader({ title, subtitle, contactInfo }: VerificationHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111812' }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
        {subtitle}
      </Text>
      <Text style={[styles.contactInfo, { color: isDark ? '#cbd5e1' : '#334155' }]}>
        {contactInfo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});
