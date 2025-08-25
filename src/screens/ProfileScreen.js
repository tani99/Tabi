import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { colors } from '../theme/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { profile, loading, error, refreshProfile } = useProfile();

  // Add navigation listener to refresh profile when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh profile when screen comes into focus
      refreshProfile();
    });

    return unsubscribe;
  }, [navigation, refreshProfile]);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleRetry = () => {
    refreshProfile();
  };

  if (loading) {
    return (
      <ScreenLayout>
        <ScreenHeader 
          navigation={navigation}
          title="Profile"
          showBackButton={true}
        />
        <LoadingIndicator message="Loading profile..." />
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout>
        <ScreenHeader 
          navigation={navigation}
          title="Profile"
          showBackButton={true}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading profile: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScreenHeader 
        navigation={navigation}
        title="Profile"
        showBackButton={true}
      />
      <ProfileHeader profile={profile} onEditPress={handleEditProfile} />
      <ProfileInfoCard profile={profile} />
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.status.error.background,
  },
  logoutText: {
    fontSize: 16,
    color: colors.status.error.main,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ProfileScreen;
