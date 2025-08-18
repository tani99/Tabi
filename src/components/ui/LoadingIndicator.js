import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const LoadingIndicator = ({ 
  message = 'Loading...', 
  size = 'small', 
  color = colors.primary.main,
  containerStyle,
  textStyle,
  showBackground = true 
}) => {
  return (
    <View style={[
      styles.container,
      showBackground && styles.withBackground,
      containerStyle
    ]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[styles.text, textStyle]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  withBackground: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginTop: 16,
  },
  text: {
    color: colors.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
});

export default LoadingIndicator;
