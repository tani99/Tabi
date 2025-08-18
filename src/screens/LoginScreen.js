import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import ScreenFooter from '../components/layout/ScreenFooter';
import FormDivider from '../components/forms/FormDivider';
import AuthErrorDisplay from '../components/forms/AuthErrorDisplay';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import HelpText from '../components/ui/HelpText';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import GmailButton from '../components/GmailButton';
import { loginWithEmail } from '../services/auth';
import { getUserFriendlyError } from '../utils/errorMessages';
import { colors } from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setAuthError(''); // Clear any previous errors
    
    try {
      console.log('Attempting to login with:', { email, password: '***' });
      const result = await loginWithEmail(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Navigation will be handled by AuthContext
        console.log('Login successful - user should be redirected to Home');
      } else {
        // Use the user-friendly error message from the service
        setAuthError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(getUserFriendlyError(error, 'login'));
    } finally {
      setLoading(false);
    }
  };

  const handleGmailLogin = async () => {
    // Gmail sign-in is currently disabled - coming soon
    Alert.alert('Coming Soon', 'Gmail sign-in will be available in a future update!');
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <ScreenHeader navigation={navigation} />

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {/* Gmail Button */}
      <GmailButton
        onPress={handleGmailLogin}
        style={styles.gmailButton}
      />

      {/* Divider */}
      <FormDivider />

      {/* Email/Password Form */}
      <View style={styles.formContainer}>
        <CustomInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <CustomInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <AuthErrorDisplay error={authError} />

        <CustomButton
          title="Sign In"
          onPress={handleEmailLogin}
          loading={loading}
          style={styles.signInButton}
        />

        {loading && (
          <LoadingIndicator 
            message="Signing you in..."
          />
        )}
      </View>

      {/* Help Text */}
      <HelpText 
        text="Gmail sign-in coming soon! Use your email and password below to sign in."
        icon="⚡"
      />

      {/* Footer */}
      <ScreenFooter
        text="Don't have an account?"
        linkText="Create Account"
        onLinkPress={() => navigation.navigate('Register')}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  gmailButton: {
    marginBottom: 24,
  },

  formContainer: {
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    marginBottom: 24,
  },


});

export default LoginScreen;
