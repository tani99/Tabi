import React from 'react';
import { SafeAreaView, View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';

const ScreenLayout = ({ 
  children, 
  backgroundColor = colors.background.primary,
  paddingHorizontal = 24,
  scrollable = true, // Changed to true by default
  contentContainerStyle,
  style,
  ...props 
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    style
  ];

  const contentStyle = [
    styles.content,
    { paddingHorizontal },
    contentContainerStyle
  ];

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle} {...props}>
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
    );
  }

  return (
    <SafeAreaView style={containerStyle} {...props}>
      <View style={contentStyle}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
