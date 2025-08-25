import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ItineraryProvider, useItinerary } from '../ItineraryContext';

// Mock the AuthContext
jest.mock('../AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    isAuthenticated: true,
    loading: false,
  }),
}));

// Mock component to test the context
const TestComponent = ({ onItineraryChange }) => {
  const { itinerary, addDay, getItinerary } = useItinerary();
  
  React.useEffect(() => {
    if (onItineraryChange) {
      onItineraryChange(itinerary);
    }
  }, [itinerary, onItineraryChange]);

  return null;
};

describe('ItineraryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state', () => {
    let contextValue;
    
    render(
      <ItineraryProvider>
        <TestComponent 
          onItineraryChange={(itinerary) => {
            contextValue = itinerary;
          }}
        />
      </ItineraryProvider>
    );

    expect(contextValue).toBeNull();
  });

  it('can add a day to itinerary', async () => {
    let contextValue;
    let addDayFunction;
    
    const TestComponentWithActions = () => {
      const { itinerary, addDay } = useItinerary();
      
      React.useEffect(() => {
        contextValue = itinerary;
        addDayFunction = addDay;
      }, [itinerary, addDay]);

      return null;
    };

    render(
      <ItineraryProvider>
        <TestComponentWithActions />
      </ItineraryProvider>
    );

    // Add a day
    await act(async () => {
      await addDayFunction('trip-123', 1);
    });

    expect(contextValue).toBeTruthy();
    expect(contextValue.tripId).toBe('trip-123');
    expect(contextValue.days).toHaveLength(1);
    expect(contextValue.days[0].dayNumber).toBe(1);
  });

  it('can add multiple days to itinerary', async () => {
    let contextValue;
    let addDayFunction;
    
    const TestComponentWithActions = () => {
      const { itinerary, addDay } = useItinerary();
      
      React.useEffect(() => {
        contextValue = itinerary;
        addDayFunction = addDay;
      }, [itinerary, addDay]);

      return null;
    };

    render(
      <ItineraryProvider>
        <TestComponentWithActions />
      </ItineraryProvider>
    );

    // Add multiple days
    await act(async () => {
      await addDayFunction('trip-123', 1);
      await addDayFunction('trip-123', 3);
      await addDayFunction('trip-123', 2);
    });

    expect(contextValue).toBeTruthy();
    expect(contextValue.days).toHaveLength(3);
    expect(contextValue.days[0].dayNumber).toBe(1);
    expect(contextValue.days[1].dayNumber).toBe(2);
    expect(contextValue.days[2].dayNumber).toBe(3);
  });

  it('throws error when useItinerary is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useItinerary must be used within an ItineraryProvider');
    
    consoleSpy.mockRestore();
  });
});
