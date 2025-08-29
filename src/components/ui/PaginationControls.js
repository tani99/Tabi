import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const PaginationControls = ({
  loading = false,
  hasMore = false,
  totalLoaded = 0,
  totalAvailable = null,
  currentPage = 1,
  pageSize = 10,
  onLoadMore = null,
  onRefresh = null,
  style,
  showRefresh = true,
  showStats = true,
  loadMoreText = 'Load More',
  refreshText = 'Refresh',
  emptyText = 'No items found',
  errorText = null
}) => {
  const canLoadMore = hasMore && !loading && onLoadMore;
  const canRefresh = !loading && onRefresh;

  const renderStats = () => {
    if (!showStats) return null;

    let statsText = `${totalLoaded} item${totalLoaded !== 1 ? 's' : ''}`;
    
    if (totalAvailable !== null && totalAvailable !== totalLoaded) {
      statsText += ` of ${totalAvailable}`;
    }
    
    if (totalLoaded > 0) {
      statsText += ` (Page ${currentPage})`;
    }

    return (
      <Text style={styles.statsText}>
        {statsText}
      </Text>
    );
  };

  const renderLoadMoreButton = () => {
    if (!canLoadMore) return null;

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary.main} />
        ) : (
          <>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color={colors.primary.main} 
              style={styles.buttonIcon}
            />
            <Text style={styles.loadMoreText}>{loadMoreText}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderRefreshButton = () => {
    if (!showRefresh || !canRefresh) return null;

    return (
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
        disabled={loading}
      >
        <Ionicons 
          name="refresh" 
          size={16} 
          color={colors.text.secondary} 
          style={styles.buttonIcon}
        />
        <Text style={styles.refreshText}>{refreshText}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (totalLoaded > 0 || loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name="folder-open-outline" 
          size={48} 
          color={colors.text.disabled} 
        />
        <Text style={styles.emptyText}>
          {errorText || emptyText}
        </Text>
      </View>
    );
  };

  const renderLoadingIndicator = () => {
    if (!loading || totalLoaded > 0) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  };

  const renderError = () => {
    if (!errorText || totalLoaded > 0) return null;

    return (
      <View style={styles.errorContainer}>
        <Ionicons 
          name="alert-circle-outline" 
          size={24} 
          color={colors.status.error.main} 
        />
        <Text style={styles.errorText}>{errorText}</Text>
        {canRefresh && (
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (totalLoaded === 0 && !loading && errorText) {
    return (
      <View style={[styles.container, style]}>
        {renderError()}
      </View>
    );
  }

  if (totalLoaded === 0 && loading) {
    return (
      <View style={[styles.container, style]}>
        {renderLoadingIndicator()}
      </View>
    );
  }

  if (totalLoaded === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderEmptyState()}
        {renderRefreshButton()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderStats()}
      
      <View style={styles.buttonRow}>
        {renderLoadMoreButton()}
        {renderRefreshButton()}
      </View>
      
      {loading && totalLoaded > 0 && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color={colors.primary.main} />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.primary.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  refreshText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  loadingMoreText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error.main,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.status.error.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.status.error.main,
  },
  retryText: {
    fontSize: 14,
    color: colors.status.error.main,
    fontWeight: '500',
  },
});

export default PaginationControls;
