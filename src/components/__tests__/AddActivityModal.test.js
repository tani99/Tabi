import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddActivityModal from '../AddActivityModal';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  return function MockDateTimePicker({ value, onChange }) {
    return null;
  };
});

describe('AddActivityModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <AddActivityModal {...defaultProps} />
    );

    expect(getByText('Add Activity')).toBeTruthy();
    expect(getByText('Activity Title *')).toBeTruthy();
    expect(getByPlaceholderText('Enter activity title')).toBeTruthy();
    expect(getByText('Start Time *')).toBeTruthy();
    expect(getByText('End Time *')).toBeTruthy();
    expect(getByText('Notes (Optional)')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Save Activity')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <AddActivityModal {...defaultProps} visible={false} />
    );

    expect(queryByText('Add Activity')).toBeNull();
  });

  it('calls onClose when cancel button is pressed', () => {
    const { getByText } = render(<AddActivityModal {...defaultProps} />);
    
    fireEvent.press(getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is pressed', () => {
    const { getByTestId } = render(<AddActivityModal {...defaultProps} />);
    
    // Find the close button by looking for the Ionicons close icon
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation error for empty title', async () => {
    const { getByText } = render(<AddActivityModal {...defaultProps} />);
    
    fireEvent.press(getByText('Save Activity'));
    
    await waitFor(() => {
      expect(getByText('Activity title is required')).toBeTruthy();
    });
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows validation error for title too long', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddActivityModal {...defaultProps} />
    );
    
    const titleInput = getByPlaceholderText('Enter activity title');
    const longTitle = 'a'.repeat(101); // 101 characters
    
    fireEvent.changeText(titleInput, longTitle);
    fireEvent.press(getByText('Save Activity'));
    
    await waitFor(() => {
      expect(getByText('Title must be 100 characters or less')).toBeTruthy();
    });
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows validation error for notes too long', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddActivityModal {...defaultProps} />
    );
    
    const titleInput = getByPlaceholderText('Enter activity title');
    const notesInput = getByPlaceholderText('Add any additional notes...');
    const longNotes = 'a'.repeat(501); // 501 characters
    
    fireEvent.changeText(titleInput, 'Valid Title');
    fireEvent.changeText(notesInput, longNotes);
    fireEvent.press(getByText('Save Activity'));
    
    await waitFor(() => {
      expect(getByText('Notes must be 500 characters or less')).toBeTruthy();
    });
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with valid activity data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddActivityModal {...defaultProps} />
    );
    
    const titleInput = getByPlaceholderText('Enter activity title');
    const notesInput = getByPlaceholderText('Add any additional notes...');
    
    fireEvent.changeText(titleInput, 'Visit Museum');
    fireEvent.changeText(notesInput, 'Check opening hours');
    fireEvent.press(getByText('Save Activity'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Visit Museum',
          notes: 'Check opening hours',
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          id: expect.stringMatching(/activity_\d+_[a-z0-9]+/),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
    });
  });

  it('initializes with default times when no lastActivityEndTime', () => {
    const { getByText } = render(<AddActivityModal {...defaultProps} />);
    
    // Should show default time (9:00 AM)
    expect(getByText('9:00 AM')).toBeTruthy();
  });

  it('initializes with lastActivityEndTime when provided', () => {
    const lastEndTime = new Date(2024, 0, 1, 14, 30, 0); // 2:30 PM
    const { getByText } = render(
      <AddActivityModal {...defaultProps} lastActivityEndTime={lastEndTime} />
    );
    
    // Should show the last activity end time
    expect(getByText('2:30 PM')).toBeTruthy();
  });

  it('shows loading state on save button when loading prop is true', () => {
    const { getByTestId } = render(
      <AddActivityModal {...defaultProps} loading={true} />
    );
    
    // When loading, the button should be disabled and show ActivityIndicator
    const saveButton = getByTestId('save-activity-button');
    expect(saveButton).toBeTruthy();
    expect(saveButton.props.accessibilityState.disabled).toBe(true);
  });

  it('disables save button when loading', () => {
    const { getByTestId } = render(
      <AddActivityModal {...defaultProps} loading={true} />
    );
    
    const saveButton = getByTestId('save-activity-button');
    fireEvent.press(saveButton);
    
    // Should not call onSave when loading
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
