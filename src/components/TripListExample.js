import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import TripList from './TripList';
import { getUserTrips } from '../services/trips';
import { useAuth } from '../context/AuthContext';

const TripListExample = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const userTrips = await getUserTrips(user.uid);
      setTrips(userTrips);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const handleTripPress = (trip) => {
    console.log('Trip pressed:', trip.name);
    // Navigate to trip details screen
  };

  const handleCreateTrip = () => {
    console.log('Create trip pressed');
    // Navigate to create trip screen
  };

  return (
    <View style={styles.container}>
      <TripList
        trips={trips}
        loading={loading}
        error={error}
        onRefresh={fetchTrips}
        onTripPress={handleTripPress}
        onRetry={fetchTrips}
        onEmptyStateButtonPress={handleCreateTrip}
        emptyStateMessage="Start your travel journey by creating your first trip!"
        emptyStateButtonText="Create Your First Trip"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TripListExample;
