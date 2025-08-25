import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useEditMode } from '../../context/EditModeContext';
import InlineEditableTextArea from '../ui/InlineEditableTextArea';

const TripDescription = ({ trip, onUpdate }) => {
  const { isEditMode, markUnsavedChanges } = useEditMode();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Individual editing state for description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const MAX_CHARACTERS = 150;
  const description = trip?.description || '';
  const hasDescription = description.trim().length > 0;
  const needsExpansion = description.length > MAX_CHARACTERS;
  
  const getDisplayText = () => {
    if (!hasDescription) return null;
    
    if (needsExpansion && !isExpanded) {
      return description.substring(0, MAX_CHARACTERS) + '...';
    }
    
    return description;
  };

  const handleDescriptionSave = async (newDescription) => {
    try {
      await onUpdate({ description: newDescription });
      markUnsavedChanges();
      setIsEditingDescription(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDescriptionEditStart = () => {
    setIsEditingDescription(true);
  };

  const handleDescriptionEditCancel = () => {
    setIsEditingDescription(false);
  };

  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* View Mode - Nice Description Display */}
      {!isEditMode && (
        <>
          {hasDescription ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {getDisplayText()}
              </Text>
              
              {needsExpansion && (
                <TouchableOpacity 
                  style={styles.expandButton} 
                  onPress={handleToggleExpansion}
                >
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No description added yet</Text>
              <Text style={styles.emptySubtext}>
                Add details about your trip plans, activities, or notes
              </Text>
            </View>
          )}
        </>
      )}

      {/* Edit Mode - Card Style Edit Box */}
      {isEditMode && (
        <View style={styles.editModeContainer}>
          <Text style={styles.editFieldLabel}>Description</Text>
          <InlineEditableTextArea
            value={description}
            onSave={handleDescriptionSave}
            isEditMode={isEditMode}
            isEditing={isEditingDescription}
            onEditStart={handleDescriptionEditStart}
            onEditCancel={handleDescriptionEditCancel}
            placeholder="Add details about your trip plans, activities, or notes..."
            maxLength={500}
            showCharacterCount={true}
            style={styles.editableField}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  descriptionContainer: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  editModeContainer: {
    marginBottom: 0,
  },
  editFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  editableField: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
});

export default TripDescription;
