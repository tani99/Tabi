import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getTrip, updateTrip, deleteTrip } from '../services/trips';
import { TRIP_STATUS } from '../utils/tripConstants';

const TripDetailsContext = createContext();

export const useTripDetails = () => {
  const context = useContext(TripDetailsContext);
  if (!context) {
    throw new Error('useTripDetails must be used within a TripDetailsProvider');
  }
  return context;
};

export const TripDetailsProvider = ({ children }) => {
  // Current trip state
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripId, setTripId] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Inline editing state
  const [inlineEditStates, setInlineEditStates] = useState({});
  const [inlineEditErrors, setInlineEditErrors] = useState({});
  const [inlineEditLoading, setInlineEditLoading] = useState({});
  
  // Navigation state
  const [navigationState, setNavigationState] = useState({
    canGoBack: false,
    previousScreen: null
  });

  /**
   * Load trip details by ID
   */
  const loadTrip = useCallback(async (id, userId) => {
    if (!id || !userId) {
      setError('Trip ID and User ID are required');
      return;
    }

    setLoading(true);
    setError(null);
    setTripId(id);

    try {
      const trip = await getTrip(id, userId);
      setCurrentTrip(trip);
      // Only set edit form data if not already in edit mode
      if (!isEditMode) {
        setEditFormData(trip); // Initialize edit form with current trip data
      }
      setFormErrors({});
    } catch (err) {
      setError(err.message || 'Failed to load trip details');
      setCurrentTrip(null);
    } finally {
      setLoading(false);
    }
  }, [isEditMode]);

  /**
   * Enter edit mode
   */
  const enterEditMode = useCallback(() => {
    if (!currentTrip) {
      setError('No trip data available for editing');
      return;
    }
    
    setIsEditMode(true);
    setEditFormData({ ...currentTrip });
    setFormErrors({});
  }, [currentTrip]);

  /**
   * Exit edit mode
   */
  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditFormData(null);
    setFormErrors({});
    setIsSaving(false);
  }, []);

  /**
   * Update edit form data
   */
  const updateEditForm = useCallback((field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [formErrors]);

  /**
   * Validate edit form data
   */
  const validateEditForm = useCallback(() => {
    const errors = {};
    
    if (!editFormData) {
      errors.general = 'No form data available';
      return errors;
    }

    // Required field validation
    if (!editFormData.name || editFormData.name.trim() === '') {
      errors.name = 'Trip name is required';
    } else if (editFormData.name.length > 100) {
      errors.name = 'Trip name must be 100 characters or less';
    }

    if (!editFormData.location || editFormData.location.trim() === '') {
      errors.location = 'Location is required';
    } else if (editFormData.location.length > 100) {
      errors.location = 'Location must be 100 characters or less';
    }

    if (!editFormData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!editFormData.endDate) {
      errors.endDate = 'End date is required';
    }

    // Date range validation
    if (editFormData.startDate && editFormData.endDate) {
      if (editFormData.endDate <= editFormData.startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    // Description validation (optional field)
    if (editFormData.description && editFormData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    setFormErrors(errors);
    return errors;
  }, [editFormData]);

  /**
   * Save trip changes
   */
  const saveTripChanges = useCallback(async (userId) => {
    if (!editFormData || !tripId || !userId) {
      setError('Missing required data for saving');
      return false;
    }

    // Validate form data
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Prepare update data (exclude id and timestamps)
      const updateData = {
        name: editFormData.name.trim(),
        location: editFormData.location.trim(),
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        description: editFormData.description?.trim() || ''
      };

      await updateTrip(tripId, updateData, userId);
      
      // Update current trip with new data
      setCurrentTrip(prev => ({
        ...prev,
        ...updateData
      }));
      
      // Exit edit mode on successful save
      setIsEditMode(false);
      setEditFormData(null);
      setFormErrors({});
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to save trip changes');
      // Don't exit edit mode on error - let user fix the issue
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [editFormData, tripId]);

  /**
   * Delete trip
   */
  const deleteCurrentTrip = useCallback(async (userId) => {
    if (!tripId || !userId) {
      setError('Missing required data for deletion');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteTrip(tripId, userId);
      
      // Clear trip data
      setCurrentTrip(null);
      setTripId(null);
      setEditFormData(null);
      setFormErrors({});
      setIsEditMode(false);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete trip');
      return false;
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  /**
   * Update navigation state
   */
  const updateNavigationState = useCallback((state) => {
    setNavigationState(prev => ({
      ...prev,
      ...state
    }));
  }, []);

  /**
   * Clear trip details (for cleanup)
   */
  const clearTripDetails = useCallback(() => {
    setCurrentTrip(null);
    setTripId(null);
    setEditFormData(null);
    setFormErrors({});
    setIsEditMode(false);
    setLoading(false);
    setError(null);
    setIsSaving(false);
    setInlineEditStates({});
    setInlineEditErrors({});
    setInlineEditLoading({});
    setNavigationState({
      canGoBack: false,
      previousScreen: null
    });
  }, []);

  /**
   * Inline editing methods
   */
  const startInlineEdit = useCallback((field) => {
    setInlineEditStates(prev => ({
      ...prev,
      [field]: true
    }));
    setInlineEditErrors(prev => ({
      ...prev,
      [field]: null
    }));
  }, []);

  const cancelInlineEdit = useCallback((field) => {
    setInlineEditStates(prev => ({
      ...prev,
      [field]: false
    }));
    setInlineEditErrors(prev => ({
      ...prev,
      [field]: null
    }));
    setInlineEditLoading(prev => ({
      ...prev,
      [field]: false
    }));
  }, []);

  const saveInlineEdit = useCallback(async (field, value, userId) => {
    if (!tripId || !userId) {
      setInlineEditErrors(prev => ({
        ...prev,
        [field]: 'Missing required data for saving'
      }));
      return false;
    }

    // Validate the field
    const errors = {};
    if (field === 'name') {
      if (!value || value.trim() === '') {
        errors[field] = 'Trip name is required';
      } else if (value.length > 100) {
        errors[field] = 'Trip name must be 100 characters or less';
      }
    } else if (field === 'location') {
      if (!value || value.trim() === '') {
        errors[field] = 'Location is required';
      } else if (value.length > 100) {
        errors[field] = 'Location must be 100 characters or less';
      }
    } else if (field === 'description') {
      if (value && value.length > 500) {
        errors[field] = 'Description must be 500 characters or less';
      }
    } else if (field === 'startDate' || field === 'endDate') {
      if (!value) {
        errors[field] = `${field === 'startDate' ? 'Start' : 'End'} date is required`;
      }
    }

    if (errors[field]) {
      setInlineEditErrors(prev => ({
        ...prev,
        [field]: errors[field]
      }));
      return false;
    }

    // Date range validation
    if ((field === 'startDate' || field === 'endDate') && currentTrip) {
      const startDate = field === 'startDate' ? value : currentTrip.startDate;
      const endDate = field === 'endDate' ? value : currentTrip.endDate;
      
      if (startDate && endDate && endDate <= startDate) {
        setInlineEditErrors(prev => ({
          ...prev,
          [field]: 'End date must be after start date'
        }));
        return false;
      }
    }

    setInlineEditLoading(prev => ({
      ...prev,
      [field]: true
    }));
    setInlineEditErrors(prev => ({
      ...prev,
      [field]: null
    }));

    try {
      const updateData = { [field]: value };
      await updateTrip(tripId, updateData, userId);
      
      // Update current trip with new data
      setCurrentTrip(prev => ({
        ...prev,
        ...updateData
      }));
      
      // Exit inline edit mode
      setInlineEditStates(prev => ({
        ...prev,
        [field]: false
      }));
      
      return true;
    } catch (err) {
      setInlineEditErrors(prev => ({
        ...prev,
        [field]: err.message || 'Failed to save changes'
      }));
      return false;
    } finally {
      setInlineEditLoading(prev => ({
        ...prev,
        [field]: false
      }));
    }
  }, [tripId, currentTrip]);

  /**
   * Calculate trip statistics
   */
  const getTripStatistics = useCallback(() => {
    if (!currentTrip) return null;

    const now = new Date();
    const startDate = currentTrip.startDate;
    const endDate = currentTrip.endDate;
    
    if (!startDate || !endDate) return null;

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    let progress = 0;
    if (currentTrip.status === TRIP_STATUS.ONGOING) {
      progress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));
    } else if (currentTrip.status === TRIP_STATUS.COMPLETED) {
      progress = 100;
    }

    return {
      totalDays,
      daysUntilStart,
      daysElapsed,
      daysRemaining,
      progress,
      isActive: currentTrip.status === TRIP_STATUS.ONGOING,
      isCompleted: currentTrip.status === TRIP_STATUS.COMPLETED,
      isUpcoming: daysUntilStart > 0,
      isPast: daysRemaining < 0
    };
  }, [currentTrip]);

  // Context value
  const value = {
    // Trip data
    currentTrip,
    tripId,
    
    // Loading and error states
    loading,
    error,
    
    // Edit mode state
    isEditMode,
    editFormData,
    formErrors,
    isSaving,
    
    // Inline editing state
    inlineEditStates,
    inlineEditErrors,
    inlineEditLoading,
    
    // Navigation state
    navigationState,
    
    // Actions
    loadTrip,
    enterEditMode,
    exitEditMode,
    updateEditForm,
    validateEditForm,
    saveTripChanges,
    deleteCurrentTrip,
    updateNavigationState,
    clearTripDetails,
    
    // Inline editing actions
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit,
    
    // Computed values
    tripStatistics: getTripStatistics(),
    
    // Utility functions
    hasChanges: editFormData && currentTrip ? 
      JSON.stringify(editFormData) !== JSON.stringify(currentTrip) : false
  };

  return (
    <TripDetailsContext.Provider value={value}>
      {children}
    </TripDetailsContext.Provider>
  );
};
