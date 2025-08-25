import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const ProfileActionsCard = ({ onLogout }) => {
  const ActionButton = ({ title, onPress, icon, isDestructive = false }) => (
    <TouchableOpacity 
      style={[
        styles.actionButton,
        isDestructive && styles.destructiveButton
      ]} 
      onPress={onPress}
    >
      <View style={styles.actionContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[
          styles.actionText,
          isDestructive && styles.destructiveText
        ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actions</Text>
      
      <ActionButton
        title="Logout"
        onPress={onLogout}
        icon={<Text style={styles.iconText}>🚪</Text>}
        isDestructive={true}
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
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: colors.status.error.background,
  },
  destructiveText: {
    color: colors.status.error.main,
  },
  iconText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: 16,
  },
});

export default ProfileActionsCard;
