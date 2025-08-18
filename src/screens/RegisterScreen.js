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
import { registerWithEmail } from '../services/auth';
import { getUserFriendlyError } from '../utils/errorMessages';
import ScreenTitle from '../components/layout/ScreenTitle';
import { colors } from '../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }
    
    if (!email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Please create a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please try again';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setAuthError(''); // Clear any previous errors
    
    try {
      console.log('Attempting to register with:', { email, password: '***' });
      const result = await registerWithEmail(email, password);
      console.log('Registration result:', result);
      
      if (result.success) {
        Alert.alert(
          'Success! 🎉', 
          'Account created successfully! You can now sign in with your email and password.', 
          [
            { 
              text: 'Sign In Now', 
              onPress: () => navigation.navigate('Login') 
            }
          ]
        );
      } else {
        // Use the user-friendly error message from the service
        setAuthError(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(getUserFriendlyError(error, 'registration'));
    } finally {
      setLoading(false);
    }
  };

  const handleGmailRegister = async () => {
    // Gmail sign-in is currently disabled - coming soon
    Alert.alert('Coming Soon', 'Gmail sign-in will be available in a future update!');
  };

  return (
    <ScreenLayout scrollable contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <ScreenHeader navigation={navigation} />

      {/* Title */}
      <ScreenTitle 
        title="Create Account"
        subtitle="Join TravelPlanner and start your adventure"
      />

      {/* Gmail Button */}
      <GmailButton
        onPress={handleGmailRegister}
        style={styles.gmailButton}
      />

      {/* Divider */}
      <FormDivider />

      {/* Registration Form */}
      <View style={styles.formContainer}>
        <CustomInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          autoCapitalize="words"
          error={errors.fullName}
        />

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
          placeholder="Create a password"
          secureTextEntry
          error={errors.password}
        />

        <CustomInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
          error={errors.confirmPassword}
        />

        <AuthErrorDisplay error={authError} />

        <CustomButton
          title="Create Account"
          onPress={handleEmailRegister}
          loading={loading}
          style={styles.createAccountButton}
        />

        {loading && (
          <LoadingIndicator 
            message="Creating your account..."
          />
        )}
      </View>

      {/* Help Text */}
      <HelpText 
        text="Password must be at least 6 characters long. Use a mix of letters and numbers for better security."
        icon="🔒"
      />

      {/* Footer */}
      <ScreenFooter
        text="Already have an account?"
        linkText="Sign In"
        onLinkPress={() => navigation.navigate('Login')}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
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
    marginBottom: 20,
  },
  createAccountButton: {
    marginTop: 16,
    marginBottom: 24,
  },
});

export default RegisterScreen;
