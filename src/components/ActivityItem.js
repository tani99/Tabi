import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ActivityItem = ({
  activity,
  onEdit,
  onDelete,
  loading = false,
  style,
  testID,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  // Cleanup effect to track mounted state
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Format time range
  const getTimeRange = () => {
    if (!activity.startTime || !activity.endTime) return 'No time set';
    
    const start = new Date(activity.startTime);
    const end = new Date(activity.endTime);
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Handle edit button press
  const handleEdit = () => {
    if (onEdit && !loading && !isDeleting) {
      onEdit(activity);
    }
  };

  // Handle delete callback safely
  const handleDeleteCallback = useCallback(() => {
    if (isMounted.current && onDelete) {
      onDelete(activity.id);
    }
  }, [onDelete, activity.id]);

  // Handle delete button press with confirmation
  const handleDelete = () => {
    if (loading || isDeleting) return;

    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete "${activity.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            
            // Animate fade out
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              // Use setTimeout to defer the state update until after the animation and current render cycle
              setTimeout(handleDeleteCallback, 0);
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const timeRange = getTimeRange();

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
        isDeleting && styles.deleting,
        style,
      ]}
      testID={testID}
    >
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={handleEdit}
        activeOpacity={0.7}
        disabled={loading || isDeleting}
        accessibilityLabel={`Activity: ${activity.title}. Time: ${timeRange}. ${activity.notes ? `Notes: ${activity.notes}.` : ''} Double tap to edit.`}
        accessibilityRole="button"
        accessibilityHint="Double tap to edit this activity"
      >
        <View style={styles.card}>
          {/* Main content area */}
          <View style={styles.contentArea}>
            {/* Activity title */}
            <Text
              style={styles.title}
              numberOfLines={2}
              ellipsizeMode="tail"
              accessibilityRole="header"
            >
              {activity.title}
            </Text>
            
            {/* Time row */}
            <View style={styles.timeRow}>
              <View style={styles.timeContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.text.secondary}
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>{timeRange}</Text>
              </View>
            </View>
            
            {/* Notes (if any) */}
            {activity.notes && activity.notes.trim() && (
              <Text
                style={styles.notes}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {activity.notes.trim()}
              </Text>
            )}
          </View>
          
          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
              disabled={loading || isDeleting}
              accessibilityLabel="Edit activity"
              accessibilityRole="button"
              accessibilityHint="Edit this activity's details"
              testID={`${testID}-edit-button`}
            >
              <Ionicons
                name="pencil"
                size={16}
                color={colors.primary.main}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={loading || isDeleting}
              accessibilityLabel="Delete activity"
              accessibilityRole="button"
              accessibilityHint="Delete this activity"
              testID={`${testID}-delete-button`}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.status.error.main}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary.main} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  deleting: {
    opacity: 0.5,
  },
  cardTouchable: {
    borderRadius: 12,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  contentArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeIcon: {
    marginRight: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    flex: 1,
  },

  notes: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  editButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  deleteButton: {
    backgroundColor: colors.status.error.background,
    borderWidth: 1,
    borderColor: colors.status.error.border,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

});

export default ActivityItem;
