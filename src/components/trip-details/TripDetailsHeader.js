import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, inferTripStatus } from '../../utils/tripConstants';
import { useEditMode } from '../../context/EditModeContext';
import InlineEditableText from '../ui/InlineEditableText';

const TripDetailsHeader = ({ 
  trip, 
  onUpdate
}) => {
  const { isEditMode, markUnsavedChanges } = useEditMode();

  // Infer status from trip dates instead of using stored status
  const inferredStatus = trip ? inferTripStatus(trip.startDate, trip.endDate) : null;

  const getStatusColor = (status) => {
    return TRIP_STATUS_COLORS[status] || colors.text.secondary;
  };

  const getStatusLabel = (status) => {
    return TRIP_STATUS_LABELS[status] || 'Unknown';
  };

  // Individual editing states for each field
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isEditingLocation, setIsEditingLocation] = React.useState(false);

  const handleNameSave = async (newName) => {
    try {
      await onUpdate({ name: newName });
      markUnsavedChanges();
      setIsEditingName(false);
    } catch (error) {
      throw error;
    }
  };

  const handleLocationSave = async (newLocation) => {
    try {
      await onUpdate({ location: newLocation });
      markUnsavedChanges();
      setIsEditingLocation(false);
    } catch (error) {
      throw error;
    }
  };

  const handleNameEditStart = () => {
    setIsEditingName(true);
  };

  const handleNameEditCancel = () => {
    setIsEditingName(false);
  };

  const handleLocationEditStart = () => {
    setIsEditingLocation(true);
  };

  const handleLocationEditCancel = () => {
    setIsEditingLocation(false);
  };

  return (
    <View style={styles.container}>
      {/* View Mode - Nice Header Format */}
      {!isEditMode && (
        <>
          {/* Trip Name Section */}
          <View style={styles.nameSection}>
            <Text style={styles.tripName} numberOfLines={2}>
              {trip?.name || 'Untitled Trip'}
            </Text>
          </View>

          {/* Location Section */}
          <View style={styles.locationSection}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {trip?.location || 'No location specified'}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Edit Mode - Card Style Edit Boxes */}
      {isEditMode && (
        <View style={styles.editModeContainer}>
          {/* Trip Name Field */}
          <View style={styles.editField}>
            <Text style={styles.editFieldLabel}>Trip Name</Text>
            <InlineEditableText
              value={trip?.name || ''}
              onSave={handleNameSave}
              isEditMode={isEditMode}
              isEditing={isEditingName}
              onEditStart={handleNameEditStart}
              onEditCancel={handleNameEditCancel}
              placeholder="Enter trip name..."
              maxLength={50}
              style={styles.editableField}
            />
          </View>

          {/* Location Field */}
          <View style={styles.editField}>
            <Text style={styles.editFieldLabel}>Location</Text>
            <InlineEditableText
              value={trip?.location || ''}
              onSave={handleLocationSave}
              isEditMode={isEditMode}
              isEditing={isEditingLocation}
              onEditStart={handleLocationEditStart}
              onEditCancel={handleLocationEditCancel}
              placeholder="Enter location..."
              maxLength={100}
              style={styles.editableField}
            />
          </View>
        </View>
      )}

      {/* Status Badge - Always visible */}
      <View style={styles.statusSection}>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(inferredStatus) }
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusLabel(inferredStatus)}
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
  nameSection: {
    marginBottom: 16,
  },
  tripName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  editModeContainer: {
    marginBottom: 16,
    gap: 16,
  },
  editField: {
    marginBottom: 0,
  },
  editFieldLabel: {
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
  statusSection: {
    marginBottom: 0,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default TripDetailsHeader;
