import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import ProfileHeader from './ProfileHeader';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileActionsCard from './ProfileActionsCard';

const ProfileExample = () => {
  // Mock profile data for demonstration
  const mockProfile = {
    uid: 'example-uid',
    email: 'user@example.com',
    displayName: 'John Doe',
    photoURL: null,
    emailVerified: true,
    creationTime: '2023-01-15T10:30:00.000Z',
    lastSignInTime: '2023-12-15T14:45:00.000Z',
  };

  const handleEditPress = () => {
    console.log('Edit profile pressed');
  };

  const handleLogout = () => {
    console.log('Logout pressed');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
  };

  const handleHelp = () => {
    console.log('Help pressed');
  };

  const handleAbout = () => {
    console.log('About pressed');
  };

  return (
    <View style={styles.container}>
      <ProfileHeader 
        profile={mockProfile} 
        onEditPress={handleEditPress} 
      />
      <ProfileInfoCard profile={mockProfile} />
      <ProfileActionsCard 
        onLogout={handleLogout}
        onSettings={handleSettings}
        onHelp={handleHelp}
        onAbout={handleAbout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: 16,
  },
});

export default ProfileExample;
