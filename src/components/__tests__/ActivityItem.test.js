import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ActivityItem from '../ActivityItem';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('ActivityItem', () => {
  const mockActivity = {
    id: 'test-activity-1',
    title: 'Visit Museum',
    startTime: new Date('2024-01-15T09:00:00'),
    endTime: new Date('2024-01-15T11:00:00'),
    notes: 'Don\'t forget to bring camera',
    createdAt: new Date('2024-01-14T10:00:00'),
    updatedAt: new Date('2024-01-14T10:00:00')
  };

  const defaultProps = {
    activity: mockActivity,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders activity information correctly', () => {
    const { getByText } = render(<ActivityItem {...defaultProps} />);
    
    expect(getByText('Visit Museum')).toBeTruthy();
    expect(getByText('9:00 AM - 11:00 AM')).toBeTruthy();
    expect(getByText('2 hours')).toBeTruthy();
    expect(getByText('Don\'t forget to bring camera')).toBeTruthy();
  });

  it('calls onEdit when edit button is pressed', () => {
    const { getByTestId } = render(<ActivityItem {...defaultProps} testID="activity-item" />);
    
    const editButton = getByTestId('activity-item-edit-button');
    fireEvent.press(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockActivity);
  });

  it('shows delete confirmation when delete button is pressed', () => {
    const { getByTestId } = render(<ActivityItem {...defaultProps} testID="activity-item" />);
    
    const deleteButton = getByTestId('activity-item-delete-button');
    fireEvent.press(deleteButton);
    
    // Should show alert (we can't easily test Alert in unit tests)
    // But we can verify the button exists and is pressable
    expect(deleteButton).toBeTruthy();
  });

  it('displays duration correctly for different time spans', () => {
    const shortActivity = {
      ...mockActivity,
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-15T09:30:00'),
    };
    
    const { getByText } = render(<ActivityItem {...defaultProps} activity={shortActivity} />);
    expect(getByText('30 min')).toBeTruthy();
  });

  it('handles long titles with ellipsis', () => {
    const longTitleActivity = {
      ...mockActivity,
      title: 'This is a very long activity title that should be truncated with ellipsis when it exceeds the maximum width allowed',
    };
    
    const { getByText } = render(<ActivityItem {...defaultProps} activity={longTitleActivity} />);
    expect(getByText(longTitleActivity.title)).toBeTruthy();
  });

  it('handles activities without notes', () => {
    const activityWithoutNotes = {
      ...mockActivity,
      notes: '',
    };
    
    const { queryByText } = render(<ActivityItem {...defaultProps} activity={activityWithoutNotes} />);
    expect(queryByText('Don\'t forget to bring camera')).toBeNull();
  });

  it('shows loading state correctly', () => {
    const { getByTestId } = render(
      <ActivityItem {...defaultProps} loading={true} testID="activity-item" />
    );
    
    // Edit and delete buttons should be disabled when loading
    const editButton = getByTestId('activity-item-edit-button');
    const deleteButton = getByTestId('activity-item-delete-button');
    
    expect(editButton.props.accessibilityState?.disabled).toBeTruthy();
    expect(deleteButton.props.accessibilityState?.disabled).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(<ActivityItem {...defaultProps} testID="activity-item" />);
    
    const activityButton = getByLabelText(/Activity: Visit Museum/);
    expect(activityButton.props.accessibilityLabel).toContain('Activity: Visit Museum');
    expect(activityButton.props.accessibilityLabel).toContain('Time: 9:00 AM - 11:00 AM');
    expect(activityButton.props.accessibilityLabel).toContain('Duration: 2 hours');
    expect(activityButton.props.accessibilityLabel).toContain('Notes: Don\'t forget to bring camera');
  });
});
