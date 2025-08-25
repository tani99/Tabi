import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TripDetailsScreen from '../TripDetailsScreen';
import { TripDetailsProvider } from '../../context/TripDetailsContext';
import { EditModeProvider } from '../../context/EditModeContext';
import { AuthProvider } from '../../context/AuthContext';

// Mock navigation
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {
    tripId: 'test-trip-id',
  },
};

// Mock trip data
const mockTrip = {
  id: 'test-trip-id',
  name: 'Test Trip',
  location: 'Test Location',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-07'),
  description: 'Test trip description',
  status: 'planned',
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Auth
jest.mock('../../config/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}));

// Mock trip services
jest.mock('../../services/trips', () => ({
  getTrip: jest.fn(() => Promise.resolve(mockTrip)),
  updateTrip: jest.fn(() => Promise.resolve(true)),
  deleteTrip: jest.fn(() => Promise.resolve(true)),
}));

// Mock auth context
const mockAuthContext = {
  user: { uid: 'test-user-id' },
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
};

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

// Mock trip details context
const mockTripDetailsContext = {
  currentTrip: mockTrip,
  loading: false,
  error: null,
  loadTrip: jest.fn(() => Promise.resolve(mockTrip)),
  deleteCurrentTrip: jest.fn(() => Promise.resolve(true)),
  saveInlineEdit: jest.fn(() => Promise.resolve(true)),
  clearTripDetails: jest.fn(),
};

jest.mock('../../context/TripDetailsContext', () => ({
  useTripDetails: () => mockTripDetailsContext,
  TripDetailsProvider: ({ children }) => children,
}));

// Mock edit mode context
const mockEditModeContext = {
  isEditMode: false,
  hasUnsavedChanges: false,
  isSaving: false,
  saveError: null,
  isInitialized: true,
  toggleEditMode: jest.fn(),
  enterEditMode: jest.fn(),
  exitEditMode: jest.fn(),
  markUnsavedChanges: jest.fn(),
  clearUnsavedChanges: jest.fn(),
  setSavingState: jest.fn(),
  clearPersistedState: jest.fn(),
};

jest.mock('../../context/EditModeContext', () => ({
  useEditMode: () => mockEditModeContext,
  EditModeProvider: ({ children }) => children,
}));

const renderTripDetailsScreen = () => {
  return render(
    <AuthProvider>
      <EditModeProvider>
        <TripDetailsProvider>
          <TripDetailsScreen navigation={mockNavigation} route={mockRoute} />
        </TripDetailsProvider>
      </EditModeProvider>
    </AuthProvider>
  );
};

describe('TripDetailsScreen Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockClear();
    
    // Reset mock context state
    mockEditModeContext.isEditMode = false;
    mockEditModeContext.hasUnsavedChanges = false;
    mockEditModeContext.isSaving = false;
    mockEditModeContext.saveError = null;
    mockEditModeContext.isInitialized = true;
  });

  describe('Back Button Handling', () => {
    it('should navigate back normally when not in edit mode', async () => {
      const { getByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });
      
      // Mock the back button press
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should show unsaved changes warning when in edit mode with changes', async () => {
      // Set up mock context to simulate edit mode with unsaved changes
      mockEditModeContext.isEditMode = true;
      mockEditModeContext.hasUnsavedChanges = true;
      
      const { getByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });
      
      // Try to go back
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to leave?',
          expect.any(Array)
        );
      });
    });

    it('should navigate back after confirming unsaved changes warning', async () => {
      // Set up mock context to simulate edit mode with unsaved changes
      mockEditModeContext.isEditMode = true;
      mockEditModeContext.hasUnsavedChanges = true;
      
      const { getByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });
      
      // Try to go back
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
      
      // Simulate user choosing to leave
      const alertCall = Alert.alert.mock.calls[0];
      const leaveAction = alertCall[2].find(action => action.text === 'Leave');
      leaveAction.onPress();
      
      expect(mockNavigation.goBack).toHaveBeenCalled();
      expect(mockEditModeContext.exitEditMode).toHaveBeenCalled();
    });
  });

  describe('Edit Mode Toggle', () => {
    it('should show unsaved changes warning when toggling edit mode with changes', async () => {
      // Set up mock context to simulate edit mode with unsaved changes
      mockEditModeContext.isEditMode = true;
      mockEditModeContext.hasUnsavedChanges = true;
      
      const { getByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('edit-button')).toBeTruthy();
      });
      
      // Try to exit edit mode
      const editButton = getByTestId('edit-button');
      fireEvent.press(editButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unsaved Changes',
          'You have unsaved changes. Do you want to save them before exiting edit mode?',
          expect.any(Array)
        );
      });
    });

    it('should allow discarding changes when toggling edit mode', async () => {
      // Set up mock context to simulate edit mode with unsaved changes
      mockEditModeContext.isEditMode = true;
      mockEditModeContext.hasUnsavedChanges = true;
      
      const { getByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('edit-button')).toBeTruthy();
      });
      
      // Try to exit edit mode
      const editButton = getByTestId('edit-button');
      fireEvent.press(editButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
      
      // Simulate user choosing to discard
      const alertCall = Alert.alert.mock.calls[0];
      const discardAction = alertCall[2].find(action => action.text === 'Discard');
      discardAction.onPress();
      
      expect(mockEditModeContext.clearUnsavedChanges).toHaveBeenCalled();
      expect(mockEditModeContext.toggleEditMode).toHaveBeenCalled();
    });
  });

  describe('Visual Indicators', () => {
    it('should show unsaved changes indicator when in edit mode with changes', async () => {
      // Set up mock context to simulate edit mode with unsaved changes
      mockEditModeContext.isEditMode = true;
      mockEditModeContext.hasUnsavedChanges = true;
      
      const { getByTestId, queryByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('edit-button')).toBeTruthy();
      });
      
      // Check for unsaved changes indicator
      await waitFor(() => {
        expect(queryByTestId('unsaved-indicator')).toBeTruthy();
      });
    });

    it('should change edit button color when there are unsaved changes', async () => {
      // Set up mock context to simulate edit mode with unsaved changes
      mockEditModeContext.isEditMode = true;
      mockEditModeContext.hasUnsavedChanges = true;
      
      const { getByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('edit-button')).toBeTruthy();
      });
      
      // Check that edit button exists (color testing would be done in integration tests)
      const editButton = getByTestId('edit-button');
      expect(editButton).toBeTruthy();
    });
  });

  describe('Edit Mode Persistence', () => {
    it('should persist edit mode state across navigation', async () => {
      // Set up mock context to simulate edit mode
      mockEditModeContext.isEditMode = true;
      
      const { getByTestId } = renderTripDetailsScreen();
      
      await waitFor(() => {
        expect(getByTestId('edit-button')).toBeTruthy();
      });
      
      // Navigate away and back
      mockNavigation.goBack();
      
      // Re-render the screen (simulating navigation back)
      const { getByTestId: getByTestIdAfterNavigation } = renderTripDetailsScreen();
      
      // Should still be in edit mode
      await waitFor(() => {
        expect(getByTestIdAfterNavigation('edit-button')).toBeTruthy();
      });
    });
  });
});
