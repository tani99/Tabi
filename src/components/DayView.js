import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');
const TAB_WIDTH = 105;
const TAB_SPACING = 8;

const DayView = ({
  tripStartDate,
  tripEndDate,
  selectedDay = 1,
  onDayChange,
  style,
}) => {
  const [days, setDays] = useState([]);
  const flatListRef = useRef(null);
  const animatedValues = useRef({});
  const [totalDays, setTotalDays] = useState(0);

  // Calculate trip duration
  useEffect(() => {
    if (!tripStartDate || !tripEndDate) return;

    const startDate = new Date(tripStartDate);
    const endDate = new Date(tripEndDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    setTotalDays(duration);
    
    // Only create animated values for visible days and selected day
    const visibleRange = Math.max(1, Math.min(50, duration)); // Limit to 50 days max
    const startDay = Math.max(1, selectedDay - 25);
    const endDay = Math.min(duration, selectedDay + 25);
    
    for (let i = startDay; i <= endDay; i++) {
      if (!animatedValues.current[i]) {
        animatedValues.current[i] = new Animated.Value(i === selectedDay ? 1 : 0);
      }
    }
  }, [tripStartDate, tripEndDate, selectedDay]);

  // Animate selected day change
  useEffect(() => {
    // Animate only the selected day and previous selected day
    Object.keys(animatedValues.current).forEach((dayKey) => {
      const day = parseInt(dayKey);
      const animatedValue = animatedValues.current[day];
      if (animatedValue) {
        // Skip animation in test environment to avoid warnings
        if (__DEV__ && global.__TEST__) {
          animatedValue.setValue(day === selectedDay ? 1 : 0);
        } else {
          Animated.timing(animatedValue, {
            toValue: day === selectedDay ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      }
    });

    // Scroll to selected day
    if (flatListRef.current && totalDays > 0) {
      const scrollPosition = Math.max(0, (selectedDay - 1) * (TAB_WIDTH + TAB_SPACING) - (screenWidth / 2) + (TAB_WIDTH / 2));
      
      flatListRef.current.scrollToOffset({
        offset: scrollPosition,
        animated: true,
      });
    }
  }, [selectedDay, totalDays]);

  const handleDayPress = (day) => {
    if (onDayChange) {
      onDayChange(day);
    }
  };

  const getDayData = useCallback((dayNumber) => {
    if (!tripStartDate) return null;
    
    const startDate = new Date(tripStartDate);
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayNumber - 1);
    
    return {
      day: dayNumber,
      date: currentDate,
      formattedDate: currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  }, [tripStartDate]);

  const renderDayTab = useCallback(({ item }) => {
    const day = item;
    
    // Initialize animated value if not exists
    if (!animatedValues.current[day.day]) {
      animatedValues.current[day.day] = new Animated.Value(day.day === selectedDay ? 1 : 0);
    }
    
    const animatedValue = animatedValues.current[day.day];

    const backgroundColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.background.secondary, colors.primary.main],
    });

    const textColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.text.secondary, colors.text.inverse],
    });

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

    return (
      <TouchableOpacity
        onPress={() => handleDayPress(day.day)}
        style={styles.tabContainer}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.tab,
            {
              backgroundColor,
              transform: [{ scale }],
            },
          ]}
        >
          <Animated.Text style={[styles.dayText, { color: textColor }]}>
            Day {day.day}
          </Animated.Text>
          <Animated.Text style={[styles.dateText, { color: textColor }]}>
            {day.formattedDate}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [selectedDay, handleDayPress]);

  const getItemLayout = useCallback((data, index) => ({
    length: TAB_WIDTH + TAB_SPACING,
    offset: (TAB_WIDTH + TAB_SPACING) * index,
    index,
  }), []);

  const keyExtractor = useCallback((item) => item.day.toString(), []);

  if (totalDays <= 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No trip dates available</Text>
        </View>
      </View>
    );
  }

  // Generate data for FlatList
  const data = Array.from({ length: totalDays }, (_, index) => 
    getDayData(index + 1)
  ).filter(Boolean);

  return (
    <View style={[styles.container, style]}>
      {/* Horizontal scrollable day tabs */}
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderDayTab}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={TAB_WIDTH + TAB_SPACING}
        decelerationRate="fast"
        bounces={true}
        alwaysBounceHorizontal={true}
        overScrollMode="always"
        initialScrollIndex={Math.max(0, selectedDay - 1)}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        onScrollToIndexFailed={() => {
          // Fallback if scroll to index fails
          if (flatListRef.current) {
            const scrollPosition = Math.max(0, (selectedDay - 1) * (TAB_WIDTH + TAB_SPACING) - (screenWidth / 2) + (TAB_WIDTH / 2));
            flatListRef.current.scrollToOffset({
              offset: scrollPosition,
              animated: true,
            });
          }
        }}
      />
      
      {/* Day count indicator at bottom */}
      <View style={styles.dayCountContainer}>
        <Text style={styles.dayCountText}>
          Day {selectedDay} of {totalDays}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    paddingVertical: 4,
  },
  dayCountContainer: {
    alignItems: 'center',
    marginTop: 4,
    paddingBottom: 2,
  },
  dayCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  tabContainer: {
    marginRight: TAB_SPACING,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 85,
    alignItems: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 1,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.9,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default DayView;
