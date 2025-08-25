import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import CustomButton from '../components/CustomButton';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { getUserTrips } from '../services/trips';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { TRIP_STATUS, TRIP_STATUS_LABELS, inferTripStatus } from '../utils/tripConstants';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's trips for preview and statistics
  const loadUserTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const trips = await getUserTrips(user.uid);
      
      // Get recent trips (limit to 3)
      const recent = trips.slice(0, 3);
      setRecentTrips(recent);
      
    } catch (err) {
      console.error('Error loading trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No date set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case TRIP_STATUS.UPCOMING:
        return colors.primary.main;
      case TRIP_STATUS.ONGOING:
        return colors.status.success.main;
      case TRIP_STATUS.COMPLETED:
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  // Render recent trip item
  const renderRecentTrip = ({ item }) => {
    const tripStatus = inferTripStatus(item.startDate, item.endDate);
    return (
      <TouchableOpacity 
        style={styles.recentTripCard}
        onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.recentTripHeader}>
          <Text style={styles.recentTripName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tripStatus) }]}>
            <Text style={styles.statusText}>{TRIP_STATUS_LABELS[tripStatus]}</Text>
          </View>
        </View>
      
              <View style={styles.recentTripInfo}>
          <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.recentTripLocation} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        
        <View style={styles.recentTripInfo}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.recentTripDates}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Load trips on mount
  useEffect(() => {
    if (user) {
      loadUserTrips();
    }
  }, [user]);

  return (
    <ScreenLayout>
      {/* Header */}
      <ScreenHeader 
        navigation={navigation}
        title="Tabi"
        showBackButton={false}
        rightElement={
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={28} color={colors.primary.main} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Recent Trips Preview */}
        <View style={styles.recentTripsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('TripList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingIndicator size="small" showBackground={false} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load trips</Text>
            </View>
          ) : recentTrips.length > 0 ? (
            <FlatList
              data={recentTrips}
              renderItem={renderRecentTrip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentTripsList}
            />
          ) : (
            <View style={styles.emptyTripsContainer}>
              <Ionicons name="airplane-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyTripsTitle}>No trips yet</Text>
              <Text style={styles.emptyTripsText}>
                Start planning your next adventure!
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('CreateTrip')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={32} color={colors.primary.main} />
              </View>
              <Text style={styles.quickActionTitle}>Create Trip</Text>
              <Text style={styles.quickActionSubtitle}>Plan a new adventure</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('TripList')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="list" size={32} color={colors.primary.main} />
              </View>
              <Text style={styles.quickActionTitle}>View All Trips</Text>
              <Text style={styles.quickActionSubtitle}>See all your trips</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('TripList', { showSearch: true })}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="search" size={32} color={colors.primary.main} />
              </View>
              <Text style={styles.quickActionTitle}>Search Trips</Text>
              <Text style={styles.quickActionSubtitle}>Find specific trips</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('TripList', { statusFilter: TRIP_STATUS.UPCOMING })}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar" size={32} color={colors.primary.main} />
              </View>
              <Text style={styles.quickActionTitle}>Upcoming</Text>
              <Text style={styles.quickActionSubtitle}>Trips coming up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <CustomButton
            title="Create New Trip"
            onPress={() => navigation.navigate('CreateTrip')}
            style={styles.actionButton}
          />
          <CustomButton
            title="View My Trips"
            variant="secondary"
            onPress={() => navigation.navigate('TripList')}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  recentTripsContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '500',
    marginRight: 4,
  },
  recentTripsList: {
    paddingHorizontal: 4,
  },
  recentTripCard: {
    width: 200,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTripName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background.primary,
    textTransform: 'capitalize',
  },
  recentTripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentTripLocation: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  recentTripDates: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.text.secondary,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyTripsContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTripsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyTripsText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionContainer: {
    paddingBottom: 20,
  },
  actionButton: {
    marginBottom: 16,
  },
});

export default HomeScreen;
