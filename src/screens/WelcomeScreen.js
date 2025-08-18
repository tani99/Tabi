import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenTitle from '../components/layout/ScreenTitle';
import CustomButton from '../components/CustomButton';
import { colors } from '../theme/colors';

const WelcomeScreen = ({ navigation }) => {
  return (
    <ScreenLayout contentContainerStyle={styles.content}>
      {/* Logo/Icon Placeholder */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>✈️</Text>
        </View>
      </View>

      {/* Welcome Text */}
      <ScreenTitle 
        title="Welcome to Tabi"
        subtitle="Your personal travel planning companion"
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
        containerStyle={styles.textContainer}
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Get Started"
          onPress={() => navigation.navigate('Register')}
          style={styles.primaryButton}
        />
        
        <View style={styles.dividerContainer}>
          <Text style={styles.dividerText}>Already have an account?</Text>
        </View>
        
        <CustomButton
          title="Sign In"
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
          style={styles.secondaryButton}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 8,
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});

export default WelcomeScreen;
