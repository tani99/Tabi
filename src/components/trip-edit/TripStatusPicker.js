import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import CustomButton from '../CustomButton';
import { colors } from '../../theme/colors';
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS } from '../../utils/tripConstants';

const TripStatusPicker = ({
  label,
  value,
  onChange,
  error = null,
  style
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleStatusChange = (status) => {
    onChange(status);
    setShowModal(false);
  };

  const handlePress = () => {
    setShowModal(true);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <CustomButton
        title={TRIP_STATUS_LABELS[value]}
        onPress={handlePress}
        variant="outline"
        style={[styles.statusButton, { borderColor: TRIP_STATUS_COLORS[value] }]}
        textStyle={[styles.statusButtonText, { color: TRIP_STATUS_COLORS[value] }]}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Status</Text>
            
            {Object.entries(TRIP_STATUS_LABELS).map(([status, label]) => (
              <CustomButton
                key={status}
                title={label}
                onPress={() => handleStatusChange(status)}
                variant="outline"
                style={[
                  styles.statusOption,
                  value === status && { borderColor: TRIP_STATUS_COLORS[status] }
                ]}
                textStyle={[
                  styles.statusOptionText,
                  value === status && { color: TRIP_STATUS_COLORS[status] }
                ]}
              />
            ))}
            
            <CustomButton
              title="Cancel"
              onPress={() => setShowModal(false)}
              variant="secondary"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  statusButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  statusButtonText: {
    textAlign: 'left',
  },
  errorText: {
    color: colors.text.error,
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 24,
    margin: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    marginBottom: 8,
  },
  statusOptionText: {
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default TripStatusPicker;
