import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import DayView from '../components/DayView';
import AddActivityModal from '../components/AddActivityModal';
import ActivityItem from '../components/ActivityItem';
import { useTripDetails } from '../context/TripDetailsContext';
import { useItinerary } from '../context/ItineraryContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const ItineraryScreen = ({ navigation, route }) => {
  const { tripId, tripName } = route.params;
  const { user } = useAuth();
  const { currentTrip: trip, loading, loadTrip } = useTripDetails();
  const { 
    itinerary, 
    loading: itineraryLoading, 
    addDay, 
    getItinerary,
    deleteDay,
    addActivity,
    updateActivity,
    deleteActivity
  } = useItinerary();
  const [selectedDay, setSelectedDay] = useState(1);
  
  // Add Activity Modal state
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);
  
  // Edit Activity Modal state
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [updatingActivity, setUpdatingActivity] = useState(false);

  // Calculate total days based on trip dates or stored days
  const totalDays = React.useMemo(() => {
    if (itinerary?.days?.length > 0) {
      return itinerary.days.length;
    }
    
    if (trip?.startDate && trip?.endDate) {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    return 0;
  }, [trip?.startDate, trip?.endDate, itinerary?.days]);

  // Load trip data on mount
  useEffect(() => {
    if (tripId && user?.uid) {
      loadTrip(tripId, user.uid);
      getItinerary(tripId);
    }
  }, [tripId, user?.uid, loadTrip, getItinerary]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    // TODO: Load itinerary data for the selected day
    console.log(`Selected day: ${day}`);
  };

  const handleAddDay = async (newDayNumber) => {
    try {
      await addDay(tripId, newDayNumber);
      // Switch to the newly added day
      setSelectedDay(newDayNumber);
      console.log(`Added day ${newDayNumber}`);
    } catch (error) {
      console.error('Error adding day:', error);
      Alert.alert('Error', 'Failed to add day. Please try again.');
    }
  };

  const handleDeleteDay = async (dayToDelete) => {
    try {
      // Get current days to determine which day to switch to
      const currentDays = itinerary?.days || [];
      const dayIndex = dayToDelete - 1; // Convert to 0-based index
      
      // Delete the day
      await deleteDay(tripId, dayIndex);
      
      // Handle day switching logic
      if (currentDays.length <= 1) {
        // If this was the last day, stay on day 1
        setSelectedDay(1);
      } else if (dayToDelete === selectedDay) {
        // If we deleted the currently selected day, switch to an adjacent day
        if (dayToDelete === currentDays.length) {
          // If we deleted the last day, switch to the previous day
          setSelectedDay(dayToDelete - 1);
        } else {
          // Otherwise, switch to the next day (which will now be at the same index)
          setSelectedDay(dayToDelete);
        }
      }
      
      console.log(`Deleted day ${dayToDelete}`);
    } catch (error) {
      console.error('Error deleting day:', error);
      Alert.alert('Error', 'Failed to delete day. Please try again.');
    }
  };

  // Add Activity Modal handlers
  const handleOpenAddActivityModal = () => {
    setShowAddActivityModal(true);
  };

  const handleCloseAddActivityModal = () => {
    setShowAddActivityModal(false);
  };

  const handleSaveActivity = async (activity) => {
    try {
      setAddingActivity(true);
      
      // Ensure we have the necessary data
      if (!tripId) {
        throw new Error('Trip ID is required');
      }
      if (!selectedDay || selectedDay < 1) {
        throw new Error('Valid day selection is required');
      }
      if (!itinerary?.days || itinerary.days.length < selectedDay) {
        throw new Error('Selected day does not exist in itinerary');
      }
      
      // Convert selectedDay to zero-based index
      const dayIndex = selectedDay - 1;
      
      console.log('Saving activity:', activity);
      console.log('For day index:', dayIndex, '(day', selectedDay, ')');
      console.log('Trip ID:', tripId);
      
      // Save activity to Firestore via the itinerary service
      await addActivity(tripId, dayIndex, activity);
      
      // Show success message
      Alert.alert('Success', 'Activity added successfully!');
      
      // Close the modal
      setShowAddActivityModal(false);
      
    } catch (error) {
      console.error('Error saving activity:', error);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to save activity. Please try again.';
      if (error.message.includes('authenticated')) {
        errorMessage = 'Please log in to save activities.';
      } else if (error.message.includes('Day at index')) {
        errorMessage = 'Please add a day to your itinerary first.';
      } else if (error.message.includes('required')) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingActivity(false);
    }
  };

  const getCurrentDayActivities = () => {
    try {
      if (!itinerary?.days || !selectedDay || selectedDay < 1) {
        return [];
      }
      
      const dayIndex = selectedDay - 1;
      const currentDay = itinerary.days[dayIndex];
      
      if (!currentDay?.activities || currentDay.activities.length === 0) {
        return [];
      }
      
      // Sort activities by start time
      return [...currentDay.activities].sort((a, b) => {
        const aStartTime = new Date(a.startTime);
        const bStartTime = new Date(b.startTime);
        return aStartTime.getTime() - bStartTime.getTime();
      });
    } catch (error) {
      console.error('Error getting current day activities:', error);
      return [];
    }
  };

  const getLastActivityEndTime = () => {
    try {
      const activities = getCurrentDayActivities();
      
      if (activities.length === 0) {
        return null;
      }
      
      // Sort activities by end time and get the last one
      const sortedActivities = [...activities].sort((a, b) => {
        const aEndTime = new Date(a.endTime);
        const bEndTime = new Date(b.endTime);
        return aEndTime.getTime() - bEndTime.getTime();
      });
      
      const lastActivity = sortedActivities[sortedActivities.length - 1];
      if (lastActivity?.endTime) {
        return new Date(lastActivity.endTime);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting last activity end time:', error);
      return null;
    }
  };

  // Activity handlers
  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowEditActivityModal(true);
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      if (!tripId || !selectedDay || selectedDay < 1) {
        throw new Error('Invalid trip or day selection');
      }

      const dayIndex = selectedDay - 1;
      await deleteActivity(tripId, dayIndex, activityId);
      
      Alert.alert('Success', 'Activity deleted successfully!');
    } catch (error) {
      console.error('Error deleting activity:', error);
      Alert.alert('Error', 'Failed to delete activity. Please try again.');
    }
  };

  const handleUpdateActivity = async (updatedActivity) => {
    try {
      if (!tripId || !selectedDay || selectedDay < 1) {
        throw new Error('Invalid trip or day selection');
      }

      // Check if there are any changes to avoid unnecessary updates
      const hasChanges = (
        editingActivity.title !== updatedActivity.title ||
        editingActivity.notes !== updatedActivity.notes ||
        new Date(editingActivity.startTime).getTime() !== updatedActivity.startTime.getTime() ||
        new Date(editingActivity.endTime).getTime() !== updatedActivity.endTime.getTime()
      );

      if (!hasChanges) {
        // No changes detected, just close the modal
        setShowEditActivityModal(false);
        setEditingActivity(null);
        return;
      }

      // Show confirmation dialog for changes
      Alert.alert(
        'Confirm Changes',
        'Are you sure you want to save these changes to the activity?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save Changes',
            style: 'default',
            onPress: async () => {
              try {
                setUpdatingActivity(true);
                const dayIndex = selectedDay - 1;
                await updateActivity(tripId, dayIndex, editingActivity.id, updatedActivity);
                
                // Enhanced success feedback
                Alert.alert(
                  'Activity Updated',
                  `"${updatedActivity.title}" has been successfully updated.`,
                  [{ text: 'OK' }]
                );
                
                setShowEditActivityModal(false);
                setEditingActivity(null);
              } catch (error) {
                console.error('Error updating activity:', error);
                
                // Enhanced error handling with specific messages
                let errorMessage = 'Failed to update activity. Please try again.';
                if (error.message.includes('authenticated')) {
                  errorMessage = 'Please log in to update activities.';
                } else if (error.message.includes('not found')) {
                  errorMessage = 'Activity not found. It may have been deleted.';
                } else if (error.message.includes('network')) {
                  errorMessage = 'Network error. Please check your connection and try again.';
                }
                
                Alert.alert('Update Failed', errorMessage);
              } finally {
                setUpdatingActivity(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error preparing activity update:', error);
      Alert.alert('Error', 'Failed to prepare activity update. Please try again.');
    }
  };

  // Render loading state
  if (loading || itineraryLoading) {
    return (
      <ScreenLayout scrollable={false}>
        <ScreenHeader 
          navigation={navigation}
          title={tripName || "Itinerary"}
          showBackButton={true}
          onBackPress={handleBackPress}
        />
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable={false}>
      <ScreenHeader 
        navigation={navigation}
        title={trip?.name || "Itinerary"}
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        {/* Day Navigation - Only show if trip has dates */}
        {trip?.startDate && trip?.endDate ? (
          <DayView
            tripStartDate={trip.startDate}
            tripEndDate={trip.endDate}
            selectedDay={selectedDay}
            onDayChange={handleDayChange}
            onDeleteDay={handleDeleteDay}
            onAddDay={() => handleAddDay((itinerary?.days?.length || 0) + 1)}
            storedDays={itinerary?.days || []}
            totalDays={totalDays}
            style={styles.dayView}
          />
        ) : (
          <View style={styles.noDatesContainer}>
            <Text style={styles.noDatesText}>
              Please set trip dates to view itinerary
            </Text>
          </View>
        )}
        
        {/* Day Content */}
        <View style={styles.dayContent}>
          {trip?.startDate && trip?.endDate ? (
            <Text style={styles.dayTitle}>Day {selectedDay} Itinerary</Text>
          ) : (
            <Text style={styles.dayTitle}>Itinerary</Text>
          )}
          
          {(() => {
            const activities = getCurrentDayActivities();
            
            if (activities.length > 0) {
              return (
                <View style={styles.activitiesContainer}>
                  {/* Activities List */}
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id || `activity-${index}`}
                      activity={activity}
                      onEdit={handleEditActivity}
                      onDelete={handleDeleteActivity}
                      testID={`activity-item-${index}`}
                    />
                  ))}
                  
                  {/* Add Activity Button */}
                  <TouchableOpacity 
                    style={styles.addActivityButton}
                    onPress={handleOpenAddActivityModal}
                  >
                    <Ionicons name="add" size={18} color={colors.primary.main} />
                    <Text style={styles.addActivityButtonText}>Add Activity</Text>
                  </TouchableOpacity>
                </View>
              );
            } else {
              return (
                <View style={styles.emptyContainer}>
                  <View style={styles.illustrationContainer}>
                    <Ionicons 
                      name="map-outline" 
                      size={60} 
                      color={colors.text.secondary} 
                    />
                  </View>
                  
                  <Text style={styles.emptyTitle}>
                    {trip?.startDate && trip?.endDate ? 'No activities planned' : 'No itinerary yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {trip?.startDate && trip?.endDate 
                      ? `Add activities, places to visit, and travel plans for Day ${selectedDay}.`
                      : 'Start building your perfect trip by adding activities, places to visit, and travel plans.'
                    }
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={handleOpenAddActivityModal}
                  >
                    <Ionicons name="add" size={20} color={colors.text.inverse} />
                    <Text style={styles.createButtonText}>Add Activity</Text>
                  </TouchableOpacity>
                </View>
              );
            }
          })()}
        </View>
      </ScrollView>

      {/* Add Activity Modal */}
      <AddActivityModal
        visible={showAddActivityModal}
        onClose={handleCloseAddActivityModal}
        onSave={handleSaveActivity}
        lastActivityEndTime={getLastActivityEndTime()}
        loading={addingActivity}
      />

      {/* Edit Activity Modal */}
      <AddActivityModal
        visible={showEditActivityModal}
        onClose={() => {
          setShowEditActivityModal(false);
          setEditingActivity(null);
        }}
        onSave={handleUpdateActivity}
        lastActivityEndTime={getLastActivityEndTime()}
        loading={updatingActivity}
        editingActivity={editingActivity}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  dayView: {
    marginBottom: 24,
  },
  noDatesContainer: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  noDatesText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  dayContent: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  illustrationContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activitiesContainer: {
    flex: 1,
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    marginTop: 16,
  },
  addActivityButtonText: {
    color: colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ItineraryScreen;
