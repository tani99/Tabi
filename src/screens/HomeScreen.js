import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import CustomButton from '../components/CustomButton';
import { logout } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <ScreenHeader 
        navigation={navigation}
        title="Tabi"
        showBackButton={false}
        rightElement={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.icon.logout} />
          </TouchableOpacity>
        }
      />

      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeIcon}>
          <Ionicons name="checkmark-circle" size={64} color={colors.icon.success} />
        </View>
        <Text style={styles.welcomeTitle}>Welcome to Tabi!</Text>
        <Text style={styles.welcomeSubtitle}>
          Ready to plan your next adventure?
        </Text>
        {user?.email && (
          <Text style={styles.userEmail}>{user.email}</Text>
        )}
      </View>

      {/* Content Placeholder */}
      <View style={styles.contentPlaceholder}>
        <Ionicons name="airplane-outline" size={48} color={colors.icon.secondary} />
        <Text style={styles.placeholderTitle}>Plan Your Trip</Text>
        <Text style={styles.placeholderText}>
          Create itineraries, discover destinations, and organize your travel plans all in one place.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <CustomButton
          title="Create New Trip"
          onPress={() => console.log('Create new trip')}
          style={styles.actionButton}
        />
        <CustomButton
          title="View My Trips"
          variant="secondary"
          onPress={() => console.log('View trips')}
          style={styles.actionButton}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    padding: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '500',
  },
  contentPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionContainer: {
    paddingBottom: 20,
  },
  actionButton: {
    marginBottom: 16,
  },
});

export default HomeScreen;
