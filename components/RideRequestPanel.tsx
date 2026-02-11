import React from 'react';
import { View, StyleSheet, useColorScheme, Platform, TouchableOpacity, Text } from 'react-native';
import PickupDropInput from './PickupDropInput';
import VehicleTypeSelector from './VehicleTypeSelector';

interface RideRequestPanelProps {
  pickupValue: string;
  dropValue: string;
  selectedVehicle: string;
  onPickupChange: (text: string) => void;
  onDropChange: (text: string) => void;
  onVehicleSelect: (id: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export default function RideRequestPanel({
  pickupValue,
  dropValue,
  selectedVehicle,
  onPickupChange,
  onDropChange,
  onVehicleSelect,
  onConfirm,
  disabled = false,
}: RideRequestPanelProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#152e1a' : '#ffffff',
        },
        Platform.OS === 'ios' && styles.iosShadow,
        Platform.OS === 'android' && styles.androidShadow,
      ]}
    >
      {/* Drag Handle */}
      <View style={styles.dragHandle}>
        <View style={[styles.dragBar, { backgroundColor: isDark ? '#475569' : '#cbd5e1' }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Pickup & Drop Inputs */}
        <PickupDropInput
          pickupValue={pickupValue}
          dropValue={dropValue}
          onPickupChange={onPickupChange}
          onDropChange={onDropChange}
        />

        {/* Vehicle Type Selector */}
        <VehicleTypeSelector
          selectedVehicle={selectedVehicle}
          onSelectVehicle={onVehicleSelect}
        />

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!pickupValue || !dropValue || disabled) && styles.confirmButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={!pickupValue || !dropValue || disabled}
          activeOpacity={0.9}
        >
          <Text style={styles.confirmButtonText}>
            {disabled ? 'Loading...' : 'Confirm Ride'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    zIndex: 100,
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  androidShadow: {
    elevation: 10,
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  confirmButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#13ec30',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  confirmButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2e0e',
  },
});
