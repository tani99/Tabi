import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const AuthErrorDisplay = ({ 
  error, 
  style,
  textStyle,
  containerStyle 
}) => {
  if (!error) {
    return null;
  }

  return (
    <View style={[styles.authErrorContainer, containerStyle, style]}>
      <Text style={[styles.authErrorText, textStyle]}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  authErrorContainer: {
    backgroundColor: colors.status.error.background,
    borderWidth: 1,
    borderColor: colors.status.error.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  authErrorText: {
    color: colors.status.error.light,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AuthErrorDisplay;
