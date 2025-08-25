import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import LoadingIndicator from './LoadingIndicator';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const EditableCard = ({
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  loading = false,
  error = null,
  editable = true,
  title = '',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (isEditing) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isEditing, scaleAnim, opacityAnim]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        isEditing && styles.editingContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      {/* Header with title and edit icon */}
      <View style={styles.header}>
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
        {editable && !isEditing && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Content area */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Edit mode controls */}
      {isEditing && (
        <Animated.View 
          style={styles.editControls}
        >
          <TouchableOpacity 
            onPress={onCancel} 
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onSave} 
            style={[styles.button, styles.saveButton]}
            disabled={loading}
          >
            {loading ? (
              <LoadingIndicator size="small" color={colors.background.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Error display */}
      {error && (
        <Animated.View 
          style={styles.errorContainer}
        >
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editingContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  editControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonText: {
    color: colors.background.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.status.error.background,
    borderWidth: 1,
    borderColor: colors.status.error.border,
    borderRadius: 8,
  },
  errorText: {
    color: colors.status.error.main,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EditableCard;
