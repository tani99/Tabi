import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { TripDetailsProvider, useTripDetails } from '../TripDetailsContext';
import { getTrip, updateTrip, deleteTrip } from '../../services/trips';
import { TRIP_STATUS } from '../../utils/tripConstants';

// Mock the trip services
jest.mock('../../services/trips');

// Test component to access context
const TestComponent = ({ onContextValue }) => {
  const contextValue = useTripDetails();
  React.useEffect(() => {
    onContextValue(contextValue);
  }, [contextValue, onContextValue]);
  return null;
};

describe('TripDetailsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTrip = {
    id: 'trip-123',
    userId: 'user-456',
    name: 'Test Trip',
    location: 'Test Location',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-20'),
    description: 'Test description',
    status: TRIP_STATUS.UPCOMING,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  };

  describe('Initial State', () => {
    it('should provide initial state values', () => {
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      expect(contextValue.currentTrip).toBeNull();
      expect(contextValue.tripId).toBeNull();
      expect(contextValue.loading).toBe(false);
      expect(contextValue.error).toBeNull();
      expect(contextValue.isEditMode).toBe(false);
      expect(contextValue.editFormData).toBeNull();
      expect(contextValue.formErrors).toEqual({});
      expect(contextValue.isSaving).toBe(false);
      expect(contextValue.tripStatistics).toBeNull();
      expect(contextValue.hasChanges).toBe(false);
    });
  });

  describe('loadTrip', () => {
    it('should load trip successfully', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
      });

      await waitFor(() => {
        expect(contextValue.currentTrip).toEqual(mockTrip);
        expect(contextValue.tripId).toBe('trip-123');
        expect(contextValue.loading).toBe(false);
        expect(contextValue.error).toBeNull();
        expect(contextValue.editFormData).toEqual(mockTrip);
      });

      expect(getTrip).toHaveBeenCalledWith('trip-123', 'user-456');
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Trip not found';
      getTrip.mockRejectedValue(new Error(errorMessage));
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      await act(async () => {
        await contextValue.loadTrip('invalid-id', 'user-456');
      });

      await waitFor(() => {
        expect(contextValue.currentTrip).toBeNull();
        expect(contextValue.loading).toBe(false);
        expect(contextValue.error).toBe(errorMessage);
      });
    });

    it('should validate required parameters', async () => {
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      await act(async () => {
        await contextValue.loadTrip(null, 'user-456');
      });

      await waitFor(() => {
        expect(contextValue.error).toBe('Trip ID and User ID are required');
        expect(getTrip).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode successfully', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip first
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
      });

      // Enter edit mode
      await act(async () => {
        contextValue.enterEditMode();
      });

      await waitFor(() => {
        expect(contextValue.isEditMode).toBe(true);
        expect(contextValue.editFormData).toEqual(mockTrip);
        expect(contextValue.formErrors).toEqual({});
      });
    });

    it('should exit edit mode successfully', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip and enter edit mode
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
        contextValue.enterEditMode();
      });

      // Exit edit mode
      await act(async () => {
        contextValue.exitEditMode();
      });

      await waitFor(() => {
        expect(contextValue.isEditMode).toBe(false);
        expect(contextValue.editFormData).toBeNull();
        expect(contextValue.formErrors).toEqual({});
        expect(contextValue.isSaving).toBe(false);
      });
    });

    it('should update edit form data', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip and enter edit mode
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
        contextValue.enterEditMode();
      });

      // Update form data
      await act(async () => {
        contextValue.updateEditForm('name', 'Updated Trip Name');
      });

      await waitFor(() => {
        expect(contextValue.editFormData.name).toBe('Updated Trip Name');
        expect(contextValue.hasChanges).toBe(true);
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip and enter edit mode
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
        contextValue.enterEditMode();
      });

      // Clear required fields
      await act(async () => {
        contextValue.updateEditForm('name', '');
        contextValue.updateEditForm('location', '');
      });

      // Validate form
      await act(async () => {
        const errors = contextValue.validateEditForm();
        expect(errors.name).toBe('Trip name is required');
        expect(errors.location).toBe('Location is required');
      });
    });

    it('should validate date range', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip and enter edit mode
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
        contextValue.enterEditMode();
      });

      // Set invalid date range
      await act(async () => {
        contextValue.updateEditForm('endDate', new Date('2024-12-10')); // Before start date
      });

      // Validate form
      await act(async () => {
        const errors = contextValue.validateEditForm();
        expect(errors.endDate).toBe('End date must be after start date');
      });
    });

    it('should validate field length limits', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip and enter edit mode
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
        contextValue.enterEditMode();
      });

      // Set long values
      const longName = 'a'.repeat(101);
      const longDescription = 'a'.repeat(501);

      await act(async () => {
        contextValue.updateEditForm('name', longName);
        contextValue.updateEditForm('description', longDescription);
      });

      // Validate form
      await act(async () => {
        const errors = contextValue.validateEditForm();
        expect(errors.name).toBe('Trip name must be 100 characters or less');
        expect(errors.description).toBe('Description must be 500 characters or less');
      });
    });
  });

  describe('saveTripChanges', () => {
    it('should save trip changes successfully', async () => {
      getTrip.mockResolvedValue(mockTrip);
      updateTrip.mockResolvedValue(true);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip and enter edit mode
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
        contextValue.enterEditMode();
        contextValue.updateEditForm('name', 'Updated Trip Name');
      });

      // Save changes
      await act(async () => {
        const result = await contextValue.saveTripChanges('user-456');
        expect(result).toBe(true);
      });

      await waitFor(() => {
        expect(contextValue.isEditMode).toBe(false);
        expect(contextValue.currentTrip.name).toBe('Updated Trip Name');
        expect(contextValue.isSaving).toBe(false);
        expect(contextValue.error).toBeNull();
      });

      expect(updateTrip).toHaveBeenCalledWith('trip-123', expect.objectContaining({
        name: 'Updated Trip Name'
      }), 'user-456');
    });

    it('should handle save errors', async () => {
      getTrip.mockResolvedValue(mockTrip);
      updateTrip.mockRejectedValue(new Error('Save failed'));
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip first
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
      });

      // Enter edit mode
      await act(async () => {
        contextValue.enterEditMode();
      });

      await waitFor(() => {
        expect(contextValue.isEditMode).toBe(true);
      }, { timeout: 3000 });

      // Save changes
      let result;
      await act(async () => {
        result = await contextValue.saveTripChanges('user-456');
      });
      
      expect(result).toBe(false);

      // Wait for error state to be set
      await waitFor(() => {
        expect(contextValue.error).toBe('Save failed');
      }, { timeout: 3000 });
      
      // Wait for saving to be false
      await waitFor(() => {
        expect(contextValue.isSaving).toBe(false);
      }, { timeout: 3000 });
      
      // Check that edit mode is still true
      expect(contextValue.isEditMode).toBe(true); // Should stay in edit mode on error
    });
  });

  describe('deleteCurrentTrip', () => {
    it('should delete trip successfully', async () => {
      getTrip.mockResolvedValue(mockTrip);
      deleteTrip.mockResolvedValue(true);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
      });

      // Delete trip
      await act(async () => {
        const result = await contextValue.deleteCurrentTrip('user-456');
        expect(result).toBe(true);
      });

      await waitFor(() => {
        expect(contextValue.currentTrip).toBeNull();
        expect(contextValue.tripId).toBeNull();
        expect(contextValue.loading).toBe(false);
        expect(contextValue.error).toBeNull();
      });

      expect(deleteTrip).toHaveBeenCalledWith('trip-123', 'user-456');
    });
  });

  describe('tripStatistics', () => {
    it('should calculate trip statistics correctly', async () => {
      const activeTrip = {
        ...mockTrip,
        status: TRIP_STATUS.ONGOING,
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-20')
      };

      getTrip.mockResolvedValue(activeTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
      });

      await waitFor(() => {
        expect(contextValue.tripStatistics).toBeTruthy();
        expect(contextValue.tripStatistics.totalDays).toBe(6);
        expect(contextValue.tripStatistics.isActive).toBe(true);
        expect(contextValue.tripStatistics.isCompleted).toBe(false);
      });
    });

    it('should return null statistics for invalid dates', async () => {
      const invalidTrip = {
        ...mockTrip,
        startDate: null,
        endDate: null
      };

      getTrip.mockResolvedValue(invalidTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
      });

      await waitFor(() => {
        expect(contextValue.tripStatistics).toBeNull();
      });
    });
  });

  describe('clearTripDetails', () => {
    it('should clear all trip details', async () => {
      getTrip.mockResolvedValue(mockTrip);
      
      let contextValue;
      render(
        <TripDetailsProvider>
          <TestComponent onContextValue={(value) => { contextValue = value; }} />
        </TripDetailsProvider>
      );

      // Load trip and enter edit mode
      await act(async () => {
        await contextValue.loadTrip('trip-123', 'user-456');
        contextValue.enterEditMode();
      });

      // Clear trip details
      await act(async () => {
        contextValue.clearTripDetails();
      });

      await waitFor(() => {
        expect(contextValue.currentTrip).toBeNull();
        expect(contextValue.tripId).toBeNull();
        expect(contextValue.editFormData).toBeNull();
        expect(contextValue.isEditMode).toBe(false);
        expect(contextValue.loading).toBe(false);
        expect(contextValue.error).toBeNull();
        expect(contextValue.isSaving).toBe(false);
        expect(contextValue.formErrors).toEqual({});
      });
    });
  });
});
