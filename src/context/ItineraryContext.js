import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { colors } from '../theme/colors';
import { 
  getOrCreateItinerary, 
  addDayToItinerary, 
  getDay, 
  updateDay, 
  deleteDay, 
  getTripDays,
  addMultipleDays,
  reorderDays
} from '../services/itinerary';

const ItineraryContext = createContext();

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

export const ItineraryProvider = ({ children }) => {
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new day to the itinerary
  const addDay = useCallback(async (tripId, dayData = {}) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to add days');
    }

    setLoading(true);
    setError(null);

    try {
      // Add day to Firestore
      const newDay = await addDayToItinerary(tripId, user.uid, dayData);
      
      // Update local state
      setItinerary(prevItinerary => {
        if (!prevItinerary) {
          return {
            tripId,
            days: [newDay]
          };
        }

        return {
          ...prevItinerary,
          days: [...prevItinerary.days, newDay]
        };
      });

      return newDay;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Get itinerary for a trip
  const getItinerary = useCallback(async (tripId) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to get itinerary');
    }

    setLoading(true);
    setError(null);

    try {
      // Get itinerary from Firestore
      const itineraryData = await getOrCreateItinerary(tripId, user.uid);
      
      setItinerary(itineraryData);
      return itineraryData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Get a specific day by index
  const getDayData = useCallback(async (tripId, dayIndex) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to get day');
    }

    try {
      return await getDay(tripId, user.uid, dayIndex);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid]);

  // Update a day
  const updateDayData = useCallback(async (tripId, dayIndex, updateData) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to update day');
    }

    setLoading(true);
    setError(null);

    try {
      // Update day in Firestore
      const updatedDay = await updateDay(tripId, user.uid, dayIndex, updateData);
      
      // Update local state
      setItinerary(prevItinerary => {
        if (!prevItinerary) return prevItinerary;

        const updatedDays = [...prevItinerary.days];
        updatedDays[dayIndex] = updatedDay;

        return {
          ...prevItinerary,
          days: updatedDays
        };
      });

      return updatedDay;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Delete a day
  const deleteDayData = useCallback(async (tripId, dayIndex) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to delete day');
    }

    setLoading(true);
    setError(null);

    try {
      // Delete day from Firestore
      await deleteDay(tripId, user.uid, dayIndex);
      
      // Update local state
      setItinerary(prevItinerary => {
        if (!prevItinerary) return prevItinerary;

        const updatedDays = prevItinerary.days.filter((_, index) => index !== dayIndex);

        return {
          ...prevItinerary,
          days: updatedDays
        };
      });

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Get all days for a trip
  const getDays = useCallback(async (tripId) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to get days');
    }

    try {
      return await getTripDays(tripId, user.uid);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid]);

  // Add multiple days
  const addMultipleDaysData = useCallback(async (tripId, startDay, endDay) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to add days');
    }

    setLoading(true);
    setError(null);

    try {
      // Add days to Firestore
      const newDays = await addMultipleDays(tripId, user.uid, startDay, endDay);
      
      // Update local state
      setItinerary(prevItinerary => {
        if (!prevItinerary) {
          return {
            tripId,
            days: newDays
          };
        }

        return {
          ...prevItinerary,
          days: [...prevItinerary.days, ...newDays]
        };
      });

      return newDays;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Reorder days
  const reorderDaysData = useCallback(async (tripId, newOrder) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to reorder days');
    }

    setLoading(true);
    setError(null);

    try {
      // Reorder days in Firestore
      const reorderedDays = await reorderDays(tripId, user.uid, newOrder);
      
      // Update local state
      setItinerary(prevItinerary => {
        if (!prevItinerary) return prevItinerary;

        return {
          ...prevItinerary,
          days: reorderedDays
        };
      });

      return reorderedDays;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const value = {
    itinerary,
    loading,
    error,
    addDay,
    getItinerary,
    getDay: getDayData,
    updateDay: updateDayData,
    deleteDay: deleteDayData,
    getDays,
    addMultipleDays: addMultipleDaysData,
    reorderDays: reorderDaysData
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
};
