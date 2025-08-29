import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import TripDetailsHeader from '../components/trip-details/TripDetailsHeader';
import TripDateDisplay from '../components/trip-details/TripDateDisplay';
import TripDescription from '../components/trip-details/TripDescription';
import TripStatistics from '../components/trip-details/TripStatistics';
import { useTripDetails } from '../context/TripDetailsContext';
import { useAuth } from '../context/AuthContext';
import { useEditMode } from '../context/EditModeContext';
import { colors } from '../theme/colors';

const TripDetailsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { tripId } = route.params;
  const { 
    isEditMode, 
    toggleEditMode, 
    isSaving, 
    hasUnsavedChanges, 
    markUnsavedChanges,
    clearUnsavedChanges,
    exitEditMode
  } = useEditMode();
  
  const {
    currentTrip: trip,
    loading,
    error,
    loadTrip,
    deleteCurrentTrip,
    saveInlineEdit,
    clearTripDetails
  } = useTripDetails();
  
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTrip(tripId, user.uid);
    } finally {
      setRefreshing(false);
    }
  };

  // Load trip on mount
  useEffect(() => {
    if (tripId && user?.uid) {
      loadTrip(tripId, user.uid);
    }
  }, [tripId, user?.uid, loadTrip]);

  // Handle back button press with unsaved changes warning
  const handleBackPress = () => {
    if (isEditMode && hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => {
              exitEditMode();
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      if (isEditMode) {
        exitEditMode();
      }
      navigation.goBack();
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    toggleEditMode();
  };

  // Handle delete trip
  const handleDeleteTrip = () => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteCurrentTrip(user.uid);
              if (success) {
                navigation.goBack();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete trip. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle share trip (placeholder for future implementation)
  const handleShareTrip = () => {
    Alert.alert('Share Trip', 'Share functionality will be implemented in a future update.');
  };

  // Handle itinerary navigation
  const handleItineraryPress = () => {
    navigation.navigate('Itinerary', {
      tripId: tripId,
      tripName: trip?.name
    });
  };

  // Handle trip updates for inline editing
  const handleTripUpdate = async (updates) => {
    try {
      // Mark that there are unsaved changes
      markUnsavedChanges();
      
      // For now, we'll update each field individually
      // In a more sophisticated implementation, we could batch updates
      for (const [field, value] of Object.entries(updates)) {
        await saveInlineEdit(field, value, user.uid);
      }
      
      // Clear unsaved changes after successful save
      clearUnsavedChanges();
    } catch (err) {
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    }
  };

  // Handle title editing
  const handleTitleEdit = async (newTitle) => {
    try {
      markUnsavedChanges();
      await saveInlineEdit('name', newTitle, user.uid);
      clearUnsavedChanges();
    } catch (err) {
      Alert.alert('Error', 'Failed to update trip name. Please try again.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTripDetails();
    };
  }, [clearTripDetails]);

  // Render loading state
  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
        </View>
      </ScreenLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <ScreenLayout>
        <ScreenHeader 
          navigation={navigation}
          showBackButton={true}
          onBackPress={handleBackPress}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.error} />
          <Text style={styles.errorText}>Failed to load trip details</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTrip()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  // Render empty state
  if (!trip) {
    return (
      <ScreenLayout>
        <ScreenHeader 
          navigation={navigation}
          showBackButton={true}
          onBackPress={handleBackPress}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color={colors.text.secondary} />
          <Text style={styles.emptyText}>Trip not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScreenHeader 
        navigation={navigation}
        showBackButton={true}
        onBackPress={handleBackPress}
        showEditButton={true}
        isEditMode={isEditMode}
        onEditToggle={handleEditToggle}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        showItineraryButton={true}
        onItineraryPress={handleItineraryPress}
        showContextMenu={true}
        contextMenuActions={[
          {
            id: 'share',
            title: 'Share',
            icon: 'share-outline',
            destructive: false,
          },
          {
            id: 'export',
            title: 'Export',
            icon: 'download-outline',
            destructive: false,
          },
          {
            id: 'delete',
            title: 'Delete',
            icon: 'trash-outline',
            destructive: true,
          }
        ]}
        onContextMenuAction={(action) => {
          if (action.id === 'delete') {
            handleDeleteTrip();
          } else if (action.id === 'share') {
            Alert.alert('Share Trip', 'Share functionality will be implemented in a future update.');
          } else if (action.id === 'export') {
            Alert.alert('Export Trip', 'Export functionality will be implemented in a future update.');
          }
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Trip Details Header with inline editing */}
        <TripDetailsHeader
          trip={trip}
          onUpdate={handleTripUpdate}
        />

        {/* Trip Date Display with inline editing */}
        <TripDateDisplay
          trip={trip}
          onUpdate={handleTripUpdate}
        />

        {/* Trip Description with inline editing */}
        <TripDescription
          trip={trip}
          onUpdate={handleTripUpdate}
        />

        {/* Trip Statistics (read-only) */}
        <TripStatistics trip={trip} />
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 16,
  },
});

export default TripDetailsScreen;
