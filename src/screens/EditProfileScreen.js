import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../context/ProfileContext';
import ScreenLayout from '../components/layout/ScreenLayout';
import CustomInput from '../components/CustomInput';
import ProfileAvatar from '../components/profile/ProfileAvatar';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { pickImage, takePhoto } from '../services/photo';
import { colors } from '../theme/colors';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { profile, loading, error, updateProfile, updatePhoto, refreshProfile } = useProfile();
  
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    const originalName = profile?.displayName || '';
    setHasChanges(displayName !== originalName || selectedPhoto !== null);
  }, [displayName, selectedPhoto, profile]);

  const validateForm = () => {
    const newErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    } else if (displayName.trim().length > 50) {
      newErrors.displayName = 'Display name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Update display name
      const nameResult = await updateProfile(displayName.trim());
      if (!nameResult.success) {
        Alert.alert('Error', nameResult.error || 'Failed to update profile');
        setIsSaving(false);
        return;
      }

      // Update photo if selected
      if (selectedPhoto) {
        const photoResult = await updatePhoto(selectedPhoto.uri);
        if (!photoResult.success) {
          Alert.alert('Error', photoResult.error || 'Failed to update photo');
          setIsSaving(false);
          return;
        }
      }

      // Reset photo selection
      setSelectedPhoto(null);
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => {
          // Add a small delay to ensure Firebase Auth state updates
          setTimeout(() => {
            refreshProfile();
            navigation.goBack();
          }, 100);
        }}
      ]);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Continue Editing', style: 'cancel' },
          { 
            text: 'Discard Changes', 
            style: 'destructive',
            onPress: () => {
              setSelectedPhoto(null);
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };



  const showPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Change Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handlePickImage },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsUpdatingPhoto(true);
      const photo = await takePhoto();
      if (photo) {
        setSelectedPhoto(photo);
        setIsUpdatingPhoto(false);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to take photo');
      setIsUpdatingPhoto(false);
    }
  };

  const handlePickImage = async () => {
    try {
      setIsUpdatingPhoto(true);
      const photo = await pickImage();
      if (photo) {
        setSelectedPhoto(photo);
        setIsUpdatingPhoto(false);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pick image');
      setIsUpdatingPhoto(false);
    }
  };

  if (loading && !profile) {
    return (
      <ScreenLayout>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  if (error && !profile) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading profile: {error}</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerSaveButton, !hasChanges && styles.headerSaveButtonDisabled]}
          disabled={!hasChanges || isSaving}
        >
          <Text style={[styles.headerSaveButtonText, !hasChanges && styles.headerSaveButtonTextDisabled]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={showPhotoOptions}
            disabled={isUpdatingPhoto}
          >
            <ProfileAvatar photoURL={selectedPhoto?.uri || profile?.photoURL} size={100} />
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={24} color={colors.text.inverse} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.changePhotoButton, isUpdatingPhoto && styles.changePhotoButtonDisabled]} 
            onPress={showPhotoOptions}
            disabled={isUpdatingPhoto}
          >
            <Text style={[styles.changePhotoText, isUpdatingPhoto && styles.changePhotoTextDisabled]}>
              {isUpdatingPhoto ? 'Updating...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.cardContent}>
            <CustomInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              autoCapitalize="words"
              maxLength={50}
              error={errors.displayName}
            />
            
            <View style={styles.readOnlyField}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyText}>{profile?.email}</Text>
                <Ionicons name="lock-closed" size={16} color={colors.text.tertiary} />
              </View>
              <Text style={styles.fieldHelpText}>
                Email cannot be changed from this screen
              </Text>
            </View>
          </View>
        </View>

        {/* Account Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>{formatDate(profile?.creationTime)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
  },
  headerSaveButtonDisabled: {
    backgroundColor: colors.button.disabled.background,
  },
  headerSaveButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  headerSaveButtonTextDisabled: {
    color: colors.button.disabled.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  changePhotoText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  changePhotoTextDisabled: {
    color: colors.text.tertiary,
  },
  changePhotoButtonDisabled: {
    opacity: 0.5,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  cardContent: {
    gap: 16,
  },
  readOnlyField: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  readOnlyText: {
    fontSize: 16,
    color: colors.text.secondary,
    flex: 1,
  },
  fieldHelpText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
