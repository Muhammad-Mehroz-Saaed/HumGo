import React from 'react';
import { View, TextInput, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PickupDropInputProps {
  pickupValue: string;
  dropValue: string;
  onPickupChange: (text: string) => void;
  onDropChange: (text: string) => void;
}

export default function PickupDropInput({
  pickupValue,
  dropValue,
  onPickupChange,
  onDropChange,
}: PickupDropInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Pickup Input */}
      <View style={styles.inputRow}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="my-location"
            size={20}
            color="#3b82f6"
          />
          <View style={styles.dotLine} />
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#1a381f' : '#f8fafc',
              borderColor: isDark ? '#475569' : '#e2e8f0',
              color: isDark ? '#ffffff' : '#111812',
            },
          ]}
          placeholder="Pickup location"
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={pickupValue}
          onChangeText={onPickupChange}
        />
      </View>

      {/* Drop-off Input */}
      <View style={styles.inputRow}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="location-on"
            size={20}
            color="#ef4444"
          />
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#1a381f' : '#f8fafc',
              borderColor: isDark ? '#475569' : '#e2e8f0',
              color: isDark ? '#ffffff' : '#111812',
            },
          ]}
          placeholder="Drop-off location"
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={dropValue}
          onChangeText={onDropChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    position: 'relative',
  },
  dotLine: {
    width: 2,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
