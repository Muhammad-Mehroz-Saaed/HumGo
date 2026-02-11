import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

export default function SplashBackground() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Top-right decorative circle */}
      <View 
        style={[
          styles.circleTopRight,
          { 
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f6f8f6',
          }
        ]} 
      />
      
      {/* Bottom-left decorative circle */}
      <View 
        style={[
          styles.circleBottomLeft,
          { 
            borderColor: isDark ? 'rgba(19, 236, 48, 0.05)' : 'rgba(19, 236, 48, 0.05)',
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
    opacity: 0.4,
  },
  circleTopRight: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 40,
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: 500,
    height: 500,
    borderRadius: 250,
    borderWidth: 60,
  },
});
