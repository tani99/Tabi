import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const ProfileInfoCard = ({ profile }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const InfoRow = ({ label, value, isEmail = false }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isEmail && styles.emailValue]} numberOfLines={1}>
        {value || 'Not set'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Information</Text>
      
      <InfoRow 
        label="Display Name" 
        value={profile?.displayName} 
      />
      
      <InfoRow 
        label="Email" 
        value={profile?.email} 
        isEmail={true}
      />
      
      <InfoRow 
        label="Account Created" 
        value={formatDate(profile?.creationTime)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  label: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  emailValue: {
    color: colors.primary.main,
  },
});

export default ProfileInfoCard;
