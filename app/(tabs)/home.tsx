import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions as RNDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Dimensions, Shadows } from '@/constants/theme';
import NativeMap from '@/components/NativeMap';
import { secureLog } from '@/utils/security';
import { useAuth } from '@/context/AuthContext';

// Default location: Lahore, Pakistan
const LAHORE_DEFAULT = {
  latitude: 31.5204,
  longitude: 74.3587,
};

// Vehicle types with icons and pricing
const VEHICLES = [
  { id: 'bike', name: 'Bike', icon: 'two-wheeler', price: 50, priceRange: 'Rs. 50-80' },
  { id: 'rickshaw', name: 'Rickshaw', icon: 'electric-rickshaw', price: 80, priceRange: 'Rs. 80-120' },
  { id: 'car', name: 'Car', icon: 'directions-car', price: 150, priceRange: 'Rs. 150-250' },
  { id: 'suv', name: 'SUV', icon: 'airport-shuttle', price: 200, priceRange: 'Rs. 200-350' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenHeight = RNDimensions.get('window').height;
  const { user, isLoading: authLoading } = useAuth();

  // State for locations
  const [userLocation, setUserLocation] = useState(LAHORE_DEFAULT);
  const [pickupLocation, setPickupLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [dropLocation, setDropLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // State for inputs
  const [pickupText, setPickupText] = useState('');
  const [dropText, setDropText] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('car');

  // Request location permissions and get user location
  useEffect(() => {
    if (Platform.OS === 'web') {
      setLocationError('GPS not available on web');
      return;
    }

    (async () => {
      setIsLoadingLocation(true);
      setLocationError(null);

      try {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocationError('Location permission denied');
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        });
        
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setLocationError(null);
      } catch (error: any) {
        secureLog.error('Location retrieval error', error);
        setLocationError('Could not get location');
        setUserLocation(LAHORE_DEFAULT);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const handleRecenterMap = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Location features are only available on mobile devices.');
      return;
    }

    setIsLoadingLocation(true);
    try {
      const Location = await import('expo-location');
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable location permissions.');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLocationError(null);
    } catch (error: any) {
      Alert.alert('Error', 'Unable to get your current location.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = (coordinate: { latitude: number; longitude: number }) => {
    if (!pickupLocation) {
      setPickupLocation(coordinate);
      setPickupText(`${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`);
    } else if (!dropLocation) {
      setDropLocation(coordinate);
      setDropText(`${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`);
    }
  };

  const handleConfirmRide = () => {
    // Validate user is authenticated (Firebase auth is source of truth)
    if (!user?.id) {
      Alert.alert(
        'Login Required',
        'Please log in or use demo mode to book a ride.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Login', onPress: () => router.replace('/(tabs)/login') },
        ]
      );
      return;
    }

    if (!pickupText.trim()) {
      Alert.alert('Missing Pickup', 'Please enter a pickup location.');
      return;
    }

    if (!dropText.trim()) {
      Alert.alert('Missing Drop-off', 'Please enter a drop-off location.');
      return;
    }

    const vehicle = VEHICLES.find(v => v.id === selectedVehicle);

    router.push({
      pathname: '/(tabs)/ride-confirmation',
      params: {
        pickup: pickupText.trim(),
        dropoff: dropText.trim(),
        vehicle: selectedVehicle,
        price: vehicle?.priceRange || 'Rs. 150-250',
        pickupLat: pickupLocation?.latitude?.toString() || LAHORE_DEFAULT.latitude.toString(),
        pickupLng: pickupLocation?.longitude?.toString() || LAHORE_DEFAULT.longitude.toString(),
        dropLat: dropLocation?.latitude?.toString() || LAHORE_DEFAULT.latitude.toString(),
        dropLng: dropLocation?.longitude?.toString() || LAHORE_DEFAULT.longitude.toString(),
      },
    });
  };

  const clearPickup = () => {
    setPickupText('');
    setPickupLocation(undefined);
  };

  const clearDrop = () => {
    setDropText('');
    setDropLocation(undefined);
  };

  // Build markers array for NativeMap
  const mapMarkers = [
    ...(pickupLocation ? [{
      latitude: pickupLocation.latitude,
      longitude: pickupLocation.longitude,
      title: 'Pickup',
      pinColor: Colors.markerPickup,
    }] : []),
    ...(dropLocation ? [{
      latitude: dropLocation.latitude,
      longitude: dropLocation.longitude,
      title: 'Drop-off',
      pinColor: Colors.markerDropoff,
    }] : []),
  ];

  const isButtonDisabled = !pickupText.trim() || !dropText.trim() || isLoadingLocation;

  return (
    <View style={styles.container}>
      {/* Full-screen Map */}
      <View style={styles.mapContainer}>
        <NativeMap
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          latitudeDelta={0.02}
          longitudeDelta={0.02}
          markers={mapMarkers}
          onPress={handleMapPress}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Loading Overlay */}
      {isLoadingLocation && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        </View>
      )}

      {/* Top Search Card */}
      <View style={[styles.searchCard, { top: insets.top + Spacing.md }]}>
        {/* Pickup Input */}
        <View style={styles.inputRow}>
          <View style={[styles.inputDot, { backgroundColor: Colors.markerPickup }]} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Where from?"
              placeholderTextColor={Colors.textTertiary}
              value={pickupText}
              onChangeText={setPickupText}
            />
            {pickupText ? (
              <TouchableOpacity onPress={clearPickup} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Connector Line */}
        <View style={styles.connectorContainer}>
          <View style={styles.connectorLine} />
        </View>

        {/* Drop-off Input */}
        <View style={styles.inputRow}>
          <View style={[styles.inputDot, { backgroundColor: Colors.markerDropoff }]} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Where to?"
              placeholderTextColor={Colors.textTertiary}
              value={dropText}
              onChangeText={setDropText}
            />
            {dropText ? (
              <TouchableOpacity onPress={clearDrop} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* Current Location FAB */}
      <TouchableOpacity
        style={[styles.fabButton, { bottom: screenHeight * 0.35 + Spacing.lg }]}
        onPress={handleRecenterMap}
        disabled={isLoadingLocation}
        activeOpacity={0.8}
      >
        <MaterialIcons 
          name="my-location" 
          size={24} 
          color={isLoadingLocation ? Colors.textTertiary : Colors.primary} 
        />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Vehicle Selector */}
        <Text style={styles.sectionTitle}>Choose your ride</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vehicleList}
        >
          {VEHICLES.map((vehicle) => {
            const isSelected = selectedVehicle === vehicle.id;
            return (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  isSelected && styles.vehicleCardSelected,
                ]}
                onPress={() => setSelectedVehicle(vehicle.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.vehicleIconContainer, isSelected && styles.vehicleIconContainerSelected]}>
                  <MaterialIcons 
                    name={vehicle.icon as any} 
                    size={28} 
                    color={isSelected ? Colors.primary : Colors.textSecondary} 
                  />
                </View>
                <Text style={[styles.vehicleName, isSelected && styles.vehicleNameSelected]}>
                  {vehicle.name}
                </Text>
                <Text style={[styles.vehiclePrice, isSelected && styles.vehiclePriceSelected]}>
                  Rs. {vehicle.price}+
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleConfirmRide}
          disabled={isButtonDisabled}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Find a ride</Text>
          <MaterialIcons name="arrow-forward" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  mapPlaceholderText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    ...Shadows.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
  },
  searchCard: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  connectorContainer: {
    paddingLeft: 5,
    paddingVertical: Spacing.xs,
  },
  connectorLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 5,
  },
  fabButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    zIndex: 100,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
    ...Shadows.xl,
  },
  dragHandle: {
    width: Dimensions.bottomSheetHandle.width,
    height: Dimensions.bottomSheetHandle.height,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  vehicleList: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  vehicleCard: {
    width: Dimensions.vehicleCardWidth,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  vehicleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  vehicleIconContainerSelected: {
    backgroundColor: Colors.background,
  },
  vehicleName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  vehicleNameSelected: {
    color: Colors.primary,
  },
  vehiclePrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  vehiclePriceSelected: {
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeightMedium,
  },
  confirmButton: {
    height: Dimensions.buttonHeightLg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textInverse,
  },
});
