import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRide } from '@/context/RideContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Dimensions as AppDimensions, Shadows } from '@/constants/theme';
import NativeMap from '@/components/NativeMap';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Status badge helpers
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { 
        label: 'Ride in progress', 
        icon: 'directions-car' as const,
        color: Colors.primary, 
        bg: Colors.primaryLight 
      };
    case 'pending':
      return { 
        label: 'Finding a ride...', 
        icon: 'hourglass-empty' as const,
        color: '#F59E0B', 
        bg: '#FEF3C7' 
      };
    case 'completed':
      return { 
        label: 'Ride completed', 
        icon: 'check-circle' as const,
        color: Colors.success, 
        bg: '#DCFCE7' 
      };
    case 'cancelled':
      return { 
        label: 'Ride cancelled', 
        icon: 'cancel' as const,
        color: Colors.error, 
        bg: '#FEE2E2' 
      };
    default:
      return { 
        label: 'Unknown', 
        icon: 'info' as const,
        color: Colors.textSecondary, 
        bg: Colors.backgroundSecondary 
      };
  }
};

export default function ActiveRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { currentTrip, isTripLoading, listenToUserActiveTrip, updateTripStatus } = useRide();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = listenToUserActiveTrip(user.id);
    return () => unsub?.();
  }, [listenToUserActiveTrip, user?.id]);

  // User not authenticated
  if (!user?.id && !isTripLoading) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="account-circle" size={48} color={Colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>Not logged in</Text>
        <Text style={styles.emptySubtitle}>Please log in to view your rides</Text>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.replace('/(tabs)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (isTripLoading) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading your ride…</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!currentTrip) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="directions-car" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No active ride</Text>
        <Text style={styles.emptySubtitle}>Book a ride to see details here</Text>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.replace('/(tabs)/home')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Book a ride</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(currentTrip.status);

  const handleCancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            updateTripStatus(currentTrip.id, 'cancelled');
            setTimeout(() => router.replace('/(tabs)/home'), 1000);
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel ride.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleConfirmPickup = async () => {
    setActionLoading(true);
    try {
      updateTripStatus(currentTrip.id, 'active');
      Alert.alert('Confirmed!', 'Your ride is now active.');
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm ride.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRide = () => {
    Alert.alert('Complete Ride', 'Has your ride been completed?', [
      { text: 'Not Yet', style: 'cancel' },
      {
        text: 'Yes, Complete',
        onPress: async () => {
          setActionLoading(true);
          try {
            updateTripStatus(currentTrip.id, 'completed');
            Alert.alert('Thank you!', 'Ride completed successfully.');
            setTimeout(() => router.replace('/(tabs)/home'), 1500);
          } catch (error) {
            Alert.alert('Error', 'Failed to complete ride.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const getVehicleIcon = () => {
    switch (currentTrip.vehicleType?.toLowerCase()) {
      case 'bike': return 'two-wheeler';
      case 'rickshaw': return 'electric-rickshaw';
      case 'suv': return 'airport-shuttle';
      default: return 'directions-car';
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Section (Top Half) */}
      <View style={styles.mapSection}>
        <NativeMap
          latitude={(currentTrip.pickup.latitude + currentTrip.dropoff.latitude) / 2}
          longitude={(currentTrip.pickup.longitude + currentTrip.dropoff.longitude) / 2}
          latitudeDelta={0.06}
          longitudeDelta={0.06}
          markers={[
            {
              latitude: currentTrip.pickup.latitude,
              longitude: currentTrip.pickup.longitude,
              title: 'Pickup',
              pinColor: Colors.markerPickup,
            },
            {
              latitude: currentTrip.dropoff.latitude,
              longitude: currentTrip.dropoff.longitude,
              title: 'Drop-off',
              pinColor: Colors.markerDropoff,
            },
          ]}
          style={styles.map}
        />

        {/* Back Button Overlay */}
        <TouchableOpacity 
          style={[styles.backButtonOverlay, { top: insets.top + Spacing.md }]} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Card (Details) */}
      <View style={styles.bottomCard}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardContent}
        >
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <MaterialIcons name={statusConfig.icon} size={20} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {/* Trip Details Card */}
          <View style={styles.detailsCard}>
            {/* Pickup */}
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: Colors.markerPickup }]} />
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>FROM</Text>
                <Text style={styles.locationAddress}>{currentTrip.pickup.address}</Text>
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
                <Text style={styles.locationLabel}>TO</Text>
                <Text style={styles.locationAddress}>{currentTrip.dropoff.address}</Text>
              </View>
            </View>
          </View>

          {/* Vehicle & Price Row */}
          <View style={styles.vehiclePriceRow}>
            <View style={styles.vehicleSection}>
              <View style={styles.vehicleIconCircle}>
                <MaterialIcons name={getVehicleIcon() as any} size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.vehicleType}>{currentTrip.vehicleType}</Text>
                <Text style={styles.vehicleSubtext}>Vehicle</Text>
              </View>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.priceValue}>Rs. {currentTrip.estimatedPrice}</Text>
              <Text style={styles.priceLabel}>Estimated</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {currentTrip.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
                  onPress={handleConfirmPickup}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={Colors.textInverse} size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="check" size={20} color={Colors.textInverse} />
                      <Text style={styles.primaryButtonText}>Confirm Pickup</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, styles.cancelButton]}
                  onPress={handleCancelRide}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel Ride</Text>
                </TouchableOpacity>
              </>
            )}

            {currentTrip.status === 'active' && (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
                  onPress={handleCompleteRide}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={Colors.textInverse} size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="check-circle" size={20} color={Colors.textInverse} />
                      <Text style={styles.primaryButtonText}>Complete Ride</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/(tabs)/match-list')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="people" size={20} color={Colors.primary} />
                  <Text style={styles.secondaryButtonText}>View matches & chat</Text>
                </TouchableOpacity>
              </>
            )}

            {(currentTrip.status === 'completed' || currentTrip.status === 'cancelled') && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/(tabs)/home')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={20} color={Colors.textInverse} />
                <Text style={styles.primaryButtonText}>Book Another Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
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
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },
  mapSection: {
    height: SCREEN_HEIGHT * 0.45,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
  backButtonOverlay: {
    position: 'absolute',
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    marginTop: -Spacing.xl,
    ...Shadows.lg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightSemibold,
  },
  detailsCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
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
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
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
  vehiclePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  vehicleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleType: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  vehicleSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    height: AppDimensions.buttonHeightLg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textInverse,
  },
  secondaryButton: {
    height: AppDimensions.buttonHeightLg,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.error,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
