import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { inferTripStatus, TRIP_STATUS_LABELS } from '../../utils/tripConstants';

const TripStatistics = ({ trip }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Not available';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTripProgress = () => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    
    const start = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
    const end = trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    if (elapsed <= 0) return 0; // Trip hasn't started
    if (elapsed >= totalDuration) return 100; // Trip has ended
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const getProgressStatus = () => {
    const progress = calculateTripProgress();
    
    if (progress === 0) return { text: 'Not started', color: colors.text.secondary };
    if (progress < 25) return { text: 'Just started', color: colors.status.success.main };
    if (progress < 50) return { text: 'In progress', color: colors.primary.main };
    if (progress < 75) return { text: 'Halfway through', color: colors.status.warning.main };
    if (progress < 100) return { text: 'Almost done', color: colors.status.warning.main };
    return { text: 'Completed', color: colors.status.success.main };
  };

  const getDaysUntilTrip = () => {
    if (!trip?.startDate) return null;
    
    const start = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
    const now = new Date();
    
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Use the consistent inferTripStatus function
  const getTripStatus = () => {
    if (!trip?.startDate || !trip?.endDate) return 'Unknown';
    const status = inferTripStatus(trip.startDate, trip.endDate);
    return TRIP_STATUS_LABELS[status] || status;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📊 Trip Statistics</Text>
      
      <View style={styles.statsGrid}>
        {/* Trip Status */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={styles.statValue}>
            {getTripStatus()}
          </Text>
        </View>
        
        {/* Days Until Trip */}
        {getDaysUntilTrip() !== null && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Days Until Trip</Text>
            <Text style={[
              styles.statValue,
              { color: getDaysUntilTrip() <= 7 ? colors.status.warning.main : colors.text.primary }
            ]}>
              {getDaysUntilTrip() > 0 ? getDaysUntilTrip() : 'Started'}
            </Text>
          </View>
        )}
        
        {/* Trip Progress */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Progress</Text>
          <Text style={styles.statValue}>
            {Math.round(calculateTripProgress())}%
          </Text>
        </View>
        
        {/* Progress Status */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: getProgressStatus().color }]}>
            {getProgressStatus().text}
          </Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${calculateTripProgress()}%`,
                backgroundColor: getProgressStatus().color
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(calculateTripProgress())}% complete
        </Text>
      </View>
      
      {/* Timestamps */}
      <View style={styles.timestampsContainer}>
        <View style={styles.timestampItem}>
          <Text style={styles.timestampLabel}>Created</Text>
          <Text style={styles.timestampValue}>
            {formatTimestamp(trip?.createdAt)}
          </Text>
        </View>
        
        <View style={styles.timestampItem}>
          <Text style={styles.timestampLabel}>Last Updated</Text>
          <Text style={styles.timestampValue}>
            {formatTimestamp(trip?.updatedAt)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border.primary,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  timestampsContainer: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
  },
  timestampItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  timestampLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  timestampValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default TripStatistics;
