import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import AIPromptInput from '../components/ai/AIPromptInput';
import AILoadingModal from '../components/ai/AILoadingModal';
import TripPreviewModal from '../components/ai/TripPreviewModal';
import useAITripPlanning from '../hooks/useAITripPlanning';
import { colors } from '../theme/colors';

const AITripPlanningScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    interests: '',
    budget: '',
    travelStyle: 'balanced',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showTravelStyleDropdown, setShowTravelStyleDropdown] = useState(false);

  const { 
    planTrip, 
    saveTrip, 
    reset: resetAI,
    isLoading: loading,
    loadingState,
    aiResponse,
    error,
    tripData,
    itineraryData,
    hasData: hasAIData
  } = useAITripPlanning();

  const travelStyleOptions = [
    { value: 'budget', label: 'Budget Traveler', description: 'Affordable accommodations and activities' },
    { value: 'balanced', label: 'Balanced Explorer', description: 'Mix of comfort and adventure' },
    { value: 'luxury', label: 'Luxury Seeker', description: 'Premium experiences and accommodations' },
    { value: 'adventure', label: 'Adventure Enthusiast', description: 'Active and outdoor experiences' },
    { value: 'cultural', label: 'Culture Lover', description: 'Museums, history, and local traditions' },
    { value: 'relaxation', label: 'Relaxation Focused', description: 'Spas, beaches, and peaceful activities' }
  ];

  // Manage loading modal
  useEffect(() => {
    if (loading) {
      setShowLoadingModal(true);
    } else if (!loading && showLoadingModal) {
      // Loading finished, but keep modal open briefly for completion state
      if (hasAIData && loadingState === 'complete') {
        const timer = setTimeout(() => {
          setShowLoadingModal(false);
          setShowPreviewModal(true);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setShowLoadingModal(false);
      }
    }
  }, [loading, hasAIData, loadingState, showLoadingModal]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else {
      const days = parseInt(formData.duration);
      if (isNaN(days) || days < 1 || days > 30) {
        newErrors.duration = 'Duration must be between 1-30 days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePlan = async () => {
    if (!validateForm()) return;

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const prompt = `Plan a ${formData.duration}-day trip to ${formData.destination}. 
      ${formData.interests ? `Interests: ${formData.interests}. ` : ''}
      ${formData.budget ? `Budget: ${formData.budget}. ` : ''}
      Travel style: ${travelStyleOptions.find(opt => opt.value === formData.travelStyle)?.label || 'Balanced'}. 
      ${formData.description ? `Additional details: ${formData.description}. ` : ''}
      Suggested travel dates: starting around ${nextWeek.toDateString()}.
      IMPORTANT: Generate dates that are in the future, not in the past.`;

    // Loading modal will open automatically via useEffect when loading becomes true
    const result = await planTrip(prompt);
    
    if (result.success && result.data) {
      console.log('AI trip plan generated successfully');
    } else {
      console.error('Failed to generate trip plan:', result.error);
      Alert.alert(
        'Generation Failed',
        result.error || 'Unable to generate trip plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCreateTrip = async () => {
    try {
      const result = await saveTrip();
      if (result.success) {
        setShowPreviewModal(false);
        Alert.alert(
          'Trip Created!',
          'Your AI-generated trip has been saved successfully.',
          [
            {
              text: 'View Trip',
              onPress: () => {
                // Navigate to trip details
                navigation.navigate('TripDetails', { tripId: result.tripId });
              }
            },
            {
              text: 'Create Another',
              onPress: () => {
                resetAI();
                setFormData({
                  destination: '',
                  duration: '',
                  interests: '',
                  budget: '',
                  travelStyle: 'balanced',
                  description: ''
                });
                setErrors({});
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Save Failed',
          result.error || 'Unable to save trip. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving AI trip:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while saving. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGenerateAnother = () => {
    setShowPreviewModal(false);
    resetAI();
    // Keep form data so user can modify and regenerate
  };

  const handleEditManually = () => {
    setShowPreviewModal(false);
    navigation.navigate('CreateTrip');
  };

  const getTravelStyleDisplay = () => {
    const style = travelStyleOptions.find(option => option.value === formData.travelStyle);
    return style ? style.label : 'Balanced';
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
    <ScreenLayout>
      <ScreenHeader
        title="AI Trip Planning"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={32} color={colors.primary.main} />
          </View>
          <Text style={styles.headerTitle}>Plan with AI</Text>
          <Text style={styles.headerSubtitle}>
            Tell us about your dream trip and we'll create a personalized itinerary for you!
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
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
            />
          </View>

          {/* Interests Field */}
          <View style={styles.inputContainer}>
            <CustomInput
              label="Interests & Activities"
              value={formData.interests}
              onChangeText={(text) => updateFormData('interests', text)}
              placeholder="Museums, hiking, food tours, nightlife..."
              multiline={true}
              numberOfLines={3}
            />
          </View>

          {/* Budget Field */}
          <View style={styles.inputContainer}>
            <CustomInput
              label="Budget Range"
              value={formData.budget}
              onChangeText={(text) => updateFormData('budget', text)}
              placeholder="e.g., $1000-2000, Budget-friendly, Luxury"
            />
          </View>

          {/* Travel Style Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Travel Style</Text>
            <TouchableOpacity
              style={styles.travelStyleSelector}
              onPress={() => setShowTravelStyleDropdown(true)}
            >
              <Text style={styles.travelStyleText}>{getTravelStyleDisplay()}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Description Field */}
          <View style={styles.inputContainer}>
            <AIPromptInput
              label="Additional Details (Optional)"
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              placeholder="Any specific requests, accessibility needs, or preferences..."
            />
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Generate AI Trip Plan"
            onPress={handleGeneratePlan}
            style={styles.generateButton}
            icon="sparkles"
            testID="generate-ai-plan-button"
          />
        </View>
      </ScrollView>

      {/* Travel Style Dropdown Modal */}
      {showTravelStyleDropdown && (
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowTravelStyleDropdown(false)}
        >
          <TouchableOpacity
            style={styles.dropdownContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Travel Style</Text>
              <TouchableOpacity onPress={() => setShowTravelStyleDropdown(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              {travelStyleOptions.map(renderTravelStyleOption)}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* AI Loading Modal */}
      <AILoadingModal
        visible={showLoadingModal}
        loadingState={loadingState}
        onCancel={() => {
          resetAI();
          setShowLoadingModal(false);
        }}
        canCancel={loadingState !== 'complete'}
        showTimeEstimate={loadingState !== 'complete'}
      />

      {/* Trip Preview Modal */}
      <TripPreviewModal
        visible={showPreviewModal}
        tripData={tripData}
        itineraryData={itineraryData}
        onClose={() => setShowPreviewModal(false)}
        onCreateTrip={handleCreateTrip}
        onGenerateAnother={handleGenerateAnother}
        onEditManually={handleEditManually}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  travelStyleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  travelStyleText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  generateButton: {
    marginTop: 8,
  },
  // Dropdown styles
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '85%',
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

export default AITripPlanningScreen;
