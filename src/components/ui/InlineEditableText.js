import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const InlineEditableText = ({
  value = '',
  onSave,
  placeholder = 'Enter text...',
  isEditMode = false,
  isEditing = false,
  onEditStart,
  onEditCancel,
  style,
  textStyle,
  inputStyle,
  maxLength,
  multiline = false,
  autoFocus = false,
  ...props
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use a longer delay to ensure the input is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isEditing]);

  const handleEditStart = () => {
    if (!isEditMode) return;
    setEditValue(value);
    setError(null);
    onEditStart?.();
  };

  const handleEditCancel = () => {
    setEditValue(value);
    setError(null);
    onEditCancel?.();
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    // Don't save if value hasn't changed
    if (editValue === value) {
      onEditCancel?.();
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(editValue);
      onEditCancel?.();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      Alert.alert('Error', err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !multiline) {
      handleSave();
    }
  };

  const handleBlur = () => {
    // Don't auto-save on blur - let user explicitly save
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

  // Show input when editing
  if (isEditing) {
    return (
      <View style={[styles.container, style]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          value={editValue}
          onChangeText={setEditValue}
          placeholder={placeholder}
          multiline={multiline}
          maxLength={maxLength}
          onKeyPress={handleKeyPress}
          autoFocus={autoFocus}
          {...props}
        />
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show text when not editing
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handleEditStart}
      disabled={!isEditMode}
      activeOpacity={isEditMode ? 0.7 : 1}
    >
      <Text style={[styles.text, textStyle]} numberOfLines={multiline ? undefined : 1}>
        {value || placeholder}
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
  text: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 0,
    borderRadius: 6,
    minHeight: 32,
  },
  editIcon: {
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  saveButton: {
    padding: 6,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
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

export default InlineEditableText;
