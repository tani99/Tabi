import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { TRIP_STATUS, TRIP_STATUS_LABELS, inferTripStatus } from '../utils/tripConstants';

const TripCard = ({ 
  trip, 
  onPress, 
  loading = false,
  style 
}) => {
  // Format date range (e.g., "Dec 15-20, 2024")
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates TBD';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();
    
    // If same year, show "Dec 15-20, 2024"
    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`;
      } else {
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    } else {
      // Different years
      const endYear = end.getFullYear();
      return `${startMonth} ${startDay}, ${year} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${endDay}, ${endYear}`;
    }
  };

  // Get status color based on trip status
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

  // Get status background color
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case TRIP_STATUS.UPCOMING:
        return colors.primary.light + '20'; // 20% opacity
      case TRIP_STATUS.ONGOING:
        return colors.status.success.background;
      case TRIP_STATUS.COMPLETED:
        return colors.background.tertiary;
      default:
        return colors.background.tertiary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingCard, style]} testID="trip-card">
        <View style={styles.loadingContent}>
          <View style={styles.loadingTitle} />
          <View style={styles.loadingLocation} />
          <View style={styles.loadingDates} />
        </View>
      </View>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
      testID="trip-card"
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {trip.name}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusBackgroundColor(inferTripStatus(trip.startDate, trip.endDate)) }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(inferTripStatus(trip.startDate, trip.endDate)) }
            ]}>
              {TRIP_STATUS_LABELS[inferTripStatus(trip.startDate, trip.endDate)]}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.locationContainer}>
          <Icon 
            name="location-on" 
            size={16} 
            color={colors.text.secondary} 
            style={styles.locationIcon}
          />
          <Text style={styles.location} numberOfLines={1}>
            {trip.location}
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <Icon 
            name="event" 
            size={16} 
            color={colors.text.secondary} 
            style={styles.dateIcon}
          />
          <Text style={styles.dates}>
            {formatDateRange(trip.startDate, trip.endDate)}
          </Text>
        </View>

        {trip.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description} numberOfLines={2}>
              {trip.description}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  loadingCard: {
    height: 120,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    gap: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 6,
  },
  location: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 6,
  },
  dates: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  // Loading skeleton styles
  loadingContent: {
    gap: 8,
  },
  loadingTitle: {
    height: 20,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '70%',
  },
  loadingLocation: {
    height: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '50%',
  },
  loadingDates: {
    height: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '60%',
  },
});

export default TripCard;
