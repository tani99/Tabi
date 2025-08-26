import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { colors } from '../theme/colors';

const AddActivityModal = ({ 
  visible, 
  onClose, 
  onSave, 
  lastActivityEndTime = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    startTime: new Date(),
    endTime: new Date(),
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Initialize form with default times when modal opens
  useEffect(() => {
    if (visible) {
      const now = new Date();
      const defaultStartTime = lastActivityEndTime || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
      const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000); // 1 hour later
      
      setFormData({
        title: '',
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        notes: ''
      });
      setErrors({});
    }
  }, [visible, lastActivityEndTime]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Activity title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    // Time validation
    if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    // Minimum duration validation (30 minutes)
    const durationMs = formData.endTime.getTime() - formData.startTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    if (durationMinutes < 30) {
      newErrors.endTime = 'Activity must be at least 30 minutes long';
    }
    
    // Notes validation
    if (formData.notes.length > 500) {
      newErrors.notes = 'Notes must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title.trim(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSave(activity);
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      updateFormData('startTime', selectedTime);
      // Update end time if it's now before start time
      if (formData.endTime <= selectedTime) {
        const newEndTime = new Date(selectedTime.getTime() + 60 * 60 * 1000); // 1 hour later
        updateFormData('endTime', newEndTime);
      }
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      updateFormData('endTime', selectedTime);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        options.push(time);
      }
    }
    return options;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Activity</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-button">
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Title Field */}
            <CustomInput
              label="Activity Title *"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              placeholder="Enter activity title"
              error={errors.title}
              maxLength={100}
              autoCapitalize="words"
            />

            {/* Start Time Field */}
            <View style={styles.timeFieldContainer}>
              <Text style={styles.timeLabel}>Start Time *</Text>
              <TouchableOpacity
                style={[styles.timeButton, errors.startTime && styles.timeButtonError]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.timeButtonText}>{formatTime(formData.startTime)}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
              {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
            </View>

            {/* End Time Field */}
            <View style={styles.timeFieldContainer}>
              <Text style={styles.timeLabel}>End Time *</Text>
              <TouchableOpacity
                style={[styles.timeButton, errors.endTime && styles.timeButtonError]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.timeButtonText}>{formatTime(formData.endTime)}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
              {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
            </View>

            {/* Notes Field */}
            <CustomInput
              label="Notes (Optional)"
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              placeholder="Add any additional notes..."
              error={errors.notes}
              maxLength={500}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <CustomButton
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <CustomButton
              title="Save Activity"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              testID="save-activity-button"
            />
          </View>
        </View>
      </View>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <DateTimePicker
          value={formData.startTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={formData.endTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndTimeChange}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timeFieldContainer: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.input.text,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  timeButtonError: {
    borderColor: colors.input.borderError,
    backgroundColor: colors.status.error.background,
  },
  timeButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.input.text,
    marginLeft: 12,
  },
  errorText: {
    color: colors.status.error.main,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default AddActivityModal;
