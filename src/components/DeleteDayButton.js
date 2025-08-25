import React from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const DeleteDayButton = ({ 
  onDelete, 
  dayNumber, 
  totalDays, 
  isSelected = false,
  disabled = false,
  style 
}) => {
  const handlePress = () => {
    if (disabled) return;

    Alert.alert(
      'Delete Day',
      `Are you sure you want to delete Day ${dayNumber}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(dayNumber),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        disabled && styles.disabled,
        style
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={`delete-day-button-${dayNumber}`}
    >
      <Ionicons 
        name="trash-outline" 
        size={16} 
        color={disabled ? colors.text.disabled : colors.text.secondary} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  selected: {
    backgroundColor: colors.error.light,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default DeleteDayButton;
