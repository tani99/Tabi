import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '../CustomButton';
import { colors } from '../../theme/colors';

const TripDatePicker = ({
  label,
  value,
  onChange,
  minimumDate = new Date(),
  maximumDate = null,
  error = null,
  style,
  disabled = false
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const formatDate = (date) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setLocalValue(selectedDate);
      onChange(selectedDate);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const getButtonStyle = () => {
    if (disabled) {
      return [styles.dateButton, styles.dateButtonDisabled];
    }
    if (error) {
      return [styles.dateButton, styles.dateButtonError];
    }
    return styles.dateButton;
  };

  const getTextStyle = () => {
    if (disabled) {
      return [styles.dateButtonText, styles.dateButtonTextDisabled];
    }
    if (error) {
      return [styles.dateButtonText, styles.dateButtonTextError];
    }
    return styles.dateButtonText;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <CustomButton
        title={formatDate(localValue)}
        onPress={handlePress}
        variant="outline"
        style={getButtonStyle()}
        textStyle={getTextStyle()}
        disabled={disabled}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {showPicker && (
        <DateTimePicker
          value={localValue || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  dateButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  dateButtonDisabled: {
    backgroundColor: colors.input.disabled,
    borderColor: colors.input.borderDisabled,
  },
  dateButtonError: {
    borderColor: colors.error.border,
  },
  dateButtonText: {
    textAlign: 'left',
  },
  dateButtonTextDisabled: {
    color: colors.text.disabled,
  },
  dateButtonTextError: {
    color: colors.error.text,
  },
  errorText: {
    color: colors.error.text,
    fontSize: 14,
    marginTop: 4,
  },
});

export default TripDatePicker;
