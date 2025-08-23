import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { createTrip } from '../services/trips';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { inferTripStatus } from '../utils/tripConstants';

const CreateTripScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    description: ''
  });

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const tripId = await createTrip(formData, user.uid);
      Alert.alert(
        'Success!',
        'Your trip has been created successfully.',
        [
          {
            text: 'View Trip',
            onPress: () => navigation.navigate('TripDetails', { tripId })
          },
          {
            text: 'Create Another',
            onPress: () => {
              setFormData({
                name: '',
                location: '',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                description: ''
              });
              setErrors({});
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', error.message || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (event, selectedDate, dateType) => {
    console.log('Date change event:', event.type, 'selectedDate:', selectedDate, 'dateType:', dateType);
    
    if (selectedDate) {
      updateFormData(dateType, selectedDate);
      
      // If changing start date, ensure end date is still valid
      if (dateType === 'startDate' && formData.endDate && selectedDate >= formData.endDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        updateFormData('endDate', newEndDate);
      }
    }
  };

  const handleDateConfirm = (dateType) => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  return (
    <ScreenLayout>
      <ScreenHeader
        navigation={navigation}
        title="Create New Trip"
        showBackButton={true}
      />

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          
          <CustomInput
            label="Trip Name *"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            placeholder="Enter trip name"
            error={errors.name}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <CustomInput
            label="Location *"
            value={formData.location}
            onChangeText={(text) => updateFormData('location', text)}
            placeholder="Where are you going?"
            error={errors.location}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <View style={styles.dateSection}>
            <Text style={styles.sectionTitle}>Dates</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Start Date *</Text>
                <CustomButton
                  title={formatDate(formData.startDate)}
                  variant="outline"
                  onPress={() => setShowStartDatePicker(true)}
                  style={[styles.dateButton, errors.startDate && styles.dateButtonError]}
                  textStyle={styles.dateButtonText}
                />
                {errors.startDate && (
                  <Text style={styles.errorText}>{errors.startDate}</Text>
                )}
              </View>

              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>End Date *</Text>
                <CustomButton
                  title={formatDate(formData.endDate)}
                  variant="outline"
                  onPress={() => setShowEndDatePicker(true)}
                  style={[styles.dateButton, errors.endDate && styles.dateButtonError]}
                  textStyle={styles.dateButtonText}
                />
                {errors.endDate && (
                  <Text style={styles.errorText}>{errors.endDate}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <CustomInput
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              placeholder="Add notes about your trip..."
              multiline={true}
              numberOfLines={4}
              style={styles.descriptionInput}
              autoCapitalize="sentences"
              autoCorrect={true}
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                Trip status will be automatically determined based on your selected dates
              </Text>
            </View>
            <View style={styles.statusPreview}>
              <Text style={styles.statusPreviewLabel}>Preview Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.background.secondary }]}>
                <Text style={styles.statusPreviewText}>
                  {inferTripStatus(formData.startDate, formData.endDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Create Trip"
          onPress={handleCreateTrip}
          loading={loading}
          disabled={loading}
          style={styles.createButton}
        />
      </View>

      {/* Date Picker Modals */}
      <Modal
        visible={showStartDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDateCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Start Date</Text>
              <TouchableOpacity onPress={handleDateCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={formData.startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => handleDateChange(event, date, 'startDate')}
                minimumDate={new Date()}
                style={styles.datePicker}
                textColor={colors.text.primary}
              />
            </View>
            <View style={styles.modalFooter}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={handleDateCancel}
                style={styles.modalButton}
              />
              <CustomButton
                title="Confirm"
                onPress={() => handleDateConfirm('startDate')}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEndDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDateCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select End Date</Text>
              <TouchableOpacity onPress={handleDateCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={formData.endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => handleDateChange(event, date, 'endDate')}
                minimumDate={formData.startDate}
                style={styles.datePicker}
                textColor={colors.text.primary}
              />
            </View>
            <View style={styles.modalFooter}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={handleDateCancel}
                style={styles.modalButton}
              />
              <CustomButton
                title="Confirm"
                onPress={() => handleDateConfirm('endDate')}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    marginTop: 8,
  },
  dateSection: {
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.input.text,
    marginBottom: 8,
  },
  dateButton: {
    height: 56,
    justifyContent: 'center',
  },
  dateButtonError: {
    borderColor: colors.input.borderError,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  statusPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  statusPreviewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  statusPreviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  errorText: {
    color: colors.status.error.main,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  createButton: {
    height: 56,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
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
    marginBottom: 20,
    paddingBottom: 16,
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
  },
  datePickerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 200,
  },
  datePicker: {
    width: Platform.OS === 'ios' ? 320 : '100%',
    height: Platform.OS === 'ios' ? 200 : 50,
  },
});

export default CreateTripScreen;
