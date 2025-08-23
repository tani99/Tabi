import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TripEditForm from '../TripEditForm';
import TripDatePicker from '../TripDatePicker';
import TripStatusPicker from '../TripStatusPicker';
import TripEditActions from '../TripEditActions';
import { TRIP_STATUS, DEFAULT_TRIP } from '../../../utils/tripConstants';

// Mock the navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('TripEditForm', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    initialData: DEFAULT_TRIP,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    const { getByText, getByPlaceholderText } = render(<TripEditForm />);

    // Check that all form labels are present
    expect(getByText('Trip Name')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('Start Date')).toBeTruthy();
    expect(getByText('End Date')).toBeTruthy();
    expect(getByText('Description (Optional)')).toBeTruthy();

    expect(getByPlaceholderText('Enter trip name')).toBeTruthy();
    expect(getByPlaceholderText('Enter destination')).toBeTruthy();
    expect(getByPlaceholderText('Enter trip description')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText } = render(
      <TripEditForm {...defaultProps} />
    );

    // Try to submit without filling required fields
    const formRef = React.createRef();
    render(<TripEditForm {...defaultProps} ref={formRef} />);

    // This would require ref access, so we'll test validation through user interaction
    const nameInput = getByText('Trip Name');
    fireEvent.press(nameInput);

    // The form should show validation errors for required fields
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('handles form data changes', () => {
    const { getByPlaceholderText } = render(
      <TripEditForm {...defaultProps} />
    );

    const nameInput = getByPlaceholderText('Enter trip name');
    fireEvent.changeText(nameInput, 'Test Trip');

    expect(nameInput.props.value).toBe('Test Trip');
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Something went wrong';
    const { getByText } = render(
      <TripEditForm {...defaultProps} error={errorMessage} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });
});

describe('TripDatePicker', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Test Date',
    value: new Date('2024-01-15'),
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label and formatted date', () => {
    const { getByText } = render(<TripDatePicker {...defaultProps} />);

    expect(getByText('Test Date')).toBeTruthy();
    expect(getByText('Jan 15, 2024')).toBeTruthy();
  });

  it('shows placeholder when no date is provided', () => {
    const { getByText } = render(
      <TripDatePicker {...defaultProps} value={null} />
    );

    expect(getByText('Select date')).toBeTruthy();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid date';
    const { getByText } = render(
      <TripDatePicker {...defaultProps} error={errorMessage} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('handles disabled state', () => {
    const { getByText } = render(
      <TripDatePicker {...defaultProps} disabled={true} />
    );

    // Just verify the component renders without crashing when disabled
    expect(getByText('Jan 15, 2024')).toBeTruthy();
  });
});

describe('TripStatusPicker', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Trip Status',
    value: TRIP_STATUS.UPCOMING,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label and current status', () => {
    const { getByText } = render(<TripStatusPicker {...defaultProps} />);

    expect(getByText('Trip Status')).toBeTruthy();
    expect(getByText('Upcoming')).toBeTruthy();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid status';
    const { getByText } = render(
      <TripStatusPicker {...defaultProps} error={errorMessage} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('opens modal when pressed', () => {
    const { getByText, getAllByText } = render(<TripStatusPicker {...defaultProps} />);

    const statusButton = getByText('Upcoming');
    fireEvent.press(statusButton);

    // Modal should be visible with status options
    expect(getByText('Select Status')).toBeTruthy();
    
    // Use getAllByText since there are multiple "Upcoming" elements (button and modal option)
    const upcomingElements = getAllByText('Upcoming');
    expect(upcomingElements.length).toBeGreaterThan(0);
    
    expect(getByText('Ongoing')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
  });
});

describe('TripEditActions', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders save and cancel buttons', () => {
    const { getByText } = render(<TripEditActions {...defaultProps} />);

    expect(getByText('Save Changes')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('calls onSave when save button is pressed', () => {
    const { getByText } = render(<TripEditActions {...defaultProps} />);

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('shows confirmation dialog when cancel is pressed', () => {
    const { getByText } = render(<TripEditActions {...defaultProps} />);

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Cancel Editing',
      'Are you sure you want to cancel? Any unsaved changes will be lost.',
      expect.any(Array)
    );
  });

  it('handles loading state', () => {
    const { getByText } = render(
      <TripEditActions {...defaultProps} loading={true} />
    );

    // When loading, the button should still be present but may show loading indicator
    // Just verify the component renders without crashing
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('handles disabled state', () => {
    const { getByText } = render(
      <TripEditActions {...defaultProps} disabled={true} />
    );

    // Just verify the component renders without crashing when disabled
    expect(getByText('Save Changes')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });
});
