import React from 'react';
import { SafeAreaView, View, StyleSheet, ScrollView, Animated } from 'react-native';
import { colors } from '../../theme/colors';

const ScreenLayout = ({ 
  children, 
  backgroundColor = colors.background.primary,
  paddingHorizontal = 24,
  scrollable = true, // Changed to true by default
  contentContainerStyle,
  style,
  isEditMode = false,
  editModeTint = colors.background.tertiary,
  ...props 
}) => {
  // Animated value for smooth transitions
  const animatedBackgroundColor = React.useRef(new Animated.Value(0)).current;

  // Animate background color change when edit mode changes
  React.useEffect(() => {
    Animated.timing(animatedBackgroundColor, {
      toValue: isEditMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isEditMode, animatedBackgroundColor]);

  // Interpolate background color for smooth transition
  const interpolatedBackgroundColor = animatedBackgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: [backgroundColor, editModeTint],
  });
  
  const containerStyle = [
    styles.container,
    { backgroundColor: interpolatedBackgroundColor },
    style
  ];

  const contentStyle = [
    styles.content,
    { paddingHorizontal },
    contentContainerStyle
  ];

  if (scrollable) {
    return (
      <Animated.View style={containerStyle} {...props}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={contentStyle}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
            overScrollMode="always"
            nestedScrollEnabled={true}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={containerStyle} {...props}>
      <SafeAreaView style={styles.safeArea}>
        <View style={contentStyle}>
          {children}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 40, // Add bottom padding for bounce effect
  },
});

export default ScreenLayout;
