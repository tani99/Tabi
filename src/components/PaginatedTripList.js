import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserTripsPaginated, searchTripsPaginated } from '../services/trips';
import { useTripPagination } from '../hooks/usePagination';
import TripList from './TripList';
import PaginationControls from './ui/PaginationControls';

/**
 * Enhanced TripList component with pagination support
 * Demonstrates the new pagination functionality
 */
const PaginatedTripList = ({
  searchTerm = null,
  pageSize = 10,
  orderField = 'createdAt',
  orderDirection = 'desc',
  onTripPress,
  onCreateTrip,
  style
}) => {
  const { user } = useAuth();
  
  const pagination = useTripPagination({
    initialPageSize: pageSize,
    maxPageSize: 50
  });

  const {
    data: trips,
    loading,
    error,
    hasMore,
    totalLoaded,
    loadFirstPage,
    loadNextPage,
    refresh,
    updatePageSize,
    canLoadMore,
    isEmpty,
    hasError
  } = pagination;

  // Load trips function - handles both search and regular loading
  const loadTrips = useCallback(async (userId, options = {}) => {
    if (searchTerm && searchTerm.trim()) {
      return await searchTripsPaginated(userId, searchTerm.trim(), {
        ...options,
        orderField,
        orderDirection
      });
    } else {
      return await getUserTripsPaginated(userId, {
        ...options,
        orderField,
        orderDirection
      });
    }
  }, [searchTerm, orderField, orderDirection]);

  // Initial load when component mounts or search term changes
  useEffect(() => {
    if (user?.uid) {
      loadFirstPage(loadTrips, user.uid);
    }
  }, [user?.uid, searchTerm, loadFirstPage, loadTrips]);

  // Load more trips for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (user?.uid && canLoadMore) {
      loadNextPage(loadTrips, user.uid);
    }
  }, [user?.uid, canLoadMore, loadNextPage, loadTrips]);

  // Refresh trips
  const handleRefresh = useCallback(() => {
    if (user?.uid) {
      refresh(loadTrips, user.uid);
    }
  }, [user?.uid, refresh, loadTrips]);

  // Retry on error
  const handleRetry = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Update page size
  const handlePageSizeChange = useCallback(async (newPageSize) => {
    if (user?.uid) {
      await updatePageSize(newPageSize, loadTrips, user.uid);
    }
  }, [user?.uid, updatePageSize, loadTrips]);

  // Handle trip press
  const handleTripPress = useCallback((trip) => {
    if (onTripPress) {
      onTripPress(trip);
    }
  }, [onTripPress]);

  // Handle create trip
  const handleCreateTrip = useCallback(() => {
    if (onCreateTrip) {
      onCreateTrip();
    }
  }, [onCreateTrip]);

  // Show page size selector for demonstration
  const showPageSizeOptions = useCallback(() => {
    const options = [5, 10, 20, 50];
    const buttons = options.map(size => ({
      text: `${size} per page`,
      onPress: () => handlePageSizeChange(size)
    }));
    
    buttons.push({ text: 'Cancel', style: 'cancel' });
    
    Alert.alert('Page Size', 'Choose how many trips to load per page:', buttons);
  }, [handlePageSizeChange]);

  if (!user) {
    return null;
  }

  const errorMessage = hasError ? error : null;
  const emptyMessage = searchTerm 
    ? `No trips found matching "${searchTerm}"`
    : "You haven't created any trips yet";

  return (
    <View style={[styles.container, style]}>
      <TripList
        trips={trips}
        loading={loading && trips.length === 0} // Only show loading for initial load
        error={errorMessage}
        onRefresh={handleRefresh}
        onTripPress={handleTripPress}
        onRetry={handleRetry}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        showEmptyState={isEmpty}
        emptyStateMessage={emptyMessage}
        emptyStateButtonText="Create Your First Trip"
        onEmptyStateButtonPress={handleCreateTrip}
        style={styles.tripList}
      />
      
      <PaginationControls
        loading={loading}
        hasMore={hasMore}
        totalLoaded={totalLoaded}
        currentPage={Math.ceil(totalLoaded / pageSize)}
        pageSize={pageSize}
        onLoadMore={canLoadMore ? handleLoadMore : null}
        onRefresh={handleRefresh}
        errorText={hasError ? error : null}
        emptyText={emptyMessage}
        showRefresh={true}
        showStats={true}
        style={styles.paginationControls}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tripList: {
    flex: 1,
  },
  paginationControls: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
  },
});

export default PaginatedTripList;
