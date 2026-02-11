import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function LoginDivider() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={[styles.line, { borderColor: isDark ? '#475569' : '#e2e8f0' }]} />
      <Text style={[styles.text, { 
        backgroundColor: isDark ? '#152e1a' : '#ffffff',
        color: isDark ? '#64748b' : '#94a3b8' 
      }]}>
        Or continue with email
      </Text>
      <View style={[styles.line, { borderColor: isDark ? '#475569' : '#e2e8f0' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
  },
  text: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
});
