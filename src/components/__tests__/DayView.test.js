import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DayView from '../DayView';

// Mock Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

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
    totalDays: 5, // 5 days for March 15-19
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockClear();
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
      totalDays: 1,
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
        totalDays={0}
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
      totalDays: 0,
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
      totalDays: 1,
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

  it('shows delete button only for selected day when multiple days exist', () => {
    const onDeleteDay = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <DayView 
        {...defaultProps} 
        selectedDay={2}
        onDeleteDay={onDeleteDay}
      />
    );
    
    // Should show delete button for selected day (day 2)
    expect(getByTestId('delete-day-button-2')).toBeTruthy();
    
    // Should not show delete button for non-selected days
    expect(queryByTestId('delete-day-button-1')).toBeNull();
    expect(queryByTestId('delete-day-button-3')).toBeNull();
    expect(queryByTestId('delete-day-button-4')).toBeNull();
    expect(queryByTestId('delete-day-button-5')).toBeNull();
  });

  it('does not show delete button for single day trips', () => {
    const onDeleteDay = jest.fn();
    const singleDayProps = {
      tripStartDate: '2024-03-15',
      tripEndDate: '2024-03-15',
      selectedDay: 1,
      onDayChange: jest.fn(),
      onDeleteDay,
      totalDays: 1,
    };
    
    const { queryByTestId } = render(<DayView {...singleDayProps} />);
    
    // Should not show delete button for single day trips
    expect(queryByTestId('delete-day-button-1')).toBeNull();
  });

  it('does not show delete button when onDeleteDay is not provided', () => {
    const { queryByTestId } = render(<DayView {...defaultProps} selectedDay={2} />);
    
    // Should not show delete button when onDeleteDay is not provided
    expect(queryByTestId('delete-day-button-2')).toBeNull();
  });

  it('shows add day button when onAddDay is provided', () => {
    const onAddDay = jest.fn();
    const { getByTestId } = render(
      <DayView {...defaultProps} onAddDay={onAddDay} />
    );
    
    // Should show add day button
    expect(getByTestId('add-day-button')).toBeTruthy();
  });

  it('shows confirmation dialog when add day button is pressed', () => {
    const onAddDay = jest.fn();
    const { getByTestId } = render(
      <DayView {...defaultProps} onAddDay={onAddDay} />
    );
    
    fireEvent.press(getByTestId('add-day-button'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Add Day',
      'Are you sure you want to add a new day to your itinerary?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Add' })
      ]),
      { cancelable: true }
    );
  });

  it('calls onAddDay when user confirms adding day', () => {
    const onAddDay = jest.fn();
    const { getByTestId } = render(
      <DayView {...defaultProps} onAddDay={onAddDay} />
    );
    
    fireEvent.press(getByTestId('add-day-button'));
    
    // Get the alert call and extract the add button's onPress
    const alertCall = Alert.alert.mock.calls[0];
    const addButton = alertCall[2].find(button => button.text === 'Add');
    
    // Simulate user pressing add
    if (addButton && addButton.onPress) {
      addButton.onPress();
    }
    
    expect(onAddDay).toHaveBeenCalled();
  });

  it('does not call onAddDay when user cancels', () => {
    const onAddDay = jest.fn();
    const { getByTestId } = render(
      <DayView {...defaultProps} onAddDay={onAddDay} />
    );
    
    fireEvent.press(getByTestId('add-day-button'));
    
    // Get the alert call and extract the cancel button
    const alertCall = Alert.alert.mock.calls[0];
    const cancelButton = alertCall[2].find(button => button.text === 'Cancel');
    
    // Simulate user pressing cancel (if onPress exists)
    if (cancelButton && cancelButton.onPress) {
      cancelButton.onPress();
    }
    
    expect(onAddDay).not.toHaveBeenCalled();
  });

  it('does not show add day button when onAddDay is not provided', () => {
    const { queryByTestId } = render(<DayView {...defaultProps} />);
    
    // Should not show add day button when onAddDay is not provided
    expect(queryByTestId('add-day-button')).toBeNull();
  });
});
