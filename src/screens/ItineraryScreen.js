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
import { colors } from '../theme/colors';

const ItineraryScreen = ({ navigation, route }) => {
  const { tripId, tripName } = route.params;
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);

  // Simulate loading while checking for existing itinerary
  useEffect(() => {
    const loadTripData = async () => {
      // TODO: Load trip data and check for existing itinerary
      // For now, we'll simulate a loading delay
      setTimeout(() => {
        setTrip({ id: tripId, name: tripName });
        setLoading(false);
      }, 1000);
    };

    loadTripData();
  }, [tripId, tripName]);

  const handleBackPress = () => {
    navigation.goBack();
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
        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <View style={styles.illustrationContainer}>
            <Ionicons 
              name="map-outline" 
              size={80} 
              color={colors.text.secondary} 
            />
          </View>
          
          <Text style={styles.emptyTitle}>No itinerary yet</Text>
          <Text style={styles.emptySubtitle}>
            Start building your perfect trip by adding activities, places to visit, and travel plans.
          </Text>
          
          <TouchableOpacity style={styles.createButton}>
            <Ionicons name="add" size={20} color={colors.text.inverse} />
            <Text style={styles.createButtonText}>Create Itinerary</Text>
          </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
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
