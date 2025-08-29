import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const AIGeneratedTripCard = ({
  tripData,
  itineraryData,
  onPress,
  style,
  showActions = false,
  onCreateTrip,
  onEditTrip,
}) => {
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return date.toString();
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates TBD';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();
    
    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`;
      } else {
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    } else {
      const endYear = end.getFullYear();
      return `${startMonth} ${startDay}, ${year} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${endDay}, ${endYear}`;
    }
  };

  const calculateMetrics = () => {
    const days = itineraryData ? Object.keys(itineraryData).length : 0;
    const totalActivities = itineraryData 
      ? Object.values(itineraryData).reduce((total, dayActivities) => total + (dayActivities?.length || 0), 0)
      : 0;
    
    // Calculate estimated cost based on activities (simplified)
    const estimatedCostPerActivity = 50; // Base estimate
    const estimatedCost = totalActivities * estimatedCostPerActivity;
    
    return { days, totalActivities, estimatedCost };
  };

  const { days, totalActivities, estimatedCost } = calculateMetrics();

  const CardContent = () => (
    <View style={[styles.card, style]}>
      {/* Header with AI indicator */}
      <View style={styles.header}>
        <View style={styles.aiIndicator}>
          <Ionicons name="sparkles" size={16} color={colors.primary.main} />
          <Text style={styles.aiText}>AI Generated</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Draft</Text>
        </View>
      </View>

      {/* Trip Title and Location */}
      <View style={styles.titleSection}>
        <Text style={styles.tripTitle} numberOfLines={2}>
          {tripData?.name || 'AI Generated Trip'}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.text.secondary} />
          <Text style={styles.locationText}>
            {tripData?.location || 'Location TBD'}
          </Text>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.detailsSection}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.dateText}>
            {formatDateRange(tripData?.startDate, tripData?.endDate)}
          </Text>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsSection}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{days}</Text>
          <Text style={styles.metricLabel}>{days === 1 ? 'Day' : 'Days'}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{totalActivities}</Text>
          <Text style={styles.metricLabel}>Activities</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>${estimatedCost}</Text>
          <Text style={styles.metricLabel}>Est. Cost</Text>
        </View>
      </View>

      {/* Description Preview */}
      {tripData?.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText} numberOfLines={3}>
            {tripData.description}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onEditTrip}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary.main} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]}
            onPress={onCreateTrip}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.button.primary.text} />
            <Text style={[styles.actionButtonText, styles.primaryActionText]}>Create</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Visual Elements */}
      <View style={styles.cardDecoration}>
        <View style={styles.decorationDot} />
        <View style={styles.decorationDot} />
        <View style={styles.decorationDot} />
      </View>
    </View>
  );

  if (onPress && !showActions) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary.main,
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: colors.primary.light + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleSection: {
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  detailsSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  metricsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.primary.light + '10',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.primary,
    marginHorizontal: 8,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: colors.button.primary.background,
    borderColor: colors.button.primary.background,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    marginLeft: 4,
  },
  primaryActionText: {
    color: colors.button.primary.text,
  },
  cardDecoration: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    opacity: 0.3,
  },
  decorationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary.light,
    marginLeft: 3,
  },
});

export default AIGeneratedTripCard;
