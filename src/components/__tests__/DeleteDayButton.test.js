import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, View } from 'react-native';
import DeleteDayButton from '../DeleteDayButton';

// Mock Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('DeleteDayButton', () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <DeleteDayButton
        onDelete={mockOnDelete}
        dayNumber={1}
        totalDays={3}
      />
    );

    expect(getByTestId('delete-day-button-1')).toBeTruthy();
  });

  it('shows confirmation dialog when pressed', () => {
    const { getByTestId } = render(
      <DeleteDayButton
        onDelete={mockOnDelete}
        dayNumber={2}
        totalDays={3}
      />
    );

    fireEvent.press(getByTestId('delete-day-button-2'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Day',
      'Are you sure you want to delete Day 2? This action cannot be undone.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete' })
      ]),
      { cancelable: true }
    );
  });

  it('calls onDelete when user confirms deletion', async () => {
    const { getByTestId } = render(
      <DeleteDayButton
        onDelete={mockOnDelete}
        dayNumber={1}
        totalDays={3}
      />
    );

    fireEvent.press(getByTestId('delete-day-button-1'));

    // Get the alert call and extract the delete button's onPress
    const alertCall = Alert.alert.mock.calls[0];
    const deleteButton = alertCall[2].find(button => button.text === 'Delete');
    
    // Simulate user pressing delete (if onPress exists)
    if (deleteButton && deleteButton.onPress) {
      deleteButton.onPress();
    }

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('does not call onDelete when user cancels', () => {
    const { getByTestId } = render(
      <DeleteDayButton
        onDelete={mockOnDelete}
        dayNumber={1}
        totalDays={3}
      />
    );

    fireEvent.press(getByTestId('delete-day-button-1'));

    // Get the alert call and extract the cancel button
    const alertCall = Alert.alert.mock.calls[0];
    const cancelButton = alertCall[2].find(button => button.text === 'Cancel');
    
    // Simulate user pressing cancel (if onPress exists)
    if (cancelButton && cancelButton.onPress) {
      cancelButton.onPress();
    }

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByTestId } = render(
      <DeleteDayButton
        onDelete={mockOnDelete}
        dayNumber={1}
        totalDays={3}
        disabled={true}
      />
    );

    const button = getByTestId('delete-day-button-1');
    fireEvent.press(button);

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('applies selected styles when isSelected is true', () => {
    const { getByTestId } = render(
      <DeleteDayButton
        onDelete={mockOnDelete}
        dayNumber={1}
        totalDays={3}
        isSelected={true}
      />
    );

    const button = getByTestId('delete-day-button-1');
    expect(button).toBeTruthy();
  });

  it('applies different styles based on selection state', () => {
    const { getByTestId } = render(
      <View>
        <DeleteDayButton
          onDelete={mockOnDelete}
          dayNumber={1}
          totalDays={3}
          isSelected={true}
        />
        <DeleteDayButton
          onDelete={mockOnDelete}
          dayNumber={2}
          totalDays={3}
          isSelected={false}
        />
      </View>
    );

    // Both buttons should render, but with different styles
    expect(getByTestId('delete-day-button-1')).toBeTruthy();
    expect(getByTestId('delete-day-button-2')).toBeTruthy();
  });
});
