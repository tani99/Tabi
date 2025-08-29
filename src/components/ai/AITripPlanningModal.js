import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import AIPromptInput from './AIPromptInput';
import AILoadingIndicator from './AILoadingIndicator';
import { colors } from '../../theme/colors';

/**
 * AITripPlanningModal - Main interface for users to input trip planning requirements
 * Modal overlay with form inputs for destination, duration, interests, budget fields
 */
const AITripPlanningModal = ({ 
  visible, 
  onClose, 
  onGeneratePlan,
  loading = false,
  loadingState = 'idle',
  onCancelRequest,
  tripData = null,
  itineraryData = null,
  hasData = false
}) => {
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    interests: '',
    budget: '',
    travelStyle: 'balanced',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showTravelStyleDropdown, setShowTravelStyleDropdown] = useState(false);

  // Travel style options
  const travelStyleOptions = [
    { value: 'budget', label: 'Budget-Friendly', description: 'Focus on affordable options and free activities' },
    { value: 'balanced', label: 'Balanced', description: 'Mix of budget and premium experiences' },
    { value: 'luxury', label: 'Luxury', description: 'Premium experiences and accommodations' },
    { value: 'adventure', label: 'Adventure', description: 'Active and outdoor experiences' },
    { value: 'cultural', label: 'Cultural', description: 'Museums, history, and local culture' },
    { value: 'relaxation', label: 'Relaxation', description: 'Spa, wellness, and leisure activities' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setFormData({
        destination: '',
        duration: '',
        interests: '',
        budget: '',
        travelStyle: 'balanced',
        description: ''
      });
      setErrors({});
      setShowTravelStyleDropdown(false);
    }
  }, [visible]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Destination validation
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    } else if (formData.destination.trim().length < 2) {
      newErrors.destination = 'Destination must be at least 2 characters';
    }

    // Duration validation
    if (!formData.duration.trim()) {
      newErrors.duration = 'Trip duration is required';
    } else {
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration < 1) {
        newErrors.duration = 'Duration must be a positive number';
      } else if (duration > 365) {
        newErrors.duration = 'Duration cannot exceed 365 days';
      }
    }

    // Interests validation (optional but if provided should be meaningful)
    if (formData.interests.trim() && formData.interests.trim().length < 3) {
      newErrors.interests = 'Interests must be at least 3 characters if provided';
    }

    // Budget validation (optional but if provided should be valid)
    if (formData.budget.trim()) {
      const budget = parseFloat(formData.budget.replace(/[,$]/g, ''));
      if (isNaN(budget) || budget < 0) {
        newErrors.budget = 'Budget must be a valid positive number';
      }
    }

    // Description validation
    if (formData.description.trim() && formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters if provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePlan = () => {
    if (!validateForm()) {
      return;
    }

    // Prepare the planning data
    const planningData = {
      destination: formData.destination.trim(),
      duration: parseInt(formData.duration),
      interests: formData.interests.trim(),
      budget: formData.budget.trim(),
      travelStyle: formData.travelStyle,
      description: formData.description.trim()
    };

    onGeneratePlan(planningData);
  };

  const handleCancel = () => {
    if (loading) {
      Alert.alert(
        'Cancel Trip Planning',
        'AI is currently generating your trip. Are you sure you want to cancel?',
        [
          { text: 'Continue Planning', style: 'cancel' },
          { 
            text: 'Cancel', 
            style: 'destructive',
            onPress: onClose
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const getTravelStyleDisplay = () => {
    const style = travelStyleOptions.find(option => option.value === formData.travelStyle);
    return style ? style.label : 'Balanced';
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return date.toString();
  };

  const renderTravelStyleOption = (option) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.travelStyleOption,
        formData.travelStyle === option.value && styles.travelStyleOptionSelected
      ]}
      onPress={() => {
        updateFormData('travelStyle', option.value);
        setShowTravelStyleDropdown(false);
      }}
    >
      <Text style={[
        styles.travelStyleOptionLabel,
        formData.travelStyle === option.value && styles.travelStyleOptionLabelSelected
      ]}>
        {option.label}
      </Text>
      <Text style={[
        styles.travelStyleOptionDescription,
        formData.travelStyle === option.value && styles.travelStyleOptionDescriptionSelected
      ]}>
        {option.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="sparkles" size={24} color={colors.primary.main} />
              <Text style={styles.modalTitle}>Plan with AI</Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton} testID="close-ai-modal">
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            /* AI Loading State */
            <View style={styles.loadingContainer}>
              <AILoadingIndicator
                loadingState={loadingState}
                onCancel={onCancelRequest}
                canCancel={true}
                showTimeEstimate={true}
              />
            </View>
          ) : hasData ? (
            /* AI Generated Data Preview */
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>🎉 Trip Generated Successfully!</Text>
                
                <View style={styles.tripPreview}>
                  <Text style={styles.previewSectionTitle}>Trip Details:</Text>
                  <Text style={styles.previewText}>📍 {tripData?.name}</Text>
                  <Text style={styles.previewText}>🌍 {tripData?.location}</Text>
                  <Text style={styles.previewText}>📅 {formatDate(tripData?.startDate)} to {formatDate(tripData?.endDate)}</Text>
                  {tripData?.description && (
                    <Text style={styles.previewText}>📝 {tripData.description}</Text>
                  )}
                </View>

                {itineraryData && (
                  <View style={styles.itineraryPreview}>
                    <Text style={styles.previewSectionTitle}>Itinerary Preview:</Text>
                    {Object.keys(itineraryData).map(day => (
                      <View key={day} style={styles.dayPreview}>
                        <Text style={styles.dayTitle}>{day.replace('_', ' ').toUpperCase()}</Text>
                        {itineraryData[day]?.slice(0, 2).map((activity, index) => (
                          <Text key={index} style={styles.activityText}>
                            • {activity.startTime} - {activity.title}
                          </Text>
                        ))}
                        {itineraryData[day]?.length > 2 && (
                          <Text style={styles.moreText}>
                            ... and {itineraryData[day].length - 2} more activities
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}


              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Helper Text */}
              <Text style={styles.helperText}>
                Tell us about your dream trip and we'll create a personalized itinerary for you!
              </Text>

            {/* Destination Field */}
            <View style={styles.inputContainer}>
              <CustomInput
                label="Destination *"
                value={formData.destination}
                onChangeText={(text) => updateFormData('destination', text)}
                placeholder="Where would you like to go?"
                error={errors.destination}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Duration Field */}
            <View style={styles.inputContainer}>
              <CustomInput
                label="Duration (days) *"
                value={formData.duration}
                onChangeText={(text) => updateFormData('duration', text)}
                placeholder="How many days?"
                error={errors.duration}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            {/* Travel Style Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Travel Style</Text>
              <TouchableOpacity
                style={[styles.travelStyleButton, errors.travelStyle && styles.travelStyleButtonError]}
                onPress={() => setShowTravelStyleDropdown(true)}
              >
                <Text style={styles.travelStyleButtonText}>{getTravelStyleDisplay()}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
              {errors.travelStyle && <Text style={styles.errorText}>{errors.travelStyle}</Text>}
            </View>

            {/* Interests Field */}
            <View style={styles.inputContainer}>
              <CustomInput
                label="Interests (Optional)"
                value={formData.interests}
                onChangeText={(text) => updateFormData('interests', text)}
                placeholder="Food, museums, nightlife, nature..."
                error={errors.interests}
                autoCapitalize="sentences"
                autoCorrect={true}
              />
            </View>

            {/* Budget Field */}
            <View style={styles.inputContainer}>
              <CustomInput
                label="Budget (Optional)"
                value={formData.budget}
                onChangeText={(text) => updateFormData('budget', text)}
                placeholder="$1000 or 1000"
                error={errors.budget}
                keyboardType="numeric"
              />
            </View>

            {/* Description Field */}
            <View style={styles.inputContainer}>
              <AIPromptInput
                label="Additional Details (Optional)"
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Tell us more about your ideal trip..."
                error={errors.description}
                maxLength={500}
              />
              <Text style={styles.characterCounter}>
                {formData.description.length}/500
              </Text>
            </View>

            {/* Tips Section */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
              <Text style={styles.tipsText}>
                • Be specific about your interests for better recommendations{'\n'}
                • Include your preferred pace (relaxed vs. packed schedule){'\n'}
                • Mention any dietary restrictions or accessibility needs
              </Text>
            </View>
          </ScrollView>
          )}

          {/* Footer Buttons - Hidden during loading */}
          {!loading && (
          <View style={styles.modalFooter}>
            {hasData ? (
              /* Data generated - show save/regenerate options */
              <>
                <CustomButton
                  title="Generate New Plan"
                  onPress={() => {
                    // Reset and show form again
                    onGeneratePlan({ regenerate: true });
                  }}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <CustomButton
                  title="Create This Trip"
                  onPress={() => {
                    // This would trigger saving the trip
                    console.log('User wants to save the generated trip');
                    onClose(); // For now, just close modal
                  }}
                  style={styles.generateButton}
                  testID="save-generated-trip"
                />
              </>
            ) : (
              /* No data - show normal form buttons */
              <>
                <CustomButton
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.cancelButton}
                  disabled={loading}
                />
                <CustomButton
                  title="Generate Plan"
                  onPress={handleGeneratePlan}
                  loading={loading}
                  disabled={loading}
                  style={styles.generateButton}
                  testID="generate-plan-button"
                />
              </>
            )}
          </View>
          )}
        </View>
      </View>

      {/* Travel Style Dropdown Modal */}
      {showTravelStyleDropdown && (
        <Modal
          visible={showTravelStyleDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTravelStyleDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowTravelStyleDropdown(false)}
          >
            <TouchableOpacity style={styles.dropdownContainer} activeOpacity={1}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Select Travel Style</Text>
                <TouchableOpacity onPress={() => setShowTravelStyleDropdown(false)}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                {travelStyleOptions.map(renderTravelStyleOption)}
              </ScrollView>
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
    maxWidth: 420,
    maxHeight: '85%',
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  loadingContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.input.text,
    marginBottom: 8,
  },
  travelStyleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  travelStyleButtonError: {
    borderColor: colors.input.borderError,
    backgroundColor: colors.status.error.background,
  },
  travelStyleButtonText: {
    fontSize: 16,
    color: colors.input.text,
  },
  characterCounter: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
  tipsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  errorText: {
    color: colors.status.error.main,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
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
  generateButton: {
    flex: 1,
  },
  // Preview styles
  previewContainer: {
    paddingVertical: 8,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  tripPreview: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  itineraryPreview: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dayPreview: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    marginBottom: 4,
  },
  activityText: {
    fontSize: 13,
    color: colors.text.primary,
    marginLeft: 8,
    lineHeight: 18,
  },
  moreText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
  },

  // Dropdown styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dropdownContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
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
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dropdownList: {
    maxHeight: 300,
  },
  travelStyleOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  travelStyleOptionSelected: {
    backgroundColor: colors.primary.light + '20',
  },
  travelStyleOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  travelStyleOptionLabelSelected: {
    color: colors.primary.main,
  },
  travelStyleOptionDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  travelStyleOptionDescriptionSelected: {
    color: colors.primary.dark,
  },
});

export default AITripPlanningModal;
