import React from 'react';
import { StyleSheet, View, Platform, Text, useColorScheme } from 'react-native';
import { secureLog } from '@/utils/security';

interface MapViewWrapperProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  pickupLocation?: {
    latitude: number;
    longitude: number;
  };
  dropLocation?: {
    latitude: number;
    longitude: number;
  };
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
}

export default function MapViewWrapper({
  userLocation,
  pickupLocation,
  dropLocation,
  onMapPress,
}: MapViewWrapperProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Web fallback - maps don't work on web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.webFallback, { backgroundColor: isDark ? '#1a381f' : '#e8f5e9' }]}>
        <View style={styles.webContent}>
          <Text style={[styles.webTitle, { color: isDark ? '#ffffff' : '#111812' }]}>
            🗺️ Map View
          </Text>
          <Text style={[styles.webSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Maps are available on mobile devices only
          </Text>
          <Text style={[styles.webInfo, { color: isDark ? '#64748b' : '#94a3b8' }]}>
            Please use the Expo Go app to see the map
          </Text>
        </View>
      </View>
    );
  }

  // Native platforms - load react-native-maps (Expo Go includes 1.20.1)
  let MapView: any = null;
  let Marker: any = null;
  let PROVIDER_GOOGLE: any = null;
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (error) {
    secureLog.warn('Maps initialization warning', error);
    return (
      <View style={[styles.container, styles.webFallback, { backgroundColor: isDark ? '#1a381f' : '#e8f5e9' }]}>
        <View style={styles.webContent}>
          <Text style={[styles.webTitle, { color: isDark ? '#ffffff' : '#111812' }]}>🗺️ Map View</Text>
          <Text style={[styles.webSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Maps unavailable on this build</Text>
          <Text style={[styles.webInfo, { color: isDark ? '#64748b' : '#94a3b8' }]}>
            Please use Expo Go or a dev build with maps enabled
          </Text>
        </View>
      </View>
    );
  }

  if (!MapView || !Marker) {
    return (
      <View style={[styles.container, styles.webFallback, { backgroundColor: isDark ? '#1a381f' : '#e8f5e9' }]}>
        <View style={styles.webContent}>
          <Text style={[styles.webTitle, { color: isDark ? '#ffffff' : '#111812' }]}>🗺️ Map View</Text>
          <Text style={[styles.webSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Maps unavailable on this build</Text>
          <Text style={[styles.webInfo, { color: isDark ? '#64748b' : '#94a3b8' }]}>
            Please use Expo Go or a dev build with maps enabled
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={(e: any) => onMapPress?.(e.nativeEvent.coordinate)}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={userLocation}
          title="Your Location"
          pinColor="#13ec30"
        />

        {/* Pickup Location Marker */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup"
            pinColor="#3b82f6"
          />
        )}

        {/* Drop Location Marker */}
        {dropLocation && (
          <Marker
            coordinate={dropLocation}
            title="Drop-off"
            pinColor="#ef4444"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContent: {
    alignItems: 'center',
    padding: 32,
  },
  webTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  webSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  webInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
