import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const HelpText = ({ 
  text, 
  icon = '💡', 
  style, 
  textStyle,
  containerStyle 
}) => {
  if (!text) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.text, textStyle]}>
        {icon} {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
  },
  text: {
    color: colors.text.tertiary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HelpText;
