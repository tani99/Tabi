import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ItineraryScreen from '../ItineraryScreen';

// Mock the contexts
jest.mock('../../context/TripDetailsContext', () => ({
  useTripDetails: () => ({
    currentTrip: {
      id: 'trip-123',
      name: 'Test Trip',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
    },
    loading: false,
    loadTrip: jest.fn(),
  }),
  TripDetailsProvider: ({ children }) => children,
}));

jest.mock('../../context/ItineraryContext', () => ({
  useItinerary: () => ({
    itinerary: null,
    loading: false,
    addDay: jest.fn(),
    getItinerary: jest.fn(),
  }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
  }),
}));

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockRoute = {
  params: {
    tripId: 'trip-123',
    tripName: 'Test Trip',
  },
};

describe('ItineraryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with trip data', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ItineraryScreen navigation={mockNavigation} route={mockRoute} />
      </NavigationContainer>
    );

    expect(getByText('Test Trip')).toBeTruthy();
    expect(getByText('Day 1 Itinerary')).toBeTruthy();
  });

  it('shows day navigation when trip has dates', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ItineraryScreen navigation={mockNavigation} route={mockRoute} />
      </NavigationContainer>
    );

    expect(getByText('Day 1 of 5')).toBeTruthy();
  });

  it('shows empty state message', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ItineraryScreen navigation={mockNavigation} route={mockRoute} />
      </NavigationContainer>
    );

    expect(getByText('No activities planned')).toBeTruthy();
    expect(getByText('Add Activity')).toBeTruthy();
  });

  it('handles back navigation', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <ItineraryScreen navigation={mockNavigation} route={mockRoute} />
      </NavigationContainer>
    );

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
