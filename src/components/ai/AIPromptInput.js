import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

/**
 * AIPromptInput - Text input component for trip description with suggestions
 * Specialized input for AI prompts with character limit and validation
 */
const AIPromptInput = ({ 
  label,
  value,
  onChangeText,
  placeholder,
  error,
  maxLength = 500,
  style,
  testID = 'ai-prompt-input'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Suggestion prompts to help users get started
  const suggestions = [
    "I want a romantic getaway with fine dining and spa experiences",
    "Looking for family-friendly activities and educational experiences", 
    "Adventure trip with hiking, outdoor activities, and local culture",
    "Food tour focusing on local cuisine and cooking classes",
    "Historical and cultural exploration with museums and landmarks",
    "Relaxing beach vacation with water sports and sunset views"
  ];

  const handleFocus = () => {
    setIsFocused(true);
    if (!value.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionPress = (suggestion) => {
    onChangeText(suggestion);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    onChangeText('');
    setShowSuggestions(true);
  };

  const inputStyle = [
    styles.textInput,
    isFocused && styles.textInputFocused,
    error && styles.textInputError,
    style
  ];

  const containerStyle = [
    styles.container,
    error && styles.containerError
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.input.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={maxLength}
          testID={testID}
        />
        
        {/* Clear button */}
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearInput}
            testID="clear-input-button"
          >
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}

        {/* Suggestions icon */}
        {!value.trim() && (
          <TouchableOpacity
            style={styles.suggestionsButton}
            onPress={() => setShowSuggestions(!showSuggestions)}
            testID="suggestions-button"
          >
            <Ionicons 
              name="bulb-outline" 
              size={20} 
              color={colors.primary.main} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Character counter */}
      <View style={styles.counterContainer}>
        <Text style={[
          styles.characterCounter,
          value.length > maxLength * 0.9 && styles.characterCounterWarning,
          value.length >= maxLength && styles.characterCounterError
        ]}>
          {value.length}/{maxLength}
        </Text>
      </View>

      {/* Error message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Ionicons name="bulb" size={16} color={colors.primary.main} />
            <Text style={styles.suggestionsTitle}>Suggestion prompts:</Text>
          </View>
          
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
              testID={`suggestion-${index}`}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
              <Ionicons 
                name="add-circle-outline" 
                size={16} 
                color={colors.primary.main} 
              />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.hideSuggestionsButton}
            onPress={() => setShowSuggestions(false)}
          >
            <Text style={styles.hideSuggestionsText}>Hide suggestions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  containerError: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.input.text,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 44, // Space for clear/suggestions button
    fontSize: 16,
    color: colors.input.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textInputFocused: {
    borderColor: colors.primary.main,
    backgroundColor: colors.input.backgroundFocused || colors.input.background,
  },
  textInputError: {
    borderColor: colors.input.borderError,
    backgroundColor: colors.status.error.background,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  suggestionsButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCounter: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 4,
  },
  characterCounterWarning: {
    color: colors.status.warning.main,
  },
  characterCounterError: {
    color: colors.status.error.main,
    fontWeight: '600',
  },
  errorText: {
    color: colors.status.error.main,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  suggestionsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 4,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  hideSuggestionsButton: {
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  hideSuggestionsText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});

export default AIPromptInput;
