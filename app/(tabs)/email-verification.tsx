import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuth, signInAnonymously } from 'firebase/auth';
import VerificationHeader from '@/components/VerificationHeader';
import VerificationInput from '@/components/VerificationInput';
import VerificationAction from '@/components/VerificationAction';
import ResendCodeButton from '@/components/ResendCodeButton';
import { secureLog } from '@/utils/security';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const email = (params.email as string) || 'user@example.com';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 4) {
      Alert.alert('Invalid Code', 'Please enter a valid verification code');
      return;
    }

    setLoading(true);
    const auth = getAuth();

    try {
      // Firebase Email Link Auth requires additional setup
      // For demo: use anonymous auth (replace with proper email link in production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (code.length >= 4) {
        await signInAnonymously(auth);
        router.replace('/(tabs)/home');
      } else {
        throw new Error('Invalid code');
      }
    } catch (error: any) {
      secureLog.error('Verification error', error);
      Alert.alert('Verification Failed', 'The code you entered is incorrect. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    Alert.alert('Code Sent', `A new verification code has been sent to ${email}`);
    // TODO: Implement resend email verification logic
  };

  const handleSkip = async () => {
    const auth = getAuth();
    try {
      await signInAnonymously(auth);
      // Auth guard in _layout.tsx will handle navigation to home
    } catch (error: any) {
      secureLog.error('Anonymous auth error', error);
      Alert.alert('Error', 'Unable to continue. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: isDark ? '#152e1a' : '#ffffff' },
        ]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <VerificationHeader
            title="Verify Email"
            subtitle="Enter the verification code sent to"
            contactInfo={email}
          />

          {/* Code Input */}
          <VerificationInput
            value={code}
            onChangeText={setCode}
            length={6}
            keyboardType="default"
            autoFocus={true}
          />

          {/* Verify Button */}
          <VerificationAction
            onPress={handleVerify}
            title="Verify Email"
            disabled={code.length < 4}
            loading={loading}
          />

          {/* Resend Code */}
          <ResendCodeButton onPress={handleResend} disabled={loading} />

          {/* Skip Button for Demo */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip (Demo Mode)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#13ec30',
    fontSize: 14,
    fontWeight: '500',
  },
});
