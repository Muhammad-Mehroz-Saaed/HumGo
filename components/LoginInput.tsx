import React from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoginInputProps extends TextInputProps {
  label: string;
  type?: 'phone' | 'email';
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function LoginInput({ label, type = 'email', icon, ...props }: LoginInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#e2e8f0' : '#111812' }]}>
        {label}
      </Text>
      
      <View style={styles.inputWrapper}>
        {type === 'phone' ? (
          <>
            <View style={[styles.countryCode, { borderRightColor: isDark ? '#475569' : '#e2e8f0' }]}>
              <Text style={styles.flag}>🇵🇰</Text>
              <Text style={[styles.code, { color: isDark ? '#cbd5e1' : '#334155' }]}>+92</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.phoneInput,
                {
                  backgroundColor: isDark ? '#1a381f' : '#f8fafc',
                  borderColor: isDark ? '#475569' : '#e2e8f0',
                  color: isDark ? '#ffffff' : '#111812',
                },
              ]}
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              {...props}
            />
          </>
        ) : (
          <>
            {icon && (
              <MaterialIcons
                name={icon}
                size={24}
                color={isDark ? '#64748b' : '#94a3b8'}
                style={styles.icon}
              />
            )}
            <TextInput
              style={[
                styles.input,
                icon && styles.inputWithIcon,
                {
                  backgroundColor: isDark ? '#1a381f' : '#f8fafc',
                  borderColor: isDark ? '#475569' : '#e2e8f0',
                  color: isDark ? '#ffffff' : '#111812',
                },
              ]}
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              {...props}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  phoneInput: {
    paddingLeft: 90,
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  countryCode: {
    position: 'absolute',
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    borderRightWidth: 1,
    height: 24,
    zIndex: 1,
  },
  flag: {
    fontSize: 16,
  },
  code: {
    fontSize: 16,
    fontWeight: '500',
  },
});
