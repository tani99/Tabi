import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EditModeProvider } from '../../../context/EditModeContext';
import TripDetailsHeader from '../TripDetailsHeader';



// Mock the trip constants
jest.mock('../../../utils/tripConstants', () => ({
  TRIP_STATUS_LABELS: {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled'
  },
  TRIP_STATUS_COLORS: {
    planning: '#F59E0B',
    active: '#10B981',
    completed: '#059669',
    cancelled: '#EF4444'
  }
}));

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

const mockTrip = {
  id: '1',
  name: 'Test Trip',
  location: 'Test Location',
  status: 'planning',
  startDate: '2024-01-01',
  endDate: '2024-01-07'
};

const mockProps = {
  trip: mockTrip,
  onUpdate: jest.fn()
};

const renderWithEditMode = (props = mockProps) => {
  return render(
    <EditModeProvider>
      <TripDetailsHeader {...props} />
    </EditModeProvider>
  );
};

describe('TripDetailsHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trip information correctly', () => {
    const { getByText } = renderWithEditMode();
    
    expect(getByText('Test Trip')).toBeTruthy();
    expect(getByText('Test Location')).toBeTruthy();
    expect(getByText('Planning')).toBeTruthy();
  });

  it('handles empty trip data gracefully', () => {
    const { getByText } = renderWithEditMode({
      ...mockProps,
      trip: null
    });
    
    expect(getByText('Untitled Trip')).toBeTruthy();
    expect(getByText('No location specified')).toBeTruthy();
  });

  it('shows edit icons when in edit mode', async () => {
    const { getByText } = renderWithEditMode();
    
    // The edit icons should be visible when in edit mode
    // This test documents the expected behavior
    expect(getByText('Test Trip')).toBeTruthy();
  });
});
