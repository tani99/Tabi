import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';

const InlineEditableDate = ({
  value = null,
  onSave,
  placeholder = 'Select date...',
  isEditMode = false,
  isEditing = false,
  onEditStart,
  onEditCancel,
  style,
  textStyle,
  formatDate = (date) => date.toLocaleDateString(),
  minDate,
  maxDate,
  mode = 'date',
  ...props
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value ? new Date(value) : null);
  }, [value]);

  const handleEditStart = () => {
    if (!isEditMode) return;
    setEditValue(value ? new Date(value) : null);
    setError(null);
    setShowPicker(false); // Clear any previous picker state
    onEditStart?.();
    // Show date picker immediately when entering edit mode
    setTimeout(() => {
      setShowPicker(true);
    }, 100);
  };

  const handleEditCancel = () => {
    setEditValue(value ? new Date(value) : null);
    setError(null);
    onEditCancel?.();
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    // Don't save if value hasn't changed
    if (editValue === value) {
      setShowPicker(false);
      onEditCancel?.();
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(editValue);
      setShowPicker(false);
      onEditCancel?.();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      Alert.alert('Error', err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      // Only hide picker if user dismisses it, not when selecting a date
      setShowPicker(false);
      onEditCancel?.();
      return;
    }

    if (selectedDate) {
      setEditValue(selectedDate);
      // Keep picker visible after date selection
      // User must click save to confirm
    }
  };

  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      setShowPicker(true);
    } else {
      // For iOS, we'll show the picker inline
      setShowPicker(true);
    }
  };

  // Show loading state
  if (isSaving) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
          <Text style={[styles.loadingText, textStyle]}>Saving...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={[styles.errorText, textStyle]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSave}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show date picker when editing
  if (isEditing) {
    return (
      <View style={[styles.editingContainer, style]}>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={showDatePicker}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={20} color={colors.primary.main} />
            <Text style={[styles.dateText, textStyle]}>
              {editValue ? formatDate(editValue) : placeholder}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={editValue ? new Date(editValue) : new Date()}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
            {...props}
          />
        )}
      </View>
    );
  }

  // Show date when not editing
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handleEditStart}
      disabled={!isEditMode}
      activeOpacity={isEditMode ? 0.7 : 1}
    >
      <Ionicons 
        name="calendar-outline" 
        size={16} 
        color={colors.text.secondary} 
        style={styles.calendarIcon}
      />
      <Text style={[styles.text, textStyle]} numberOfLines={1}>
        {value ? formatDate(value) : placeholder}
      </Text>
      {isEditMode && (
        <Ionicons 
          name="create-outline" 
          size={16} 
          color={colors.text.secondary} 
          style={styles.editIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  editingContainer: {
    flex: 1,
    minHeight: 24,
  },
  text: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    marginLeft: 8,
  },
  calendarIcon: {
    marginRight: 4,
  },
  editIcon: {
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.focus,
    borderRadius: 8,
    minHeight: 48,
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  saveButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.error,
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 12,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});

export default InlineEditableDate;
