import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRide } from '@/context/RideContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Dimensions, Shadows } from '@/constants/theme';
import { isValidCoordinate, isValidRideDistance, secureLog } from '@/utils/security';

// Timeout for async operations (prevent indefinite blocking)
const ACTION_TIMEOUT = 15000;

export default function RideConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { addTrip } = useRide();
  const { user } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);

  const pickup = params.pickup as string || 'Pickup location';
  const dropoff = params.dropoff as string || 'Drop-off location';
  const vehicle = params.vehicle as string || 'Car';
  const price = params.price as string || 'Rs. 150-250';
  
  const pickupLat = parseFloat(params.pickupLat as string) || 31.5204;
  const pickupLng = parseFloat(params.pickupLng as string) || 74.3587;
  const dropLat = parseFloat(params.dropLat as string) || 31.5404;
  const dropLng = parseFloat(params.dropLng as string) || 74.3787;

  const getVehicleIcon = () => {
    switch (vehicle.toLowerCase()) {
      case 'bike': return 'two-wheeler';
      case 'rickshaw': return 'electric-rickshaw';
      case 'suv': return 'airport-shuttle';
      default: return 'directions-car';
    }
  };

  const handleContinue = async () => {
    // Validate Firebase auth state (support both regular and anonymous users)
    if (!user?.id) {
      Alert.alert(
        'Authentication Required',
        'Please log in or try demo mode to book a ride.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Login', onPress: () => router.replace('/(tabs)/login') },
        ]
      );
      return;
    }

    // Security: Validate coordinates
    if (!isValidCoordinate(pickupLat, pickupLng) || !isValidCoordinate(dropLat, dropLng)) {
      Alert.alert('Invalid Location', 'Please enter valid pickup and drop-off locations.');
      return;
    }

    // Security: Validate ride distance
    const distanceCheck = isValidRideDistance(pickupLat, pickupLng, dropLat, dropLng);
    if (!distanceCheck.valid) {
      Alert.alert('Invalid Distance', distanceCheck.error || 'Please check your locations.');
      return;
    }

    setIsConfirming(true);

    // Create trip with timeout to prevent indefinite blocking
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ACTION_TIMEOUT)
    );

    try {
      const tripPromise = (async () => {
        const newTrip = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          pickup: { latitude: pickupLat, longitude: pickupLng, address: pickup },
          dropoff: { latitude: dropLat, longitude: dropLng, address: dropoff },
          vehicleType: vehicle,
          estimatedPrice: parseInt(price.split('-')[0].replace(/\D/g, '')) || 150,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        };

        await addTrip(newTrip);
        return newTrip;
      })();

      await Promise.race([tripPromise, timeoutPromise]);
      router.replace('/(tabs)/active-ride');
    } catch (error: any) {
      secureLog.error('Trip creation error', error);
      const errorMessage = error?.message === 'Operation timed out'
        ? 'The request took too long. Please check your connection and try again.'
        : 'Could not create your ride. Please try again.';
      
      Alert.alert('Booking Failed', errorMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: handleContinue },
      ]);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Ride</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation Placeholder */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check" size={40} color={Colors.textInverse} />
          </View>
          <Text style={styles.successTitle}>Ready to book!</Text>
          <Text style={styles.successSubtitle}>
            Review your trip details below
          </Text>
        </View>

        {/* Trip Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Details</Text>
          
          {/* Pickup */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: Colors.markerPickup }]} />
            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationAddress}>{pickup}</Text>
            </View>
          </View>

          {/* Connector */}
          <View style={styles.connectorContainer}>
            <View style={styles.connectorLine} />
          </View>

          {/* Drop-off */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: Colors.markerDropoff }]} />
            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>Drop-off</Text>
              <Text style={styles.locationAddress}>{dropoff}</Text>
            </View>
          </View>
        </View>

        {/* Vehicle & Price Card */}
        <View style={styles.card}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIconContainer}>
              <MaterialIcons name={getVehicleIcon() as any} size={32} color={Colors.primary} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleType}>{vehicle}</Text>
              <Text style={styles.vehicleSubtext}>Estimated arrival: 3-5 min</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Fare</Text>
              <Text style={styles.priceValue}>{price}</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <MaterialIcons name="info-outline" size={16} color={Colors.textTertiary} />
          <Text style={styles.disclaimer}>
            Humgo connects passengers. Ride responsibility is on all parties. Share your trip with trusted contacts.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <TouchableOpacity
          style={[styles.confirmButton, isConfirming && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isConfirming}
          activeOpacity={0.8}
        >
          {isConfirming ? (
            <>
              <ActivityIndicator color={Colors.textInverse} size="small" />
              <Text style={styles.confirmButtonText}>Confirming...</Text>
            </>
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              <MaterialIcons name="check" size={20} color={Colors.textInverse} />
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: Spacing.md,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
  },
  connectorContainer: {
    paddingLeft: 5,
    paddingVertical: Spacing.xs,
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 5,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textTransform: 'capitalize',
  },
  vehicleSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.primary,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  disclaimer: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  bottomAction: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmButton: {
    height: Dimensions.buttonHeightLg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
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
