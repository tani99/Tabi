import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const AddDayButton = ({ 
  onPress, 
  disabled = false, 
  loading = false,
  style,
  testID = 'add-day-button'
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      <Ionicons 
        name="add-circle-outline" 
        size={20} 
        color={disabled ? colors.text.disabled : colors.primary.main} 
      />
      <Text style={[
        styles.text,
        disabled && styles.textDisabled
      ]}>
        Add Day
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  disabled: {
    borderColor: colors.text.disabled,
    backgroundColor: colors.background.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    marginLeft: 8,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
});

export default AddDayButton;
