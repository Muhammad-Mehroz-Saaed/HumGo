import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function SplashFooter() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.tagline,
          { color: isDark ? '#94a3b8' : '#64748b' }
        ]}
      >
        Go together. Pay less.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 48,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
