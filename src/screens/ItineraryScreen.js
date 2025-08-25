import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import DayView from '../components/DayView';
import { useTripDetails } from '../context/TripDetailsContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const ItineraryScreen = ({ navigation, route }) => {
  const { tripId, tripName } = route.params;
  const { user } = useAuth();
  const { currentTrip: trip, loading, loadTrip } = useTripDetails();
  const [selectedDay, setSelectedDay] = useState(1);

  // Load trip data on mount
  useEffect(() => {
    if (tripId && user?.uid) {
      loadTrip(tripId, user.uid);
    }
  }, [tripId, user?.uid, loadTrip]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    // TODO: Load itinerary data for the selected day
    console.log(`Selected day: ${day}`);
  };

  // Render loading state
  if (loading) {
    return (
      <ScreenLayout>
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
    <ScreenLayout>
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
      >
        {/* Day Navigation - Only show if trip has dates */}
        {trip?.startDate && trip?.endDate ? (
          <DayView
            tripStartDate={trip.startDate}
            tripEndDate={trip.endDate}
            selectedDay={selectedDay}
            onDayChange={handleDayChange}
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
