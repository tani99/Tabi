import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import AILoadingIndicator from './AILoadingIndicator';
import { colors } from '../../theme/colors';

const AILoadingModal = ({
  visible,
  loadingState,
  onCancel,
  canCancel = true,
  showTimeEstimate = true,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={canCancel ? onCancel : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <AILoadingIndicator
            loadingState={loadingState}
            onCancel={onCancel}
            canCancel={canCancel}
            showTimeEstimate={showTimeEstimate}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 30,
    margin: 20,
    width: 320,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AILoadingModal;
