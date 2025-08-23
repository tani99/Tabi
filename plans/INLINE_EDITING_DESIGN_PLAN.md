# In-Place Editing Design Plan for Trip Details Screen

## Overview
This document outlines the design and implementation plan for converting the trip details screen from a separate edit screen approach to an in-place editing system. Users will be able to edit trip information directly on the details screen by clicking edit icons on individual sections.

## Design Philosophy

### Core Principles
1. **Seamless Experience**: No navigation between view and edit modes
2. **Visual Feedback**: Clear indication of which section is being edited
3. **Contextual Editing**: Edit only what you need, when you need it
4. **Immediate Feedback**: Real-time validation and save confirmation
5. **Consistent UI**: Maintain existing design patterns while adding edit capabilities

### Visual Design Approach
- **Edit Mode Highlighting**: Subtle background color change and border for active edit sections
- **Edit Icons**: Small, unobtrusive edit icons positioned at the top-right of each editable section
- **Smooth Transitions**: Animated transitions between view and edit modes
- **Loading States**: Clear feedback during save operations
- **Error Handling**: Inline error messages within edit sections

## Component Architecture

### 1. EditableCard Component (New)
**Purpose**: Wrapper component that provides edit functionality for any content
**Features**:
- Edit icon in top-right corner
- Highlighted state when editing
- Save/Cancel buttons when in edit mode
- Loading state during save operations
- Error display for validation issues

### 2. Enhanced Trip Details Components

#### TripDetailsHeader (Enhanced)
**Editable Fields**:
- Trip name (clickable text that becomes input)
- Location (clickable text that becomes input)
- Status (dropdown picker)

**Edit Behavior**:
- Click on trip name → becomes text input with save/cancel
- Click on location → becomes text input with save/cancel
- Click on status → becomes dropdown picker
- Edit icon provides alternative entry point

#### TripDateDisplay (Enhanced)
**Editable Fields**:
- Start date (clickable date that opens date picker)
- End date (clickable date that opens date picker)

**Edit Behavior**:
- Click on date → opens native date picker
- Edit icon provides alternative entry point
- Date range validation in real-time

#### TripDescription (Enhanced)
**Editable Fields**:
- Description text (clickable text that becomes textarea)

**Edit Behavior**:
- Click on description → becomes multi-line text input
- Character count display during editing
- Expandable text area for long descriptions

#### TripStatistics (Read-Only)
**No Editable Fields**:
- All statistics are calculated from trip data
- Display only, no edit functionality
- No edit icon shown

## Implementation Plan

### Phase 1: Core EditableCard Component

#### Step 1: Create EditableCard Component
**File**: `src/components/ui/EditableCard.js`

**Features**:
- Edit mode state management
- Edit icon display
- Highlighted styling when editing
- Save/Cancel button handling
- Loading state management
- Error display
- Smooth animations

**Props**:
```javascript
{
  children: ReactNode,           // Content to display
  isEditing: boolean,           // Current edit state
  onEdit: () => void,          // Enter edit mode
  onSave: () => Promise<void>, // Save changes
  onCancel: () => void,        // Cancel editing
  loading: boolean,            // Loading state
  error: string,               // Error message
  editable: boolean,           // Whether section is editable
  title: string,               // Section title
}
```

#### Step 2: Create Edit Mode Hooks
**File**: `src/hooks/useEditMode.js`

**Features**:
- Edit state management
- Save/cancel logic
- Loading state handling
- Error state management
- Validation integration

### Phase 2: Enhanced Trip Details Components

#### Step 3: Update TripDetailsHeader
**Changes**:
- Wrap trip name in EditableCard
- Wrap location in EditableCard
- Add click handlers for direct editing
- Integrate with trip services for updates
- Add real-time validation

#### Step 4: Update TripDateDisplay
**Changes**:
- Wrap date displays in EditableCard
- Add date picker integration
- Add date range validation
- Handle date format changes
- Update trip statistics on date changes

#### Step 5: Update TripDescription
**Changes**:
- Wrap description in EditableCard
- Add multi-line text input
- Add character count validation
- Handle expandable text in edit mode
- Preserve read more/less functionality

### Phase 3: State Management & Integration

#### Step 6: Update TripDetailsContext
**Changes**:
- Add edit mode state management
- Add individual field edit states
- Add save/cancel handlers
- Add validation state management
- Add optimistic updates

#### Step 7: Update TripDetailsScreen
**Changes**:
- Remove navigation to edit screen
- Add edit mode state management
- Add save/cancel handlers
- Add loading states
- Add error handling

### Phase 4: UI/UX Polish

#### Step 8: Add Animations
**Features**:
- Smooth transitions between view/edit modes
- Loading animations
- Success/error feedback animations
- Edit icon hover effects

#### Step 9: Add Visual Feedback
**Features**:
- Highlight colors for edit mode
- Loading indicators
- Success checkmarks
- Error highlighting
- Disabled states

## Technical Implementation Details

