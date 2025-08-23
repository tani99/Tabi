import React, { useState } from 'react';
import { View, StyleSheet, Alert, Modal, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import CustomButton from '../CustomButton';

const TripActionButtons = ({ 
  trip, 
  onEdit, 
  onDelete, 
  onShare,
  loading = false 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await onDelete();
      setShowDeleteModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete trip. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleSharePress = () => {
    if (onShare) {
      onShare();
    } else {
      Alert.alert(
        'Share Trip', 
        'Sharing functionality will be available in a future update.',
        [{ text: 'OK' }]
      );
    }
  };

  const DeleteConfirmationModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleDeleteCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Delete Trip</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to delete "{trip?.name}"? This action cannot be undone.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={handleDeleteCancel}
              disabled={deleteLoading}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.deleteModalButton]} 
              onPress={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Text style={styles.deleteModalButtonText}>Deleting...</Text>
              ) : (
                <Text style={styles.deleteModalButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* Edit Button - Primary Action */}
        <CustomButton
          title="✏️ Edit Trip"
          onPress={onEdit}
          variant="primary"
          disabled={loading || !trip}
          style={styles.editButton}
        />
        
        {/* Delete Button - Destructive Action */}
        <CustomButton
          title="🗑️ Delete Trip"
          onPress={handleDeletePress}
          variant="outline"
          disabled={loading || !trip}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
      </View>
      
      {/* Share Button - Secondary Action */}
      <CustomButton
        title="📤 Share Trip"
        onPress={handleSharePress}
        variant="secondary"
        disabled={loading || !trip}
        style={styles.shareButton}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: colors.status.error.main,
  },
  deleteButtonText: {
    color: colors.status.error.main,
  },
  shareButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  deleteModalButton: {
    backgroundColor: colors.status.error.background,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deleteModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.status.error.main,
  },
});

export default TripActionButtons;
