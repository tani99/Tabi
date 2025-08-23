import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import CustomInput from '../CustomInput';
import TripDatePicker from './TripDatePicker';
import { TRIP_VALIDATION, DEFAULT_TRIP } from '../../utils/tripConstants';

const TripEditForm = forwardRef(({ 
  initialData = DEFAULT_TRIP,
  onSubmit, 
  loading = false, 
  error = null,
  style 
}, ref) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset form when initialData changes
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  const validateField = (field, value) => {
    const validation = TRIP_VALIDATION[field];
    if (!validation) return '';

    // Check required fields
    if (validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Skip validation for empty optional fields
    if (!validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return '';
    }

    // Check string length constraints
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${validation.maxLength} characters`;
      }
    }

    // Check date constraints
    if (field === 'startDate' || field === 'endDate') {
      if (value && !(value instanceof Date)) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be a valid date`;
      }
    }

    // Check date range logic
    if (field === 'endDate' && formData.startDate && value) {
      if (value <= formData.startDate) {
        return 'End date must be after start date';
      }
    }

    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(TRIP_VALIDATION).forEach(field => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        newErrors[field] = fieldError;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(TRIP_VALIDATION).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  const shouldShowError = (field) => {
    return touched[field] && errors[field];
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    validate: validateForm,
    getData: () => formData,
    setData: setFormData
  }), [formData, validateForm]);

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.formContent}>
        <CustomInput
          label="Trip Name"
          value={formData.name}
          onChangeText={(value) => handleFieldChange('name', value)}
          onBlur={() => handleFieldBlur('name')}
          placeholder="Enter trip name"
          error={shouldShowError('name') ? errors.name : null}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <CustomInput
          label="Location"
          value={formData.location}
          onChangeText={(value) => handleFieldChange('location', value)}
          onBlur={() => handleFieldBlur('location')}
          placeholder="Enter destination"
          error={shouldShowError('location') ? errors.location : null}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TripDatePicker
          label="Start Date"
          value={formData.startDate}
          onChange={(value) => handleFieldChange('startDate', value)}
          error={shouldShowError('startDate') ? errors.startDate : null}
          minimumDate={new Date()}
        />

        <TripDatePicker
          label="End Date"
          value={formData.endDate}
          onChange={(value) => handleFieldChange('endDate', value)}
          error={shouldShowError('endDate') ? errors.endDate : null}
          minimumDate={formData.startDate || new Date()}
        />

        <CustomInput
          label="Description (Optional)"
          value={formData.description}
          onChangeText={(value) => handleFieldChange('description', value)}
          onBlur={() => handleFieldBlur('description')}
          placeholder="Enter trip description"
          error={shouldShowError('description') ? errors.description : null}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.descriptionInput}
        />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: colors.error.background,
    borderColor: colors.error.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error.text,
    fontSize: 14,
    textAlign: 'center',
  },
  formContent: {
    flex: 1,
  },
  descriptionInput: {
    minHeight: 100,
    paddingTop: 16,
  },
});

export default TripEditForm;
