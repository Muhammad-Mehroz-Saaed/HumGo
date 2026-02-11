import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import VerificationHeader from '@/components/VerificationHeader';
import VerificationInput from '@/components/VerificationInput';
import VerificationAction from '@/components/VerificationAction';
import ResendCodeButton from '@/components/ResendCodeButton';
import { Colors } from '@/constants/theme';
import { secureLog } from '@/utils/security';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { verifyPhoneOTP, loginAnonymously, confirmationResult, user, sendPhoneOTP } = useAuth();

  const phoneNumber = (params.phone as string) || '+92 300 1234567';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track if verification was properly initiated
  const hasVerificationId = !!confirmationResult;

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  // Show warning if no verification was initiated
  useEffect(() => {
    if (!hasVerificationId && !user) {
      // No Firebase verification was initiated - phone auth not properly set up
      secureLog.warn('Phone auth setup incomplete');
    }
  }, [hasVerificationId, user]);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    // SECURITY: Only verify through Firebase if we have a real verificationId
    if (!hasVerificationId) {
      setError('Phone verification not available. Please use email login or try again.');
      secureLog.error('Verification error: missing-verification-id');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP through Firebase using the stored verificationId
      await verifyPhoneOTP(code);
      // Auth state change will trigger redirect
    } catch (err: any) {
      secureLog.error('OTP verification error', err);
      const errorCode = err?.code || '';
      let message = 'Verification failed. Please try again.';
      
      if (errorCode === 'auth/invalid-verification-code') {
        message = 'Invalid code. Please check and try again.';
      } else if (errorCode === 'auth/code-expired') {
        message = 'Code expired. Please request a new one.';
      } else if (errorCode === 'auth/session-expired') {
        message = 'Session expired. Please request a new code.';
      } else if (errorCode === 'auth/missing-verification-id') {
        message = 'Verification session not found. Please request a new code.';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    // TODO: Re-trigger phone auth with sendPhoneOTP when RecaptchaVerifier is available
    Alert.alert(
      'Phone Auth Not Available', 
      'Firebase Phone Auth requires additional setup (RecaptchaVerifier). Please use email login for now.'
    );
  };

  const handleSkip = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAnonymously();
      // Auth state change will trigger redirect
    } catch (err: any) {
      setError('Unable to continue. Please try again.');
    } finally {
      setLoading(false);
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
            title="Verify Phone Number"
            subtitle="Enter the OTP sent to"
            contactInfo={phoneNumber}
          />

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Phone Auth Status */}
          {!hasVerificationId && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                Phone verification not initiated. Firebase Phone Auth requires RecaptchaVerifier setup.
                Use "Skip" to continue with demo mode, or go back and use email login.
              </Text>
            </View>
          )}

          {/* OTP Input */}
          <VerificationInput
            value={code}
            onChangeText={(text) => {
              setCode(text);
              setError(null);
            }}
            length={6}
            keyboardType="numeric"
            autoFocus={true}
          />

          {/* Verify Button - disabled if no verificationId */}
          <VerificationAction
            onPress={handleVerify}
            title="Verify"
            disabled={code.length < 6 || !hasVerificationId}
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
  errorContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningText: {
    color: '#92400E',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  hintContainer: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  hintText: {
    color: Colors.primary,
    fontSize: 13,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
