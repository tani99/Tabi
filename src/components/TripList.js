import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import TripCard from './TripCard';
import LoadingIndicator from './ui/LoadingIndicator';
import CustomButton from './CustomButton';

const TripList = ({
  trips = [],
  loading = false,
  error = null,
  onRefresh,
  onTripPress,
  onRetry,
  onLoadMore,
  hasMore = false,
  style,
  contentContainerStyle,
  showEmptyState = true,
  emptyStateMessage = "You haven't created any trips yet",
  emptyStateButtonText = "Create Your First Trip",
  onEmptyStateButtonPress,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  // Render individual trip item
  const renderTripItem = useCallback(({ item, index }) => (
    <TripCard
      trip={item}
      onPress={() => onTripPress?.(item)}
      style={index === 0 ? styles.firstCard : undefined}
    />
  ), [onTripPress]);

  // Render loading skeleton cards
  const renderLoadingSkeleton = useCallback(() => {
    const skeletonTrips = Array.from({ length: 3 }, (_, index) => ({
      id: `skeleton-${index}`,
      loading: true,
    }));

    return skeletonTrips.map((skeleton, index) => (
      <TripCard
        key={skeleton.id}
        trip={skeleton}
        loading={true}
        style={index === 0 ? styles.firstCard : undefined}
      />
    ));
  }, []);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (!showEmptyState || loading) return null;

    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateIcon}>
          <Icon name="flight" size={64} color={colors.text.tertiary} />
        </View>
        <Text style={styles.emptyStateTitle}>No Trips Yet</Text>
        <Text style={styles.emptyStateMessage}>{emptyStateMessage}</Text>
        {onEmptyStateButtonPress && (
          <CustomButton
            title={emptyStateButtonText}
            onPress={onEmptyStateButtonPress}
            variant="primary"
            style={styles.emptyStateButton}
          />
        )}
      </View>
    );
  }, [
    showEmptyState,
    loading,
    emptyStateMessage,
    emptyStateButtonText,
    onEmptyStateButtonPress,
  ]);

  // Render error state
  const renderErrorState = useCallback(() => {
    if (!error) return null;

    return (
      <View style={styles.errorStateContainer}>
        <View style={styles.errorStateIcon}>
          <Icon name="error-outline" size={48} color={colors.status.error.main} />
        </View>
        <Text style={styles.errorStateTitle}>Something went wrong</Text>
        <Text style={styles.errorStateMessage}>
          {error.message || 'Failed to load trips. Please try again.'}
        </Text>
        {onRetry && (
          <CustomButton
            title="Try Again"
            onPress={onRetry}
            variant="primary"
            style={styles.errorStateButton}
          />
        )}
      </View>
    );
  }, [error, onRetry]);

  // Render footer for infinite scroll
  const renderFooter = useCallback(() => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerContainer}>
        <LoadingIndicator
          message="Loading more trips..."
          size="small"
          showBackground={false}
        />
      </View>
    );
  }, [hasMore]);

  // Memoize the data to prevent unnecessary re-renders
  const listData = useMemo(() => {
    if (loading && trips.length === 0) {
      return renderLoadingSkeleton();
    }
    return trips;
  }, [trips, loading, renderLoadingSkeleton]);

  // Show loading state when initially loading
  if (loading && trips.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderLoadingSkeleton()}
      </View>
    );
  }

  // Show error state
  if (error && trips.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <FlatList
      data={listData}
      renderItem={renderTripItem}
      keyExtractor={(item) => item.id || item.tripId}
      style={[styles.list, style]}
      contentContainerStyle={[
        styles.contentContainer,
        trips.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary.main]}
          tintColor={colors.primary.main}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={(data, index) => ({
        length: 140, // Approximate height of TripCard
        offset: 140 * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  firstCard: {
    marginTop: 16,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  // Error state styles
  errorStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  errorStateIcon: {
    marginBottom: 16,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStateMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorStateButton: {
    minWidth: 150,
  },
  // Footer styles for infinite scroll
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default TripList;
