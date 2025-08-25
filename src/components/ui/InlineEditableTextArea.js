import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const InlineEditableTextArea = ({
  value = '',
  onSave,
  placeholder = 'Enter description...',
  isEditMode = false,
  isEditing = false,
  onEditStart,
  onEditCancel,
  style,
  textStyle,
  inputStyle,
  maxLength = 500,
  minLines = 2,
  maxLines = 6,
  showCharacterCount = true,
  autoFocus = false,
  ...props
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isEditing, autoFocus]);

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

  const handleBlur = () => {
    // Don't auto-save on blur for text area since we have explicit save/cancel buttons
    // This prevents accidental saves when user taps outside
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getDisplayText = () => {
    if (!value) return placeholder;
    
    if (isExpanded || value.length <= 100) {
      return value;
    }
    
    return value.substring(0, 100) + '...';
  };

  const getCharacterCountColor = () => {
    const percentage = (editValue.length / maxLength) * 100;
    if (percentage >= 90) return colors.error;
    if (percentage >= 75) return colors.status.warning.main;
    return colors.text.secondary;
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
      <View style={[styles.editingContainer, style]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          value={editValue}
          onChangeText={setEditValue}
          placeholder={placeholder}
          multiline={true}
          numberOfLines={minLines}
          maxLength={maxLength}
          autoFocus={autoFocus}
          textAlignVertical="top"
          {...props}
        />
        
        <View style={styles.editFooter}>
          {showCharacterCount && (
            <Text style={[styles.characterCount, { color: getCharacterCountColor() }]}>
              {editValue.length}/{maxLength}
            </Text>
          )}
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
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
      <View style={styles.textContainer}>
        <Text style={[styles.text, textStyle]} numberOfLines={isExpanded ? undefined : 3}>
          {getDisplayText()}
        </Text>
        
        {value && value.length > 100 && (
          <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded}>
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Show less' : 'Show more'}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={colors.primary.main} 
            />
          </TouchableOpacity>
        )}
      </View>
      
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
    alignItems: 'flex-start',
    minHeight: 24,
  },
  editingContainer: {
    flex: 1,
    minHeight: 24,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  editIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.focus,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    padding: 8,
    backgroundColor: 'transparent',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
    marginRight: 4,
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

export default InlineEditableTextArea;
