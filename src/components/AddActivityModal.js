import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { colors } from '../theme/colors';

const AddActivityModal = ({ 
  visible, 
  onClose, 
  onSave, 
  lastActivityEndTime = null,
  loading = false,
  editingActivity = null 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    startTime: new Date(),
    endTime: new Date(),
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);

  // Initialize form with default times when modal opens
  useEffect(() => {
    if (visible) {
      if (editingActivity) {
        // Populate form with existing activity data
        setFormData({
          title: editingActivity.title || '',
          startTime: editingActivity.startTime ? new Date(editingActivity.startTime) : new Date(),
          endTime: editingActivity.endTime ? new Date(editingActivity.endTime) : new Date(),
          notes: editingActivity.notes || ''
        });
      } else {
        // Initialize for new activity
        const now = new Date();
        
        // Handle lastActivityEndTime properly - it might be a string or Date object
        let defaultStartTime;
        if (lastActivityEndTime) {
          // If lastActivityEndTime is provided, use it as the start time
          defaultStartTime = lastActivityEndTime instanceof Date 
            ? new Date(lastActivityEndTime) 
            : new Date(lastActivityEndTime);
          
          // Validate the date
          if (isNaN(defaultStartTime.getTime())) {
            // If invalid, fall back to 9 AM today
            defaultStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
          }
        } else {
          // Default to 9 AM today
          defaultStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
        }
        
        const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000); // 1 hour later
        
        setFormData({
          title: '',
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          notes: ''
        });
      }
      setErrors({});
    }
  }, [visible, editingActivity]);

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
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    // Time validation
    const now = new Date();
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    // Validate start time
    if (isNaN(startTime.getTime())) {
      newErrors.startTime = 'Please select a valid start time';
    }
    
    // Validate end time
    if (isNaN(endTime.getTime())) {
      newErrors.endTime = 'Please select a valid end time';
    } else if (endTime <= startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    // Minimum duration validation (15 minutes for more flexibility)
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    if (durationMinutes < 15) {
      newErrors.endTime = 'Activity must be at least 15 minutes long';
    }
    
    // Maximum duration validation (18 hours)
    const durationHours = durationMinutes / 60;
    if (durationHours > 18) {
      newErrors.endTime = 'Activity cannot be longer than 18 hours';
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
      title: formData.title.trim(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes.trim(),
      updatedAt: new Date()
    };

    // If not editing, add creation data
    if (!editingActivity) {
      activity.id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      activity.createdAt = new Date();
    }

    onSave(activity);
  };

  const handleStartTimeChange = (selectedTime) => {
    setShowStartTimeDropdown(false);
    
    // Create a new date with the current form start time's date but selected time
    const currentDate = formData.startTime;
    const newStartTime = new Date(currentDate);
    newStartTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    
    updateFormData('startTime', newStartTime);
    
    // Update end time if it's now before start time
    if (formData.endTime <= newStartTime) {
      const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000); // 1 hour later
      updateFormData('endTime', newEndTime);
    }
  };

  const handleEndTimeChange = (selectedTime) => {
    setShowEndTimeDropdown(false);
    
    // Create a new date with the current form end time's date but selected time
    const currentDate = formData.endTime;
    const newEndTime = new Date(currentDate);
    newEndTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    
    updateFormData('endTime', newEndTime);
  };

  const formatTime = (date) => {
    // Check if date is valid
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
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
        // Create a base date for today and set the time
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        
        options.push({
          time: time,
          display: time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        });
      }
    }
    return options;
  };

  const timeOptions = getTimeOptions();

  // Calculate and format duration
  const getDurationDisplay = () => {
    if (!formData.startTime || !formData.endTime) return '';
    
    const durationMs = formData.endTime.getTime() - formData.startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    if (durationMinutes <= 0) return '';
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
    }
  };

  const renderTimeOption = ({ item }) => (
    <TouchableOpacity
      style={styles.timeOption}
      onPress={() => showStartTimeDropdown ? handleStartTimeChange(item.time) : handleEndTimeChange(item.time)}
    >
      <Text style={styles.timeOptionText}>{item.display}</Text>
    </TouchableOpacity>
  );

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
            <Text style={styles.modalTitle}>
              {editingActivity ? 'Edit Activity' : 'Add Activity'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-button">
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Title Field */}
            <View style={styles.inputContainer}>
              <CustomInput
                label="Activity Title *"
                value={formData.title}
                onChangeText={(text) => updateFormData('title', text)}
                placeholder="Enter activity title"
                error={errors.title}
                maxLength={100}
                autoCapitalize="words"
              />
              <Text style={styles.characterCounter}>
                {formData.title.length}/100
              </Text>
            </View>

            {/* Start Time Field */}
            <View style={styles.timeFieldContainer}>
              <Text style={styles.timeLabel}>Start Time *</Text>
              <TouchableOpacity
                style={[styles.timeButton, errors.startTime && styles.timeButtonError]}
                onPress={() => setShowStartTimeDropdown(true)}
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
                onPress={() => setShowEndTimeDropdown(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.timeButtonText}>{formatTime(formData.endTime)}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
              {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
            </View>

            {/* Duration Display */}
            {getDurationDisplay() && (
              <View style={styles.durationContainer}>
                <Ionicons name="time" size={16} color={colors.primary.main} />
                <Text style={styles.durationText}>
                  Duration: {getDurationDisplay()}
                </Text>
              </View>
            )}

            {/* Notes Field */}
            <View style={styles.inputContainer}>
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
              <Text style={styles.characterCounter}>
                {formData.notes.length}/500
              </Text>
            </View>
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
              title="Save"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              testID="save-activity-button"
            />
          </View>
        </View>
      </View>

      {/* Time Dropdown Modals */}
      {(showStartTimeDropdown || showEndTimeDropdown) && (
        <Modal
          visible={showStartTimeDropdown || showEndTimeDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowStartTimeDropdown(false);
            setShowEndTimeDropdown(false);
          }}
        >
          <TouchableOpacity 
            style={styles.timeDropdownOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowStartTimeDropdown(false);
              setShowEndTimeDropdown(false);
            }}
          >
            <TouchableOpacity style={styles.timeDropdownContainer} activeOpacity={1}>
              <View style={styles.timeDropdownHeader}>
                <Text style={styles.timeDropdownTitle}>
                  {showStartTimeDropdown ? 'Select Start Time' : 'Select End Time'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowStartTimeDropdown(false);
                    setShowEndTimeDropdown(false);
                  }}
                >
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={timeOptions}
                renderItem={renderTimeOption}
                keyExtractor={(item, index) => index.toString()}
                style={styles.timeDropdownList}
                showsVerticalScrollIndicator={true}
                ItemSeparatorComponent={() => <View style={styles.timeOptionSeparator} />}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
  inputContainer: {
    marginBottom: 16,
  },
  characterCounter: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  durationText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
    marginLeft: 6,
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
  // Time dropdown styles
  timeDropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timeDropdownContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '100%',
    maxWidth: 300,
    maxHeight: '70%',
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timeDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  timeDropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  timeDropdownList: {
    maxHeight: 300,
  },
  timeOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  timeOptionSeparator: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginHorizontal: 20,
  },
});

export default AddActivityModal;
