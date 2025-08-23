import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import ScreenHeader from '../components/layout/ScreenHeader';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { getUserTrips, searchTrips, getTripsByStatus } from '../services/trips';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { TRIP_STATUS } from '../utils/tripConstants';

const TripListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Status filter options
  const statusFilters = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: TRIP_STATUS.PLANNING, label: 'Planning', icon: 'calendar-outline' },
    { key: TRIP_STATUS.ACTIVE, label: 'Active', icon: 'airplane-outline' },
    { key: TRIP_STATUS.COMPLETED, label: 'Completed', icon: 'checkmark-circle-outline' },
    { key: TRIP_STATUS.CANCELLED, label: 'Cancelled', icon: 'close-circle-outline' },
  ];

  // Sort options
  const sortOptions = [
    { key: 'createdAt', label: 'Date Created' },
    { key: 'startDate', label: 'Trip Date' },
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
  ];

  // Load trips
  const loadTrips = async (isRefresh = false, statusFilter = null) => {
    try {
      setError(null);
      if (!isRefresh) setLoading(true);

      let tripsData = [];
      const currentStatus = statusFilter !== null ? statusFilter : selectedStatus;
      
      if (searchTerm.trim()) {
        // Search trips
        tripsData = await searchTrips(user.uid, searchTerm);
      } else if (currentStatus !== 'all') {
        // Filter by status
        tripsData = await getTripsByStatus(user.uid, currentStatus);
      } else {
        // Get all trips
        tripsData = await getUserTrips(user.uid);
      }

      // Sort trips
      const sortedTrips = sortTrips(tripsData, sortBy);
      setTrips(sortedTrips);

    } catch (err) {
      console.error('Error loading trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sort trips by specified criteria
  const sortTrips = (tripsData, sortKey) => {
    return [...tripsData].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'startDate':
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          return new Date(a.startDate) - new Date(b.startDate);
        case 'createdAt':
        default:
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips(true);
  };

  // Handle search
  const handleSearch = (text) => {
    setSearchTerm(text);
    // Debounce search - reload trips after user stops typing
    setTimeout(() => {
      loadTrips();
    }, 500);
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    loadTrips(false, status);
  };

  // Handle sort change
  const handleSortChange = (sortKey) => {
    setSortBy(sortKey);
    const sortedTrips = sortTrips(trips, sortKey);
    setTrips(sortedTrips);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No date set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case TRIP_STATUS.PLANNING:
        return colors.primary.main;
      case TRIP_STATUS.ACTIVE:
        return colors.success;
      case TRIP_STATUS.COMPLETED:
        return colors.text.secondary;
      case TRIP_STATUS.CANCELLED:
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  // Render trip item
  const renderTripItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.tripCardHeader}>
        <Text style={styles.tripName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.tripCardContent}>
        <View style={styles.tripInfo}>
          <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.tripLocation} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        
        <View style={styles.tripInfo}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.tripDates}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
        
        {item.description && (
          <Text style={styles.tripDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="airplane-outline" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyStateTitle}>
        {searchTerm ? 'No trips found' : 'No trips yet'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchTerm 
          ? `No trips match "${searchTerm}". Try adjusting your search.`
          : 'Start planning your next adventure by creating your first trip!'
        }
      </Text>
      {!searchTerm && (
        <TouchableOpacity 
          style={styles.createTripButton}
          onPress={() => navigation.navigate('CreateTrip')}
        >
          <Text style={styles.createTripButtonText}>Create Your First Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text style={styles.errorStateTitle}>Something went wrong</Text>
      <Text style={styles.errorStateText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => loadTrips()}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Load trips on mount
  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  return (
    <ScreenLayout scrollable={false}>
      {/* Header */}
      <ScreenHeader 
        navigation={navigation}
        title="My Trips"
        showBackButton={true}
        rightElement={
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('CreateTrip')}
          >
            <Ionicons name="add" size={24} color={colors.background.primary} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips..."
            placeholderTextColor={colors.text.secondary}
            value={searchTerm}
            onChangeText={handleSearch}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={statusFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item.key && styles.filterChipActive
              ]}
              onPress={() => handleStatusFilter(item.key)}
            >
              <Ionicons 
                name={item.icon} 
                size={16} 
                color={selectedStatus === item.key ? colors.background.primary : colors.text.secondary} 
              />
              <Text style={[
                styles.filterChipText,
                selectedStatus === item.key && styles.filterChipTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <FlatList
          data={sortOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.sortChip,
                sortBy === item.key && styles.sortChipActive
              ]}
              onPress={() => handleSortChange(item.key)}
            >
              <Text style={[
                styles.sortChipText,
                sortBy === item.key && styles.sortChipTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {/* Trip List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" showBackground={false} />
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tripList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersList: {
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.background.primary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: 12,
  },
  sortList: {
    paddingHorizontal: 4,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sortChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  sortChipText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: colors.background.primary,
  },
  tripList: {
    flexGrow: 1,
  },
  tripCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background.primary,
    textTransform: 'capitalize',
  },
  tripCardContent: {
    gap: 8,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripLocation: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  tripDates: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text.secondary,
  },
  tripDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createTripButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TripListScreen;
