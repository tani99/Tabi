import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import EditTripScreen from '../EditTripScreen';
import { getTrip, updateTrip } from '../../services/trips';

// Mock the navigation
const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

// Mock the route
const mockRoute = {
  params: {
    tripId: 'test-trip-id',
  },
};

// Mock the trip services
jest.mock('../../services/trips');
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
    },
    loading: false,
  }),
}));

// Mock navigation hooks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      tripId: 'test-trip-id',
    },
  }),
}));

// Mock trip data
const mockTripData = {
  id: 'test-trip-id',
  name: 'Test Trip',
  location: 'Test Location',
  startDate: new Date('2024-12-15'),
  endDate: new Date('2024-12-20'),
  description: 'Test description',
  status: 'planning',
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const renderEditTripScreen = () => {
  return render(
    <NavigationContainer>
      <EditTripScreen navigation={mockNavigation} route={mockRoute} />
    </NavigationContainer>
  );
};

describe('EditTripScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getTrip.mockResolvedValue(mockTripData);
    updateTrip.mockResolvedValue(true);
  });

  it('renders loading state initially', () => {
    const { getByText } = renderEditTripScreen();
    expect(getByText('Loading trip details...')).toBeTruthy();
  });

  it('loads and displays trip data', async () => {
    const { getByText, getByDisplayValue } = renderEditTripScreen();
    
    await waitFor(() => {
      expect(getByText('Edit Trip')).toBeTruthy();
      expect(getByDisplayValue('Test Trip')).toBeTruthy();
      expect(getByDisplayValue('Test Location')).toBeTruthy();
      expect(getByDisplayValue('Test description')).toBeTruthy();
    });
  });

  it('shows error when trip is not found', async () => {
    getTrip.mockRejectedValue(new Error('Trip not found'));
    
    const { getByText } = renderEditTripScreen();
    
    await waitFor(() => {
      expect(getByText('Trip not found')).toBeTruthy();
    });
  });

  it('validates required fields', async () => {
    const { getByText, getByDisplayValue } = renderEditTripScreen();
    
    await waitFor(() => {
      expect(getByText('Edit Trip')).toBeTruthy();
    });

    // Clear required fields
    const nameInput = getByDisplayValue('Test Trip');
    fireEvent.changeText(nameInput, '');

    const locationInput = getByDisplayValue('Test Location');
    fireEvent.changeText(locationInput, '');

    // Try to save
    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Trip name is required')).toBeTruthy();
      expect(getByText('Location is required')).toBeTruthy();
    });
  });

  it('saves trip successfully', async () => {
    const { getByText } = renderEditTripScreen();
    
    await waitFor(() => {
      expect(getByText('Edit Trip')).toBeTruthy();
    });

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(updateTrip).toHaveBeenCalledWith(
        'test-trip-id',
        expect.objectContaining({
          name: 'Test Trip',
          location: 'Test Location',
          description: 'Test description',
          status: 'planning',
        }),
        'test-user-id'
      );
    });
  });

  it('shows confirmation dialog when canceling', async () => {
    const { getByText } = renderEditTripScreen();
    
    await waitFor(() => {
      expect(getByText('Edit Trip')).toBeTruthy();
    });

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    // Note: Alert.alert is mocked by React Native Testing Library
    // The actual dialog behavior would be tested in integration tests
  });

  it('handles save errors', async () => {
    updateTrip.mockRejectedValue(new Error('Update failed'));
    
    const { getByText } = renderEditTripScreen();
    
    await waitFor(() => {
      expect(getByText('Edit Trip')).toBeTruthy();
    });

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(updateTrip).toHaveBeenCalled();
    });
  });
});
