import React from 'react';
import { StyleSheet, View, useColorScheme, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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

export default function NativeMap({
  latitude,
  longitude,
  latitudeDelta = 0.06,
  longitudeDelta = 0.06,
  markers = [],
  onPress,
  style,
}: NativeMapProps) {
  const colorScheme = useColorScheme();

  // Safe fallback if MapView is undefined
  if (!MapView) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>Map unavailable</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={[styles.map, style]}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      }}
      onPress={(e: any) => onPress?.(e.nativeEvent.coordinate)}
    >
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}`}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          pinColor={marker.pinColor}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
  fallbackText: {
    color: '#64748b',
    fontSize: 16,
  },
});
