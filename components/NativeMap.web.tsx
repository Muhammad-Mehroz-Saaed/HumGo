import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';

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

// Web fallback - react-native-maps not supported on web
export default function NativeMap({
  latitude,
  longitude,
  markers = [],
  style,
}: NativeMapProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, style, { backgroundColor: isDark ? '#1a381f' : '#e8f5e9' }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111812' }]}>
          🗺️ Map View
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Maps are available on mobile devices
        </Text>
        <Text style={[styles.coords, { color: isDark ? '#64748b' : '#94a3b8' }]}>
          📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        {markers.length > 0 && (
          <Text style={[styles.markerInfo, { color: isDark ? '#64748b' : '#94a3b8' }]}>
            {markers.length} marker(s) placed
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  coords: {
    fontSize: 12,
    marginBottom: 8,
  },
  markerInfo: {
    fontSize: 12,
    marginTop: 8,
  },
});
