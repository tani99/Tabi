import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import ProfileAvatar from './ProfileAvatar';

const ProfileHeader = ({ profile, onEditPress }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <ProfileAvatar 
        photoURL={profile?.photoURL} 
        size={80} 
        style={styles.avatar}
      />
      <Text style={styles.displayName}>
        {profile?.displayName || 'User'}
      </Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <Text style={styles.memberSince}>
        Member since {formatDate(profile?.creationTime)}
      </Text>
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileHeader;
