import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

/**
 * AILoadingIndicator - Animated loading state with progress messages
 * Provides clear feedback during AI processing with estimated time and cancel option
 */
const AILoadingIndicator = ({ 
  loadingState = 'idle',
  onCancel,
  canCancel = true,
  showTimeEstimate = true,
  style,
  testID = 'ai-loading-indicator'
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(10);
  const timerRef = useRef(null);
  
  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  // Progress messages for each loading state
  const progressMessages = {
    idle: { message: '', icon: 'sparkles', estimatedSeconds: 0 },
    analyzing: { 
      message: 'Analyzing your preferences...', 
      icon: 'search', 
      estimatedSeconds: 3 
    },
    generating: { 
      message: 'Creating your perfect itinerary...', 
      icon: 'construct', 
      estimatedSeconds: 7 
    },
    parsing: { 
      message: 'Organizing trip details...', 
      icon: 'document-text', 
      estimatedSeconds: 2 
    },
    validating: { 
      message: 'Finalizing your trip plan...', 
      icon: 'checkmark-circle', 
      estimatedSeconds: 1 
    },
    complete: { 
      message: 'Trip plan ready!', 
      icon: 'checkmark-circle', 
      estimatedSeconds: 0 
    },
    error: { 
      message: 'Something went wrong', 
      icon: 'alert-circle', 
      estimatedSeconds: 0 
    }
  };

  // Start animations when loading begins
  useEffect(() => {
    if (loadingState !== 'idle' && loadingState !== 'complete' && loadingState !== 'error') {
      // Spin animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      spinAnimation.start();
      pulseAnimation.start();

      return () => {
        spinAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [loadingState, spinValue, pulseValue]);

  // Progress bar animation
  useEffect(() => {
    if (loadingState !== 'idle' && loadingState !== 'error') {
      const targetProgress = getProgressPercentage(loadingState);
      
      Animated.timing(progressValue, {
        toValue: targetProgress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressValue.setValue(0);
    }
  }, [loadingState, progressValue]);

  // Timer for elapsed time
  useEffect(() => {
    if (loadingState !== 'idle' && loadingState !== 'complete' && loadingState !== 'error') {
      setTimeElapsed(0);
      
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      // Update estimated time based on loading state
      const currentMessage = progressMessages[loadingState];
      if (currentMessage) {
        setEstimatedTime(currentMessage.estimatedSeconds);
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [loadingState]);

  // Calculate progress percentage based on loading state
  const getProgressPercentage = (state) => {
    const stateProgress = {
      idle: 0,
      analyzing: 20,
      generating: 60,
      parsing: 85,
      validating: 95,
      complete: 100,
      error: 0
    };
    return stateProgress[state] || 0;
  };

  // Spin interpolation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Progress bar width interpolation
  const progressWidth = progressValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const currentMessage = progressMessages[loadingState] || progressMessages.idle;
  const isLoading = loadingState !== 'idle' && loadingState !== 'complete' && loadingState !== 'error';
  const isComplete = loadingState === 'complete';
  const isError = loadingState === 'error';

  if (loadingState === 'idle') {
    return null;
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Main content */}
      <View style={styles.content}>
        
        {/* Icon with animation */}
        <View style={styles.iconContainer}>
          {isLoading ? (
            <Animated.View 
              style={[
                styles.loadingIcon,
                { 
                  transform: [
                    { rotate: spin },
                    { scale: pulseValue }
                  ] 
                }
              ]}
            >
              <Ionicons 
                name="sync" 
                size={32} 
                color={colors.primary.main} 
              />
            </Animated.View>
          ) : (
            <Ionicons 
              name={currentMessage.icon} 
              size={32} 
              color={isError ? colors.status.error.main : colors.status.success.main}
            />
          )}
        </View>

        {/* Message */}
        <Text style={[
          styles.message,
          isError && styles.messageError,
          isComplete && styles.messageSuccess
        ]}>
          {currentMessage.message}
        </Text>

        {/* Progress bar */}
        {isLoading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: progressWidth }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(getProgressPercentage(loadingState))}%
            </Text>
          </View>
        )}

        {/* Time estimate */}
        {isLoading && showTimeEstimate && (
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.timeText}>
              {timeElapsed}s elapsed
              {estimatedTime > 0 && timeElapsed < estimatedTime && (
                <Text style={styles.timeEstimate}>
                  {' '}• ~{Math.max(0, estimatedTime - timeElapsed)}s remaining
                </Text>
              )}
            </Text>
          </View>
        )}

        {/* Cancel button */}
        {isLoading && canCancel && onCancel && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onCancel}
            testID="cancel-ai-request"
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {/* Retry option for errors */}
        {isError && onCancel && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onCancel}
            testID="retry-ai-request"
          >
            <Ionicons name="refresh-outline" size={18} color={colors.primary.main} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 16,
  },
  loadingIcon: {
    // Animation styles applied via Animated.View
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  messageError: {
    color: colors.status.error.main,
  },
  messageSuccess: {
    color: colors.status.success.main,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    width: '100%',
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    minWidth: 35,
    textAlign: 'right',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  timeEstimate: {
    fontWeight: '500',
    color: colors.primary.main,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  cancelText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary.light + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  retryText: {
    fontSize: 13,
    color: colors.primary.main,
    fontWeight: '500',
  },
});

export default AILoadingIndicator;
