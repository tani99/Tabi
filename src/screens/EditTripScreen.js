import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../theme/colors';
import { updateTrip, getTrip } from '../services/trips';
import { TRIP_VALIDATION, inferTripStatus } from '../utils/tripConstants';
import { useAuth } from '../context/AuthContext';

const EditTripScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  const { tripId } = route.params || {};
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description: ''
  });
  
  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadTrip();
    } else {
      setLoading(false);
    }
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const tripData = await getTrip(tripId, user.uid);
      if (tripData) {
        setTrip(tripData);
        setFormData({
          name: tripData.name || '',
          location: tripData.location || '',
          startDate: tripData.startDate ? new Date(tripData.startDate) : new Date(),
          endDate: tripData.endDate ? new Date(tripData.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          description: tripData.description || ''
        });
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    } else if (formData.name.length > TRIP_VALIDATION.name.maxLength) {
      newErrors.name = `Trip name must be no more than ${TRIP_VALIDATION.name.maxLength} characters`;
    }
    
    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length > TRIP_VALIDATION.location.maxLength) {
      newErrors.location = `Location must be no more than ${TRIP_VALIDATION.location.maxLength} characters`;
    }
    
    // Validate dates
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    // Validate description
    if (formData.description && formData.description.length > TRIP_VALIDATION.description.maxLength) {
      newErrors.description = `Description must be no more than ${TRIP_VALIDATION.description.maxLength} characters`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const updatedTripData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim()
      };
      
      await updateTrip(tripId, updatedTripData, user.uid);
      
      Alert.alert(
        'Success',
        'Trip updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (event, selectedDate, dateType) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [dateType]: selectedDate
      }));
      
      // Clear date error when user selects a date
      if (errors[dateType]) {
        setErrors(prev => ({
          ...prev,
          [dateType]: null
        }));
      }
    }
  };



  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trip details...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!trip) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip not found</Text>
          <CustomButton 
            title="Go Back" 
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScreenHeader
        navigation={navigation}
        title="Edit Trip"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Trip Name */}
        <CustomInput
          label="Trip Name"
          value={formData.name}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, name: text }));
            if (errors.name) {
              setErrors(prev => ({ ...prev, name: null }));
            }
          }}
          placeholder="Enter trip name"
          error={errors.name}
          autoCapitalize="words"
        />

        {/* Location */}
        <CustomInput
          label="Location"
          value={formData.location}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, location: text }));
            if (errors.location) {
              setErrors(prev => ({ ...prev, location: null }));
            }
          }}
          placeholder="Enter destination"
          error={errors.location}
          autoCapitalize="words"
        />

        {/* Start Date */}
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Start Date</Text>
          <CustomButton
            title={formatDate(formData.startDate)}
            onPress={() => setShowStartDatePicker(true)}
            variant="outline"
            style={styles.dateButton}
            textStyle={styles.dateButtonText}
          />
          {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
        </View>

        {/* End Date */}
        <View style={styles.dateContainer}>
          <Text style={styles.label}>End Date</Text>
          <CustomButton
            title={formatDate(formData.endDate)}
            onPress={() => setShowEndDatePicker(true)}
            variant="outline"
            style={styles.dateButton}
            textStyle={styles.dateButtonText}
          />
          {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
        </View>

        {/* Status Info */}
        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusInfo}>
            <Text style={styles.statusInfoText}>
              Status is automatically determined based on your trip dates
            </Text>
            <View style={styles.currentStatus}>
              <Text style={styles.currentStatusLabel}>Current Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.background.secondary }]}>
                <Text style={styles.currentStatusText}>
                  {inferTripStatus(formData.startDate, formData.endDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <CustomInput
          label="Description (Optional)"
          value={formData.description}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, description: text }));
            if (errors.description) {
              setErrors(prev => ({ ...prev, description: null }));
            }
          }}
          placeholder="Add trip notes or description"
          error={errors.description}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.descriptionInput}
        />

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <CustomButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          />
          <CustomButton
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            disabled={saving}
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, 'startDate')}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, 'endDate')}
          minimumDate={formData.startDate}
        />
      )}


    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.error,
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  dateButtonText: {
    textAlign: 'left',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusInfo: {
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  statusInfoText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  currentStatusLabel: {
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
  currentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  descriptionInput: {
    minHeight: 100,
    paddingTop: 16,
  },
  actionContainer: {
    marginTop: 32,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 24,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

});

export default EditTripScreen;
