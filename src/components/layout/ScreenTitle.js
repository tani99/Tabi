import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const ScreenTitle = ({ 
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  containerStyle,
  ...props 
}) => {
  return (
    <View style={[styles.container, containerStyle]} {...props}>
      {title && (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
      {subtitle && (
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});

export default ScreenTitle;
