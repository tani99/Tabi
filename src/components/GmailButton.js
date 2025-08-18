import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const GmailButton = ({ onPress, loading = false, disabled = false, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, styles.disabled]}
        onPress={() => {}} // Disable functionality
        disabled={true}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <Ionicons name="mail" size={20} color={colors.gmail.icon} style={styles.icon} />
          <Text style={styles.text}>Continue with Gmail</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.comingSoonTag}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    backgroundColor: colors.gmail.background,
    borderWidth: 1,
    borderColor: colors.gmail.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabled: {
    backgroundColor: colors.gmail.backgroundPressed,
    borderColor: colors.gmail.borderPressed,
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gmail.text,
  },
  comingSoonTag: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
});

export default GmailButton;
