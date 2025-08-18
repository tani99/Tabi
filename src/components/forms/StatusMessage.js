import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const StatusMessage = ({ 
  type, // 'success' or 'error'
  message,
  style,
  textStyle,
  containerStyle 
}) => {
  if (!type || !message) {
    return null;
  }

  const isSuccess = type === 'success';
  const iconName = isSuccess ? 'checkmark-circle' : 'alert-circle';
  const iconColor = isSuccess ? colors.status.success.light : colors.status.error.light;

  return (
    <View style={[
      styles.statusContainer, 
      isSuccess ? styles.successContainer : styles.errorContainer,
      containerStyle,
      style
    ]}>
      <Ionicons name={iconName} size={20} color={iconColor} />
      <Text style={[
        styles.statusText,
        isSuccess ? styles.successText : styles.errorText,
        textStyle
      ]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successContainer: {
    backgroundColor: colors.status.success.background,
    borderColor: colors.status.success.border,
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: colors.status.error.background,
    borderColor: colors.status.error.border,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  successText: {
    color: colors.status.success.light,
  },
  errorText: {
    color: colors.status.error.light,
  },
});

export default StatusMessage;
