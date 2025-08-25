import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useEditMode } from '../../context/EditModeContext';
import InlineEditableDate from '../ui/InlineEditableDate';

const TripDateDisplay = ({ trip, onUpdate }) => {
  const { isEditMode, markUnsavedChanges, clearUnsavedChanges } = useEditMode();
  
  // Individual editing states for each date field
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'Not set';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = () => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    
    const start = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
    const end = trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays); // Minimum 1 day
  };

  const calculateDaysRemaining = () => {
    if (!trip?.startDate) return null;
    
    const start = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
    const now = new Date();
    
    // Reset time to compare dates only
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDaysRemainingText = () => {
    const daysRemaining = calculateDaysRemaining();
    
    if (daysRemaining === null) return null;
    
    if (daysRemaining > 0) {
      return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} until trip`;
    } else if (daysRemaining === 0) {
      return 'Trip starts today!';
    } else {
      const daysElapsed = Math.abs(daysRemaining);
      return `${daysElapsed} day${daysElapsed === 1 ? '' : 's'} ago`;
    }
  };

  const getStatusColor = () => {
    const daysRemaining = calculateDaysRemaining();
    
    if (daysRemaining === null) return colors.text.secondary;
    if (daysRemaining > 7) return colors.status.success.main;
    if (daysRemaining > 0) return colors.status.warning.main;
    if (daysRemaining === 0) return colors.primary.main;
    return colors.text.secondary; // Past trips
  };

  const handleStartDateSave = async (newStartDate) => {
    try {
      await onUpdate({ startDate: newStartDate });
      markUnsavedChanges();
      setIsEditingStartDate(false);
    } catch (error) {
      throw error;
    }
  };

  const handleEndDateSave = async (newEndDate) => {
    try {
      await onUpdate({ endDate: newEndDate });
      markUnsavedChanges();
      setIsEditingEndDate(false);
    } catch (error) {
      throw error;
    }
  };

  const handleStartDateEditStart = () => {
    setIsEditingStartDate(true);
  };

  const handleStartDateEditCancel = () => {
    setIsEditingStartDate(false);
  };

  const handleEndDateEditStart = () => {
    setIsEditingEndDate(true);
  };

  const handleEndDateEditCancel = () => {
    setIsEditingEndDate(false);
  };

  return (
    <View style={styles.container}>
      {/* Date Range Summary - Only visible when NOT in edit mode */}
      {!isEditMode && (
        <View style={styles.summaryContainer}>
          <Text style={styles.calendarIcon}>📅</Text>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryText}>
              {trip?.startDate && trip?.endDate 
                ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
                : 'Dates not set'
              }
            </Text>
            {trip?.startDate && trip?.endDate && (
              <Text style={styles.durationText}>
                {calculateDuration()} day{calculateDuration() === 1 ? '' : 's'}
              </Text>
            )}
          </View>
        </View>
      )}
      
      {/* Days Remaining - Only visible when NOT in edit mode */}
      {!isEditMode && getDaysRemainingText() && (
        <View style={styles.daysRemainingContainer}>
          <Text style={[styles.daysRemainingText, { color: getStatusColor() }]}>
            {getDaysRemainingText()}
          </Text>
        </View>
      )}
      
      {/* Date Fields - Only visible in edit mode */}
      {isEditMode && (
        <View style={styles.dateFieldsContainer}>
          {/* Start Date */}
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <InlineEditableDate
              value={trip?.startDate}
              onSave={handleStartDateSave}
              isEditMode={isEditMode}
              isEditing={isEditingStartDate}
              onEditStart={handleStartDateEditStart}
              onEditCancel={handleStartDateEditCancel}
              placeholder="Select start date..."
              formatDate={formatDate}
              maxDate={trip?.endDate ? new Date(trip.endDate) : undefined}
              style={styles.editableField}
            />
          </View>
          
          {/* End Date */}
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>End Date</Text>
            <InlineEditableDate
              value={trip?.endDate}
              onSave={handleEndDateSave}
              isEditMode={isEditMode}
              isEditing={isEditingEndDate}
              onEditStart={handleEndDateEditStart}
              onEditCancel={handleEndDateEditCancel}
              placeholder="Select end date..."
              formatDate={formatDate}
              minDate={trip?.startDate ? new Date(trip.startDate) : undefined}
              style={styles.editableField}
            />
          </View>
        </View>
      )}
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
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  durationText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  daysRemainingContainer: {
    marginBottom: 12,
  },
  daysRemainingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateFieldsContainer: {
    gap: 12,
  },
  dateField: {
    marginBottom: 0,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  editableField: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
});

export default TripDateDisplay;
