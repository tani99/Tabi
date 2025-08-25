import React from 'react';
import { render } from '@testing-library/react-native';
import {
  TripDetailsHeader,
  TripDateDisplay,
  TripDescription,
  TripStatistics,
  TripActionButtons
} from '../index';

// Mock trip data for testing
const mockTrip = {
  id: 'test-trip-1',
  name: 'Test Trip to Paris',
  location: 'Paris, France',
  startDate: new Date('2024-12-15'),
  endDate: new Date('2024-12-20'),
  description: 'A wonderful trip to the City of Light with lots of sightseeing and delicious food.',
  status: 'planning',
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date('2024-11-15')
};

// Mock functions for testing
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnShare = jest.fn();
const mockOnBack = jest.fn();

describe('Trip Details Components', () => {
  describe('TripDetailsHeader', () => {
    it('renders without crashing', () => {
      const { getByText } = render(
        <TripDetailsHeader
          trip={mockTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
          onBack={mockOnBack}
        />
      );
      
      expect(getByText('Test Trip to Paris')).toBeTruthy();
      expect(getByText('Paris, France')).toBeTruthy();
      expect(getByText('Planning')).toBeTruthy();
    });

    it('handles missing trip data gracefully', () => {
      const { getByText } = render(
        <TripDetailsHeader
          trip={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
          onBack={mockOnBack}
        />
      );
      
      expect(getByText('Untitled Trip')).toBeTruthy();
      expect(getByText('No location specified')).toBeTruthy();
    });
  });

  describe('TripDateDisplay', () => {
    it('renders without crashing', () => {
      const { getByText } = render(
        <TripDateDisplay trip={mockTrip} />
      );
      
      expect(getByText('Dec 15, 2024 - Dec 20, 2024 (6 days)')).toBeTruthy();
    });

    it('handles missing dates gracefully', () => {
      const tripWithoutDates = { ...mockTrip, startDate: null, endDate: null };
      const { getByText } = render(
        <TripDateDisplay trip={tripWithoutDates} />
      );
      
      expect(getByText('Dates not set')).toBeTruthy();
    });
  });

  describe('TripDescription', () => {
    it('renders description text', () => {
      const { getByText } = render(
        <TripDescription trip={mockTrip} />
      );
      
      expect(getByText('A wonderful trip to the City of Light with lots of sightseeing and delicious food.')).toBeTruthy();
    });

    it('shows empty state when no description', () => {
      const tripWithoutDescription = { ...mockTrip, description: '' };
      const { getByText } = render(
        <TripDescription trip={tripWithoutDescription} />
      );
      
      expect(getByText('No description added yet')).toBeTruthy();
    });
  });

  describe('TripStatistics', () => {
    it('renders without crashing', () => {
      const { getByText } = render(
        <TripStatistics trip={mockTrip} />
      );
      
      expect(getByText('Trip Statistics')).toBeTruthy();
      expect(getByText('Status')).toBeTruthy();
      expect(getByText('Progress')).toBeTruthy();
    });
  });

  describe('TripActionButtons', () => {
    it('renders without crashing', () => {
      const { getByText } = render(
        <TripActionButtons
          trip={mockTrip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );
      
      expect(getByText('✏️ Edit Trip')).toBeTruthy();
      expect(getByText('🗑️ Delete Trip')).toBeTruthy();
      expect(getByText('📤 Share Trip')).toBeTruthy();
    });

    it('handles missing trip data gracefully', () => {
      const { getByText } = render(
        <TripActionButtons
          trip={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );
      
      // Buttons should be disabled but still rendered
      expect(getByText('✏️ Edit Trip')).toBeTruthy();
      expect(getByText('🗑️ Delete Trip')).toBeTruthy();
      expect(getByText('📤 Share Trip')).toBeTruthy();
    });
  });
});
