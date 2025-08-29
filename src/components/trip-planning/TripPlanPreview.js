import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const TripPlanPreview = ({
  tripData,
  itineraryData,
  onCreateTrip,
  onGenerateAnother,
  onEditManually,
  style
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

  const calculateTripMetrics = () => {
    const days = itineraryData ? Object.keys(itineraryData).length : 0;
    const totalActivities = itineraryData 
      ? Object.values(itineraryData).reduce((total, dayActivities) => total + (dayActivities?.length || 0), 0)
      : 0;
    
    return { days, totalActivities };
  };

  const { days, totalActivities } = calculateTripMetrics();

  return (
    <View style={[styles.container, style]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={24} color={colors.primary.main} />
          </View>
          <Text style={styles.headerTitle}>AI Generated Trip Plan</Text>
          <Text style={styles.headerSubtitle}>Review your personalized itinerary</Text>
        </View>

        {/* Trip Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.tripName}>{tripData?.name || 'Your Trip'}</Text>
            <View style={styles.aiTag}>
              <Ionicons name="sparkles" size={12} color={colors.primary.main} />
              <Text style={styles.aiTagText}>AI Generated</Text>
            </View>
          </View>
          
          <View style={styles.tripDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>{tripData?.location || 'Location TBD'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>
                {formatDateRange(tripData?.startDate, tripData?.endDate)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>
                {days} {days === 1 ? 'day' : 'days'} • {totalActivities} activities
              </Text>
            </View>
          </View>

          {tripData?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{tripData.description}</Text>
            </View>
          )}
        </View>

        {/* Daily Itinerary */}
        {itineraryData && (
          <View style={styles.itinerarySection}>
            <Text style={styles.sectionTitle}>Daily Itinerary</Text>
            
            {Object.keys(itineraryData).map((day, index) => {
              const activities = itineraryData[day] || [];
              const dayNumber = index + 1;
              
              return (
                <View key={day} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayIndicator}>
                      <Text style={styles.dayNumber}>{dayNumber}</Text>
                    </View>
                    <View style={styles.dayInfo}>
                      <Text style={styles.dayTitle}>Day {dayNumber}</Text>
                      <Text style={styles.daySubtitle}>
                        {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.activitiesList}>
                    {activities.map((activity, actIndex) => (
                      <View key={actIndex} style={styles.activityItem}>
                        <View style={styles.timeContainer}>
                          <Text style={styles.activityTime}>
                            {activity.startTime || `${8 + actIndex * 2}:00`}
                          </Text>
                        </View>
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>
                            {activity.title || activity.name || 'Activity'}
                          </Text>
                          {activity.description && (
                            <Text style={styles.activityDescription} numberOfLines={2}>
                              {activity.description}
                            </Text>
                          )}
                          {activity.location && (
                            <View style={styles.activityLocation}>
                              <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
                              <Text style={styles.locationText}>{activity.location}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={onCreateTrip}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.button.primary.text} />
            <Text style={styles.primaryButtonText}>Create This Trip</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={onGenerateAnother}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color={colors.primary.main} />
              <Text style={styles.secondaryButtonText}>Generate Another</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={onEditManually}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary.main} />
              <Text style={styles.secondaryButtonText}>Edit Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  overviewCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary.main,
    marginLeft: 4,
  },
  tripDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: 16,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  itinerarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary.light + '10',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.button.primary.text,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  daySubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activitiesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeContainer: {
    width: 60,
    marginRight: 12,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.main,
    textAlign: 'center',
    backgroundColor: colors.primary.light + '20',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.button.primary.background,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.button.primary.text,
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    flex: 1,
    marginHorizontal: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    marginLeft: 6,
  },
});

export default TripPlanPreview;
