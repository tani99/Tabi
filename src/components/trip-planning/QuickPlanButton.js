import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

/**
 * QuickPlanButton - Entry point for AI trip planning
 * Styled button that matches Tabi design system with loading and disabled states
 */
const QuickPlanButton = ({ 
  onPress, 
  loading = false, 
  disabled = false, 
  style,
  testID = 'quick-plan-button'
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDisabled && styles.containerDisabled,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {loading ? (
            <Ionicons 
              name="reload" 
              size={24} 
              color={isDisabled ? colors.text.disabled : colors.primary.main}
              style={loading && styles.loadingIcon}
            />
          ) : (
            <Ionicons 
              name="sparkles" 
              size={24} 
              color={isDisabled ? colors.text.disabled : colors.primary.main}
            />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            isDisabled && styles.titleDisabled
          ]}>
            {loading ? 'Planning...' : 'Plan with AI'}
          </Text>
          <Text style={[
            styles.subtitle,
            isDisabled && styles.subtitleDisabled
          ]}>
            {loading 
              ? 'Generating your perfect trip...' 
              : 'Let AI create a personalized itinerary for you'
            }
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDisabled ? colors.text.disabled : colors.text.secondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary.light,
    borderStyle: 'dashed',
    padding: 20,
    marginVertical: 8,
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDisabled: {
    backgroundColor: colors.background.disabled,
    borderColor: colors.border.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    // Add rotation animation in future if needed
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 24,
  },
  titleDisabled: {
    color: colors.text.disabled,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  subtitleDisabled: {
    color: colors.text.disabled,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
});

export default QuickPlanButton;
