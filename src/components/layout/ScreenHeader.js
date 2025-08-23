import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import ContextMenu from '../ui/ContextMenu';

const ScreenHeader = ({ 
  navigation,
  title,
  showBackButton = true,
  rightElement,
  onBackPress,
  style,
  titleStyle,
  // Edit mode props
  showEditButton = false,
  isEditMode = false,
  onEditToggle,
  isSaving = false,
  hasUnsavedChanges = false,
  // Title editing props
  isTitleEditable = false,
  onTitleEdit,
  // Context menu props
  showContextMenu = false,
  contextMenuActions = [],
  onContextMenuAction,
  ...props 
}) => {
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(title || '');

  React.useEffect(() => {
    setTitleValue(title || '');
  }, [title]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleTitleEdit = () => {
    if (!isEditMode || !isTitleEditable) return;
    setEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue !== title && onTitleEdit) {
      onTitleEdit(titleValue.trim());
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleValue(title || '');
    setEditingTitle(false);
  };

  const renderTitle = () => {
    if (!title) return null;

    if (editingTitle) {
      return (
        <View style={styles.titleEditContainer}>
          <TextInput
            value={titleValue}
            onChangeText={setTitleValue}
            style={[styles.title, styles.titleInput, titleStyle]}
            placeholder="Enter trip name"
            placeholderTextColor={colors.text.tertiary}
            autoFocus={true}
            onBlur={handleTitleSave}
            onSubmitEditing={handleTitleSave}
            returnKeyType="done"
          />
          <View style={styles.titleEditActions}>
            <TouchableOpacity style={styles.titleEditButton} onPress={handleTitleSave}>
              <Ionicons name="checkmark" size={14} color={colors.status.success.main} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.titleEditButton} onPress={handleTitleCancel}>
              <Ionicons name="close" size={14} color={colors.status.error.main} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.titleContainer} 
        onPress={handleTitleEdit}
        disabled={!isEditMode || !isTitleEditable}
      >
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {isEditMode && isTitleEditable && (
          <Ionicons name="create-outline" size={14} color={colors.text.tertiary} style={styles.titleEditIcon} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEditButton = () => {
    if (!showEditButton) return null;

    return (
      <View style={styles.editButtonContainer}>
        <TouchableOpacity 
          testID="edit-button"
          style={[
            styles.editButton, 
            isEditMode && styles.editButtonActive,
            hasUnsavedChanges && styles.editButtonUnsaved
          ]} 
          onPress={onEditToggle}
          disabled={isSaving}
        >
          <Ionicons 
            name={isEditMode ? "checkmark" : "create"} 
            size={22} 
            color={colors.primary.main} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderContextMenu = () => {
    if (!showContextMenu) return null;

    return (
      <ContextMenu
        trigger={({ onPress, ref }) => (
          <TouchableOpacity
            ref={ref}
            style={styles.contextMenuButton}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.primary.main} />
          </TouchableOpacity>
        )}
        actions={contextMenuActions}
        onActionPress={onContextMenuAction}
        position="bottom-right"
      />
    );
  };

  return (
    <View style={[styles.header, style]} {...props}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            testID="back-button"
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={colors.icon.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleSection}>
        {renderTitle()}
      </View>

      <View style={styles.rightSection}>
        <View style={styles.rightButtons}>
          {renderEditButton()}
          {renderContextMenu()}
        </View>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
    minHeight: 44,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 2,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  editButtonContainer: {
    position: 'relative',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonActive: {
    // No special styling for active state since we're removing backgrounds
  },
  editButtonUnsaved: {
    // Visual indication for unsaved changes
  },
  unsavedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  contextMenuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingVertical: 0,
  },
  titleEditActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  titleEditButton: {
    padding: 4,
  },
  titleEditIcon: {
    marginLeft: 8,
  },
});

export default ScreenHeader;