### EditableCard Component Structure
```javascript
const EditableCard = ({
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  loading,
  error,
  editable = true,
  title
}) => {
  return (
    <View style={[styles.container, isEditing && styles.editingContainer]}>
      {/* Header with title and edit icon */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {editable && !isEditing && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Content area */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Edit mode controls */}
      {isEditing && (
        <View style={styles.editControls}>
          <TouchableOpacity 
            onPress={onCancel} 
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onSave} 
            style={[styles.button, styles.saveButton]}
            disabled={loading}
          >
            {loading ? (
              <LoadingIndicator size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Error display */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};
```

### Edit Mode Hook Structure
```javascript
const useEditMode = (initialValue, onSave) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(initialValue);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(value);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditing,
    value,
    setValue,
    loading,
    error,
    handleEdit,
    handleCancel,
    handleSave
  };
};
```

### Enhanced TripDetailsHeader Structure
```javascript
const TripDetailsHeader = ({ trip, onUpdate }) => {
  const nameEdit = useEditMode(trip?.name, async (newName) => {
    await onUpdate({ name: newName });
  });

  const locationEdit = useEditMode(trip?.location, async (newLocation) => {
    await onUpdate({ location: newLocation });
  });

  return (
    <View style={styles.container}>
      {/* Trip Name - Editable */}
      <EditableCard
        isEditing={nameEdit.isEditing}
        onEdit={nameEdit.handleEdit}
        onSave={nameEdit.handleSave}
        onCancel={nameEdit.handleCancel}
        loading={nameEdit.loading}
        error={nameEdit.error}
        title="Trip Name"
      >
        {nameEdit.isEditing ? (
          <TextInput
            value={nameEdit.value}
            onChangeText={nameEdit.setValue}
            style={styles.nameInput}
            placeholder="Enter trip name"
          />
        ) : (
          <Text style={styles.tripName} numberOfLines={2}>
            {trip?.name || 'Untitled Trip'}
          </Text>
        )}
      </EditableCard>

      {/* Location - Editable */}
      <EditableCard
        isEditing={locationEdit.isEditing}
        onEdit={locationEdit.handleEdit}
        onSave={locationEdit.handleSave}
        onCancel={locationEdit.handleCancel}
        loading={locationEdit.loading}
        error={locationEdit.error}
        title="Location"
      >
        {locationEdit.isEditing ? (
          <TextInput
            value={locationEdit.value}
            onChangeText={locationEdit.setValue}
            style={styles.locationInput}
            placeholder="Enter location"
          />
        ) : (
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {trip?.location || 'No location specified'}
            </Text>
          </View>
        )}
      </EditableCard>

      {/* Status - Read-only for now */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip?.status) }]}>
          <Text style={styles.statusText}>
            {getStatusLabel(trip?.status)}
          </Text>
        </View>
      </View>
    </View>
  );
};
```

## UI/UX Design Specifications

### Edit Mode Visual Design
- **Background Color**: Slight tint change (e.g., `rgba(0, 122, 255, 0.05)`)
- **Border**: 2px border with primary color when editing
- **Edit Icon**: 16px pencil icon in top-right corner
- **Save/Cancel Buttons**: Small buttons below content when editing
- **Loading State**: Spinner in save button during operations
- **Error State**: Red text below content for validation errors

### Animation Specifications
- **Transition Duration**: 200ms for smooth but responsive feel
- **Easing**: `ease-in-out` for natural motion
- **Scale Effect**: Slight scale (1.02) when entering edit mode
- **Opacity**: Fade in/out for edit controls
- **Color Transitions**: Smooth color changes for state changes

### Responsive Design
- **Mobile**: Full-width edit sections with touch-friendly buttons
- **Tablet**: Maintained proportions with larger touch targets
- **Accessibility**: Proper focus management and screen reader support

## Success Criteria
- ✅ Users can edit trip name by clicking on it or the edit icon
- ✅ Users can edit location by clicking on it or the edit icon
- ✅ Users can edit dates by clicking on them or the edit icon
- ✅ Users can edit description by clicking on it or the edit icon
- ✅ Trip statistics remain read-only and show no edit icon
- ✅ Visual highlighting clearly indicates which section is being edited
- ✅ Save/Cancel buttons provide clear action options
- ✅ Loading states provide feedback during save operations
- ✅ Error messages appear inline for validation issues
- ✅ Smooth animations enhance the user experience
- ✅ All existing functionality is preserved
- ✅ Performance remains smooth with real-time updates

## Timeline Estimate
- **Phase 1 (EditableCard Component)**: 2-3 days
- **Phase 2 (Enhanced Components)**: 3-4 days
- **Phase 3 (State Management)**: 2-3 days
- **Phase 4 (UI/UX Polish)**: 2-3 days

**Total Estimated Time: 9-13 days**

## Development Priorities
1. **High Priority**: Core EditableCard component and basic edit functionality
2. **Medium Priority**: Enhanced components with full edit capabilities
3. **Low Priority**: Advanced animations and visual polish

## Notes
- Build incrementally, starting with the EditableCard component
- Test with real data from existing trip services
- Maintain consistency with existing app design patterns
- Consider user feedback for additional edit features
- Ensure accessibility compliance for all interactive elements
- Implement proper error boundaries for robust error handling
- Plan for future enhancements like bulk editing or undo functionality
