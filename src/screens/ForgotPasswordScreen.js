import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import ScreenTitle from '../components/layout/ScreenTitle';
import ScreenFooter from '../components/layout/ScreenFooter';
import StatusMessage from '../components/forms/StatusMessage';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import HelpText from '../components/ui/HelpText';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { resetPassword } from '../services/auth';
import { getUserFriendlyError } from '../utils/errorMessages';
import { colors } from '../theme/colors';
import app from '../config/firebase';
const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(''); // 'success', 'error', ''

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (errorCode) => {
    return getUserFriendlyError(errorCode, 'password-reset');
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setStatus('');
    setErrors({});

    try {
      console.log('Attempting to reset password for:', email);
      // TODO: Update Firebase project references for Tabi production
      // Log Firebase config details from the initialized app to avoid hardcoding
      
      console.log('Firebase config check:', {
        authDomain: app.options.authDomain,
        projectId: app.options.projectId
      });
      
      const result = await resetPassword(email);
      
      if (result.success) {
        setStatus('success');
        console.log('Password reset email sent successfully');
        Alert.alert(
          'Reset Link Sent! 📧',
          'We\'ve sent a password reset link to your email. Please check your inbox (and spam folder) for instructions.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Login') 
            }
          ]
        );
      } else {
        setStatus('error');
        const errorMessage = result.error?.message || getErrorMessage(result.error?.code || result.error);
        console.error('Password reset failed:', result.error);
        Alert.alert('Reset Failed', errorMessage);
      }
    } catch (error) {
      setStatus('error');
      console.error('Unexpected error during password reset:', error);
      Alert.alert('Error', getUserFriendlyError(error, 'password-reset'));
    } finally {
      setLoading(false);
    }
  };

  const clearStatus = () => {
    setStatus('');
    setErrors({});
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <ScreenHeader navigation={navigation} />

      {/* Title */}
      <ScreenTitle 
        title="Reset Password"
        subtitle="Enter your email to receive reset link"
      />

      {/* Status Messages */}
      <StatusMessage
        type={status}
        message={
          status === 'success' 
            ? 'Reset link sent! Check your email.'
            : status === 'error'
            ? 'Failed to send reset link. Please try again.'
            : null
        }
      />

      {/* Form */}
      <View style={styles.formContainer}>
        <CustomInput
          label="Email Address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearStatus();
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          editable={!loading}
        />

        <CustomButton
          title={loading ? "Sending..." : "Send Reset Link"}
          onPress={handleResetPassword}
          loading={loading}
          style={styles.resetButton}
          disabled={loading}
        />

        {loading && (
          <LoadingIndicator 
            message="Sending reset link to your email..."
          />
        )}
      </View>

      {/* Help Text */}
      <HelpText 
        text="Don't see the email? Check your spam folder or try again."
      />

      {/* Footer */}
      <ScreenFooter
        text="Remember password?"
        linkText="Back to Sign In"
        onLinkPress={() => navigation.navigate('Login')}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 40,
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
    lineHeight: 24,
  },

  formContainer: {
    flex: 1,
  },
  resetButton: {
    marginTop: 24,
  },

});

export default ForgotPasswordScreen;
