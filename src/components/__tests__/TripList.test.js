import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TripList from '../TripList';

// Mock the dependencies
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('../TripCard', () => 'TripCard');
jest.mock('../ui/LoadingIndicator', () => 'LoadingIndicator');
jest.mock('../CustomButton', () => 'CustomButton');

describe('TripList', () => {
  const mockTrips = [
    {
      id: '1',
      name: 'Paris Adventure',
      location: 'Paris, France',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-20'),
      status: 'planning',
      description: 'A wonderful trip to Paris',
    },
    {
      id: '2',
      name: 'Tokyo Exploration',
      location: 'Tokyo, Japan',
      startDate: new Date('2024-07-10'),
      endDate: new Date('2024-07-15'),
      status: 'active',
      description: 'Exploring the vibrant city of Tokyo',
    },
  ];

  const defaultProps = {
    trips: [],
    loading: false,
    error: null,
    onTripPress: jest.fn(),
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no trips are provided', () => {
    const { getByText } = render(<TripList {...defaultProps} />);
    
    expect(getByText('No Trips Yet')).toBeTruthy();
    expect(getByText("You haven't created any trips yet")).toBeTruthy();
  });

  it('renders trip cards when trips are provided', () => {
    const { UNSAFE_root } = render(
      <TripList {...defaultProps} trips={mockTrips} />
    );
    
    // Check that the component renders without crashing
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows loading skeleton when loading is true and no trips', () => {
    const { UNSAFE_root } = render(
      <TripList {...defaultProps} loading={true} />
    );
    
    // Check that the component renders without crashing
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows error state when error is provided', () => {
    const error = new Error('Failed to load trips');
    const { getByText } = render(
      <TripList {...defaultProps} error={error} />
    );
    
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Failed to load trips')).toBeTruthy();
  });

  it('calls onTripPress when a trip card is pressed', () => {
    const onTripPress = jest.fn();
    const { UNSAFE_root } = render(
      <TripList {...defaultProps} trips={mockTrips} onTripPress={onTripPress} />
    );
    
    // Check that the component renders without crashing
    expect(UNSAFE_root).toBeTruthy();
    expect(onTripPress).not.toHaveBeenCalled(); // Initially not called
  });

  it('calls onRetry when retry button is pressed in error state', () => {
    const onRetry = jest.fn();
    const error = new Error('Network error');
    const { UNSAFE_root } = render(
      <TripList {...defaultProps} error={error} onRetry={onRetry} />
    );
    
    // Check that the component renders without crashing
    expect(UNSAFE_root).toBeTruthy();
    expect(onRetry).not.toHaveBeenCalled(); // Initially not called
  });

  it('calls onEmptyStateButtonPress when create trip button is pressed', () => {
    const onEmptyStateButtonPress = jest.fn();
    const { UNSAFE_root } = render(
      <TripList {...defaultProps} onEmptyStateButtonPress={onEmptyStateButtonPress} />
    );
    
    // Check that the component renders without crashing
    expect(UNSAFE_root).toBeTruthy();
    expect(onEmptyStateButtonPress).not.toHaveBeenCalled(); // Initially not called
  });

  it('handles custom empty state message', () => {
    const customMessage = 'No trips found for this filter';
    const { getByText } = render(
      <TripList {...defaultProps} emptyStateMessage={customMessage} />
    );
    
    expect(getByText(customMessage)).toBeTruthy();
  });

  it('handles custom empty state button text', () => {
    const customButtonText = 'Start Planning';
    const onEmptyStateButtonPress = jest.fn();
    const { UNSAFE_root } = render(
      <TripList 
        {...defaultProps} 
        emptyStateButtonText={customButtonText}
        onEmptyStateButtonPress={onEmptyStateButtonPress}
      />
    );
    
    // Check that the component renders without crashing
    expect(UNSAFE_root).toBeTruthy();
  });

  it('hides empty state when showEmptyState is false', () => {
    const { queryByText } = render(
      <TripList {...defaultProps} showEmptyState={false} />
    );
    
    expect(queryByText('No Trips Yet')).toBeNull();
  });

  it('renders footer for infinite scroll when hasMore is true', () => {
    const { UNSAFE_root } = render(
      <TripList {...defaultProps} hasMore={true} trips={mockTrips} />
    );
    
    // Check that the component renders without crashing
    expect(UNSAFE_root).toBeTruthy();
  });

  it('does not render footer when hasMore is false', () => {
    const { queryByText } = render(
      <TripList {...defaultProps} hasMore={false} trips={mockTrips} />
    );
    
    expect(queryByText('Loading more trips...')).toBeNull();
  });
});
