import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface VehicleType {
  id: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  estimatedPrice: string;
  seats: number;
}

interface VehicleTypeSelectorProps {
  selectedVehicle: string;
  onSelectVehicle: (id: string) => void;
}

const vehicleTypes: VehicleType[] = [
  {
    id: 'bike',
    name: 'Bike',
    icon: 'two-wheeler',
    estimatedPrice: 'Rs. 50-80',
    seats: 1,
  },
  {
    id: 'rickshaw',
    name: 'Rickshaw',
    icon: 'electric-rickshaw',
    estimatedPrice: 'Rs. 80-120',
    seats: 3,
  },
  {
    id: 'car',
    name: 'Car',
    icon: 'directions-car',
    estimatedPrice: 'Rs. 150-250',
    seats: 4,
  },
  {
    id: 'suv',
    name: 'SUV',
    icon: 'airport-shuttle',
    estimatedPrice: 'Rs. 200-350',
    seats: 6,
  },
];

export default function VehicleTypeSelector({ selectedVehicle, onSelectVehicle }: VehicleTypeSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#cbd5e1' : '#334155' }]}>
        Select Vehicle
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {vehicleTypes.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.id;
          return (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                {
                  backgroundColor: isDark ? '#1a381f' : '#ffffff',
                  borderColor: isSelected ? '#13ec30' : isDark ? '#475569' : '#e2e8f0',
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onSelectVehicle(vehicle.id)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={vehicle.icon}
                size={32}
                color={isSelected ? '#13ec30' : isDark ? '#94a3b8' : '#64748b'}
              />
              <Text
                style={[
                  styles.vehicleName,
                  {
                    color: isSelected ? '#13ec30' : isDark ? '#ffffff' : '#111812',
                  },
                ]}
              >
                {vehicle.name}
              </Text>
              <Text style={[styles.vehiclePrice, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {vehicle.estimatedPrice}
              </Text>
              <Text style={[styles.vehicleSeats, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                {vehicle.seats} {vehicle.seats === 1 ? 'seat' : 'seats'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  scrollContent: {
    gap: 12,
  },
  vehicleCard: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  vehiclePrice: {
    fontSize: 11,
    fontWeight: '500',
  },
  vehicleSeats: {
    fontSize: 10,
  },
});
