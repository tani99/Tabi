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
    deleteDay 
  } = useItinerary();
  const [selectedDay, setSelectedDay] = useState(1);

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
          
          {/* Empty State for Day */}
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
            
            <TouchableOpacity style={styles.createButton}>
              <Ionicons name="add" size={20} color={colors.text.inverse} />
              <Text style={styles.createButtonText}>Add Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
});

export default ItineraryScreen;
