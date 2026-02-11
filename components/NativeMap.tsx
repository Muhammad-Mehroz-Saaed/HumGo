// NativeMap.tsx - Placeholder file
// Metro uses .native.tsx for iOS/Android and .web.tsx for web automatically
// This file exists only for type checking and IDE support

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NativeMapProps {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    pinColor?: string;
  }>;
  onPress?: (coordinate: { latitude: number; longitude: number }) => void;
  style?: any;
}

// Fallback component - should never be used (platform files take precedence)
export default function NativeMap(props: NativeMapProps) {
  return (
    <View style={[styles.container, props.style]}>
      <Text>Map Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
});
