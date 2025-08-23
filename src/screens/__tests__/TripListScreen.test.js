import React from 'react';
import { render } from '@testing-library/react-native';
import TripListScreen from '../TripListScreen';

// Mock the navigation prop
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    isAuthenticated: true,
    loading: false,
  }),
}));

// Mock the trip services
jest.mock('../../services/trips', () => ({
  getUserTrips: jest.fn(() => Promise.resolve([])),
  searchTrips: jest.fn(() => Promise.resolve([])),
}));

// Mock the layout components
jest.mock('../../components/layout/ScreenLayout', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }) => <View testID="screen-layout">{children}</View>;
});

jest.mock('../../components/layout/ScreenHeader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="screen-header" />;
});

jest.mock('../../components/ui/LoadingIndicator', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="loading-indicator" />;
});

describe('TripListScreen', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <TripListScreen navigation={mockNavigation} />
    );
    
    expect(getByTestId('screen-layout')).toBeTruthy();
    expect(getByTestId('screen-header')).toBeTruthy();
  });

  it('shows loading state initially', () => {
    const { getByTestId } = render(
      <TripListScreen navigation={mockNavigation} />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
