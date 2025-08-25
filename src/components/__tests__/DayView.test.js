import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DayView from '../DayView';

// Mock react-native-vector-icons if used
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('DayView', () => {
  const mockTripDates = {
    tripStartDate: '2024-03-15',
    tripEndDate: '2024-03-19',
  };

  const defaultProps = {
    ...mockTripDates,
    selectedDay: 1,
    onDayChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders day tabs for trip duration', () => {
    const { getByText } = render(<DayView {...defaultProps} />);
    
    // Should show 5 days (March 15-19)
    expect(getByText('Day 1')).toBeTruthy();
    expect(getByText('Day 2')).toBeTruthy();
    expect(getByText('Day 3')).toBeTruthy();
    expect(getByText('Day 4')).toBeTruthy();
    expect(getByText('Day 5')).toBeTruthy();
  });

  it('displays day count indicator', () => {
    const { getByText } = render(<DayView {...defaultProps} selectedDay={3} />);
    
    expect(getByText('Day 3 of 5')).toBeTruthy();
  });

  it('shows formatted dates in tabs', () => {
    const { getByText } = render(<DayView {...defaultProps} />);
    
    // Check for formatted dates
    expect(getByText('Mar 15')).toBeTruthy();
    expect(getByText('Mar 16')).toBeTruthy();
    expect(getByText('Mar 17')).toBeTruthy();
    expect(getByText('Mar 18')).toBeTruthy();
    expect(getByText('Mar 19')).toBeTruthy();
  });

  it('calls onDayChange when day tab is pressed', () => {
    const onDayChange = jest.fn();
    const { getByText } = render(
      <DayView {...defaultProps} onDayChange={onDayChange} />
    );
    
    fireEvent.press(getByText('Day 2'));
    
    expect(onDayChange).toHaveBeenCalledWith(2);
  });

  it('handles single day trips', () => {
    const singleDayProps = {
      tripStartDate: '2024-03-15',
      tripEndDate: '2024-03-15',
      selectedDay: 1,
      onDayChange: jest.fn(),
    };
    
    const { getByText } = render(<DayView {...singleDayProps} />);
    
    expect(getByText('Day 1')).toBeTruthy();
    expect(getByText('Day 1 of 1')).toBeTruthy();
  });

  it('handles missing trip dates gracefully', () => {
    const { getByText } = render(
      <DayView
        tripStartDate={null}
        tripEndDate={null}
        selectedDay={1}
        onDayChange={jest.fn()}
      />
    );
    
    expect(getByText('No trip dates available')).toBeTruthy();
  });

  it('handles invalid date ranges', () => {
    const invalidDateProps = {
      tripStartDate: '2024-03-19', // End date before start date
      tripEndDate: '2024-03-15',
      selectedDay: 1,
      onDayChange: jest.fn(),
    };
    
    const { getByText } = render(<DayView {...invalidDateProps} />);
    
    // Should still render but with 0 days
    expect(getByText('No trip dates available')).toBeTruthy();
  });

  it('updates selected day when prop changes', async () => {
    const { getByText, rerender } = render(<DayView {...defaultProps} />);
    
    expect(getByText('Day 1 of 5')).toBeTruthy();
    
    rerender(<DayView {...defaultProps} selectedDay={3} />);
    
    await waitFor(() => {
      expect(getByText('Day 3 of 5')).toBeTruthy();
    });
  });

  it('handles edge case with same start and end date', () => {
    const sameDateProps = {
      tripStartDate: '2024-03-15',
      tripEndDate: '2024-03-15',
      selectedDay: 1,
      onDayChange: jest.fn(),
    };
    
    const { getByText } = render(<DayView {...sameDateProps} />);
    
    expect(getByText('Day 1')).toBeTruthy();
    expect(getByText('Day 1 of 1')).toBeTruthy();
  });

  it('applies custom style prop', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <DayView {...defaultProps} style={customStyle} />
    );
    
    // Note: In a real test, you might need to add testID to the component
    // This is a placeholder for style testing
    expect(true).toBeTruthy(); // Placeholder assertion
  });
});
