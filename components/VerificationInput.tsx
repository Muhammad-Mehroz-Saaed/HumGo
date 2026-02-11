import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, useColorScheme, Text as RNText } from 'react-native';

interface VerificationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
  keyboardType?: 'numeric' | 'default';
  autoFocus?: boolean;
}

export default function VerificationInput({
  value,
  onChangeText,
  length = 6,
  keyboardType = 'numeric',
  autoFocus = true,
}: VerificationInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const handleChangeText = (text: string) => {
    // Only allow numbers for numeric keyboard
    if (keyboardType === 'numeric') {
      const numericText = text.replace(/[^0-9]/g, '');
      if (numericText.length <= length) {
        onChangeText(numericText);
      }
    } else {
      if (text.length <= length) {
        onChangeText(text);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Hidden input for actual text entry */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          maxLength={length}
          style={styles.hiddenInput}
          autoFocus={autoFocus}
          returnKeyType="done"
        />
        
        {/* Visual code boxes */}
        <View style={styles.codeBoxesContainer}>
          {Array.from({ length }).map((_, index) => {
            const isFilled = index < value.length;
            const isActive = index === value.length;

            return (
              <View
                key={index}
                style={[
                  styles.codeBox,
                  {
                    backgroundColor: isDark ? '#1a381f' : '#f8fafc',
                    borderColor: isActive
                      ? '#13ec30'
                      : isDark
                      ? '#475569'
                      : '#e2e8f0',
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <RNText
                  style={[
                    styles.codeText,
                    { color: isDark ? '#ffffff' : '#111812' },
                  ]}
                >
                  {isFilled ? value[index] : ''}
                </RNText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 32,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  codeBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  codeBox: {
    width: 52,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});
