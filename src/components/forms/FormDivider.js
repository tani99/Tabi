import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const FormDivider = ({ 
  text = 'or', 
  style,
  textStyle,
  lineStyle 
}) => {
  return (
    <View style={[styles.dividerContainer, style]}>
      <View style={[styles.dividerLine, lineStyle]} />
      <Text style={[styles.dividerText, textStyle]}>{text}</Text>
      <View style={[styles.dividerLine, lineStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.primary,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default FormDivider;
