import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../CustomButton';

const TripEditActions = ({
  onSave,
  onCancel,
  loading = false,
  disabled = false,
  style
}) => {
  const navigation = useNavigation();

  const handleCancel = () => {
    Alert.alert(
      'Cancel Editing',
      'Are you sure you want to cancel? Any unsaved changes will be lost.',
      [
        {
          text: 'Keep Editing',
          style: 'cancel'
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            if (onCancel) {
              onCancel();
            } else {
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <CustomButton
        title="Save Changes"
        onPress={handleSave}
        loading={loading}
        disabled={disabled || loading}
        style={styles.saveButton}
      />
      
      <CustomButton
        title="Cancel"
        onPress={handleCancel}
        variant="secondary"
        disabled={loading}
        style={styles.cancelButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 24,
  },
});

export default TripEditActions;
