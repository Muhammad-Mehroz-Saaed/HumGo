import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRide } from '@/context/RideContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Dimensions, Shadows } from '@/constants/theme';
import { secureLog } from '@/utils/security';

// Status helpers
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'matched':
      return { label: 'Matched', color: Colors.primary, bg: Colors.primaryLight };
    case 'chatting':
      return { label: 'In chat', color: '#3B82F6', bg: '#EFF6FF' };
    default:
      return { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' };
  }
};

export default function MatchListScreen() {
  const { user } = useAuth();
  const { currentTrip, matches, matchesLoading, generateMatches } = useRide();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTrip && user?.id) {
      try {
        setError(null);
        generateMatches(currentTrip);
      } catch (err) {
        setError('Failed to load matches.');
        secureLog.error('Match generation error', err);
      }
    }
  }, [currentTrip, user?.id, generateMatches]);

  const onRefresh = async () => {
    if (!currentTrip || !user?.id) {
      Alert.alert('No Active Ride', 'Please book a ride first to find matches.');
      return;
    }
    try {
      setRefreshing(true);
      setError(null);
      generateMatches(currentTrip);
      setTimeout(() => setRefreshing(false), 800);
    } catch (err) {
      setError('Failed to refresh matches.');
      setRefreshing(false);
    }
  };

  const handleCardPress = (item: any) => {
    if (!currentTrip?.id) {
      Alert.alert('Error', 'No active trip found. Please book a ride first.');
      return;
    }
    if (!item?.id) {
      Alert.alert('Error', 'Invalid match data.');
      return;
    }
    router.push({ pathname: '/(tabs)/chat', params: { matchId: item.id, tripId: currentTrip.id } });
  };

  const handleBack = () => {
    router.back();
  };

  const renderCard = ({ item }: any) => {
    const statusConfig = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.etaText}>
            {item.etaMinutes} min • {item.distanceKm.toFixed(1)} km
          </Text>
        </View>

        {/* Route Info */}
        <View style={styles.routeContainer}>
          {/* Pickup */}
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.markerPickup }]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>{item.pickupAddress}</Text>
            </View>
          </View>

          {/* Connector */}
          <View style={styles.connectorContainer}>
            <View style={styles.connectorLine} />
          </View>

          {/* Drop-off */}
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.markerDropoff }]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>{item.dropoffAddress}</Text>
            </View>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.ridersInfo}>
            <MaterialIcons name="people" size={18} color={Colors.textSecondary} />
            <Text style={styles.ridersText}>
              {item.riders} rider{item.riders > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.chatLink}>
            <Text style={styles.chatLinkText}>Open chat</Text>
            <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Check user authentication
  if (!user?.id && !matchesLoading) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="account-circle" size={48} color={Colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>Not logged in</Text>
        <Text style={styles.emptySubtitle}>Please log in to view matches</Text>
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

  // Empty state when no trip
  if (!currentTrip && !matchesLoading) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="directions-car" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No active ride</Text>
        <Text style={styles.emptySubtitle}>Book a ride to find nearby matches and split fares</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/home')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Book a Ride</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>People going your way</Text>
          <Text style={styles.headerSubtitle}>
            Riders heading to similar destinations
          </Text>
        </View>
      </View>

      {/* Active Ride Indicator */}
      {currentTrip && (
        <View style={styles.activeRideBar}>
          <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
          <Text style={styles.activeRideText}>Active ride • Finding matches...</Text>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={18} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {matchesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Finding nearby matches…</Text>
          <Text style={styles.loadingSubtext}>Searching within 10km radius</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListHeaderComponent={
            matches.length > 0 ? (
              <View style={styles.matchCountRow}>
                <MaterialIcons name="people" size={16} color={Colors.primary} />
                <Text style={styles.matchCountText}>
                  {matches.length} match{matches.length > 1 ? 'es' : ''} found
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <View style={styles.emptyListIcon}>
                <MaterialIcons name="search-off" size={40} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyListTitle}>No matches yet</Text>
              <Text style={styles.emptyListText}>
                We're searching for riders heading your way. Pull down to refresh.
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} activeOpacity={0.8}>
                <MaterialIcons name="refresh" size={18} color={Colors.primary} />
                <Text style={styles.refreshButtonText}>Refresh Matches</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Web Hint */}
      {Platform.OS === 'web' && (
        <View style={styles.webHint}>
          <MaterialIcons name="info-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.webHintText}>Real-time data from Firestore</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginRight: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  activeRideBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryLight,
  },
  activeRideText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
  },
  retryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.error,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  loadingSubtext: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
  listContent: {
    padding: Spacing.lg,
  },
  matchCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  matchCountText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeightSemibold,
  },
  etaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  routeContainer: {
    marginBottom: Spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: Spacing.md,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
  },
  connectorContainer: {
    paddingLeft: 4,
    paddingVertical: 2,
  },
  connectorLine: {
    width: 2,
    height: 12,
    backgroundColor: Colors.border,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ridersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ridersText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
  },
  chatLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chatLinkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.primary,
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
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  primaryButton: {
    height: Dimensions.buttonHeight,
    paddingHorizontal: Spacing['2xl'],
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textInverse,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyListIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyListTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyListText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  refreshButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.primary,
  },
  webHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.inputBackground,
  },
  webHintText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
});
