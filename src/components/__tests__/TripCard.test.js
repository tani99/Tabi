import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TripCard from '../TripCard';
import { TRIP_STATUS, TRIP_STATUS_LABELS } from '../../utils/tripConstants';

// Mock the current date for consistent testing
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-12-15'));
});

afterAll(() => {
  jest.useRealTimers();
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('TripCard', () => {
  const mockTrip = {
    id: '1',
    name: 'Paris Adventure',
    location: 'Paris, France',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-06-20'),
    description: 'A wonderful trip to the City of Light',
    status: TRIP_STATUS.UPCOMING,
    userId: 'user123',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01')
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trip information correctly', () => {
    const { getByText } = render(
      <TripCard trip={mockTrip} onPress={mockOnPress} />
    );

    expect(getByText('Paris Adventure')).toBeTruthy();
    expect(getByText('Paris, France')).toBeTruthy();
    expect(getByText('Jun 15-20, 2025')).toBeTruthy();
    expect(getByText('A wonderful trip to the City of Light')).toBeTruthy();
    expect(getByText('Upcoming')).toBeTruthy();
  });

  it('handles onPress correctly', () => {
    const { getByText } = render(
      <TripCard trip={mockTrip} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Paris Adventure'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders loading state correctly', () => {
    const { getByTestId } = render(
      <TripCard trip={mockTrip} onPress={mockOnPress} loading={true} />
    );

    // The loading state should show skeleton elements
    const card = getByTestId('trip-card');
    expect(card).toBeTruthy();
  });

  it('renders without description when not provided', () => {
    const tripWithoutDescription = { ...mockTrip };
    delete tripWithoutDescription.description;

    const { queryByText } = render(
      <TripCard trip={tripWithoutDescription} onPress={mockOnPress} />
    );

    expect(queryByText('A wonderful trip to the City of Light')).toBeNull();
  });

  it('renders different status badges correctly', () => {
    const testCases = [
      {
        status: TRIP_STATUS.UPCOMING,
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-20')
      },
      {
        status: TRIP_STATUS.ONGOING,
        startDate: new Date('2024-12-10'),
        endDate: new Date('2024-12-20')
      },
      {
        status: TRIP_STATUS.COMPLETED,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07')
      }
    ];

    testCases.forEach(({ status, startDate, endDate }) => {
      const tripWithStatus = { 
        ...mockTrip, 
        startDate,
        endDate
      };
      const { getByText } = render(
        <TripCard trip={tripWithStatus} onPress={mockOnPress} />
      );

      expect(getByText(TRIP_STATUS_LABELS[status])).toBeTruthy();
    });
  });

  it('formats date ranges correctly for different scenarios', () => {
    // Same month and year
    const sameMonthTrip = {
      ...mockTrip,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-20')
    };

    const { getByText, rerender } = render(
      <TripCard trip={sameMonthTrip} onPress={mockOnPress} />
    );
    expect(getByText('Dec 15-20, 2024')).toBeTruthy();

    // Different months, same year
    const differentMonthsTrip = {
      ...mockTrip,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2025-01-05')
    };

    rerender(<TripCard trip={differentMonthsTrip} onPress={mockOnPress} />);
    expect(getByText('Dec 15, 2024 - Jan 5, 2025')).toBeTruthy();

    // Different years
    const differentYearsTrip = {
      ...mockTrip,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2025-01-05')
    };

    rerender(<TripCard trip={differentYearsTrip} onPress={mockOnPress} />);
    expect(getByText('Dec 15, 2024 - Jan 5, 2025')).toBeTruthy();
  });

  it('handles missing dates gracefully', () => {
    const tripWithoutDates = {
      ...mockTrip,
      startDate: null,
      endDate: null
    };

    const { getByText } = render(
      <TripCard trip={tripWithoutDates} onPress={mockOnPress} />
    );

    expect(getByText('Dates TBD')).toBeTruthy();
  });

  it('applies custom styles correctly', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <TripCard trip={mockTrip} onPress={mockOnPress} style={customStyle} />
    );

    const card = getByTestId('trip-card');
    expect(card.props.style.backgroundColor).toBe('red');
  });

  it('returns null when trip is not provided', () => {
    const { UNSAFE_root } = render(
      <TripCard trip={null} onPress={mockOnPress} />
    );

    expect(UNSAFE_root.children).toHaveLength(0);
  });

  it('truncates long text correctly', () => {
    const longTrip = {
      ...mockTrip,
      name: 'This is a very long trip name that should be truncated when it exceeds the available space',
      location: 'This is a very long location name that should be truncated when it exceeds the available space',
      description: 'This is a very long description that should be truncated to two lines when it exceeds the available space. It should show ellipsis when truncated.'
    };

    const { getByText } = render(
      <TripCard trip={longTrip} onPress={mockOnPress} />
    );

    // The text should be rendered but truncated by numberOfLines prop
    expect(getByText(longTrip.name)).toBeTruthy();
    expect(getByText(longTrip.location)).toBeTruthy();
    expect(getByText(longTrip.description)).toBeTruthy();
  });
});
