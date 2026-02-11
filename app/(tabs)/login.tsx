import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Dimensions, Shadows, CommonStyles } from '@/constants/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithEmail, signUpWithEmail, loginAnonymously, sendPhoneOTP } = useAuth();
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
      router.replace('/(tabs)/home');
    } catch (err: any) {
      // Handle specific Firebase errors
      const errorCode = err?.code || '';
      let message = 'Authentication failed. Please try again.';
      
      if (errorCode === 'auth/user-not-found') {
        message = 'No account found with this email. Try signing up.';
      } else if (errorCode === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/email-already-in-use') {
        message = 'Email already registered. Try logging in.';
      } else if (errorCode === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (errorCode === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Format phone number with country code
    const formattedPhone = `+92${phoneNumber.replace(/\D/g, '')}`;
    
    // Firebase Phone Auth requires RecaptchaVerifier which needs additional setup
    // For now, show informative message and offer alternatives
    Alert.alert(
      'Phone Auth Setup Required',
      'Firebase Phone Authentication requires RecaptchaVerifier configuration.\\n\\nOptions:\\n• Use email login instead\\n• Use Demo Mode to explore the app',
      [
        { 
          text: 'Use Email',
          onPress: () => {
            setPhoneNumber('');
            setError(null);
          }
        },
        { 
          text: 'Demo Mode',
          onPress: handleDemoMode
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleContinue = async () => {
    if (phoneNumber.trim()) {
      await handlePhoneAuth();
    } else if (email.trim()) {
      await handleEmailAuth();
    } else {
      setError('Please enter your phone number or email to continue');
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    setError(null);
    try {
      // Firebase anonymous sign-in
      await loginAnonymously();
      // Auth guard in _layout.tsx will automatically redirect to home
      // when onAuthStateChanged fires
    } catch (err) {
      setError('Failed to start demo mode. Please try again.');
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || (!phoneNumber.trim() && !email.trim());

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing['3xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="directions-car" size={32} color={Colors.textInverse} />
          </View>
          <Text style={styles.title}>Welcome to Humgo</Text>
          <Text style={styles.subtitle}>Enter your phone or email to continue</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={18} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇵🇰</Text>
                <Text style={styles.codeText}>+92</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="300 1234567"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setError(null);
                }}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.emailInputContainer}>
              <MaterialIcons name="mail-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.emailInput}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
              />
            </View>
          </View>

          {/* Password Input (shown when email is entered) */}
          {email.trim() !== '' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.emailInputContainer}>
                <MaterialIcons name="lock-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter password"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color={Colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Toggle Sign Up / Login */}
              <TouchableOpacity 
                style={styles.toggleAuthMode}
                onPress={() => setIsSignUp(!isSignUp)}
              >
                <Text style={styles.toggleAuthText}>
                  {isSignUp ? 'Already have an account? ' : 'New user? '}
                  <Text style={styles.toggleAuthLink}>
                    {isSignUp ? 'Log In' : 'Sign Up'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isButtonDisabled}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {email.trim() ? (isSignUp ? 'Sign Up' : 'Log In') : 'Continue'}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color={Colors.textInverse} />
            </>
          )}
        </TouchableOpacity>

        {/* Demo Mode Button */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={handleDemoMode}
          disabled={loading}
          activeOpacity={0.8}
        >
          <MaterialIcons name="play-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.demoButtonText}>Try Demo Mode</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: Spacing['2xl'],
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: Dimensions.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  flag: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  codeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Dimensions.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  emailInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  continueButton: {
    height: Dimensions.buttonHeight,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
    ...Shadows.md,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textInverse,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeightMedium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
  },
  toggleAuthMode: {
    marginTop: Spacing.sm,
    alignItems: 'flex-end',
  },
  toggleAuthText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  toggleAuthLink: {
    color: Colors.primary,
    fontWeight: Typography.fontWeightMedium,
  },
  demoButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
  },
  demoButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.primary,
  },
});
