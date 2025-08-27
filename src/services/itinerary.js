import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { calculateTripDays } from '../utils/tripConstants';

// Collection names
const ITINERARIES_COLLECTION = 'itineraries';

/**
 * Convert Firestore timestamp to Date object
 */
const convertTimestamps = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    days: data.days || [], // Ensure days is always an array
    createdAt: data.createdAt?.toDate() || null,
    updatedAt: data.updatedAt?.toDate() || null
  };
};

/**
 * Create or get itinerary for a trip
 */
export const getOrCreateItinerary = async (tripId, userId) => {
  try {
    console.log('Getting or creating itinerary for trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if itinerary exists
    const itineraryQuery = query(
      collection(db, ITINERARIES_COLLECTION),
      where('tripId', '==', tripId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(itineraryQuery);
    
    if (!querySnapshot.empty) {
      // Return existing itinerary
      const itineraryDoc = querySnapshot.docs[0];
      const itineraryData = convertTimestamps(itineraryDoc);
      
      // Ensure days array exists
      if (!itineraryData.days) {
        itineraryData.days = [];
      }
      
      return itineraryData;
    } else {
      // Create new itinerary
      const newItinerary = {
        tripId,
        userId,
        title: `Itinerary for Trip ${tripId}`,
        days: [], // Array to store day objects
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          timeZone: 'UTC',
          defaultStartTime: '09:00',
          defaultEndTime: '17:00',
          timeSlotDuration: 30,
          allowOverlapping: false,
          autoCalculateTravelTime: true
        }
      };

      const docRef = await addDoc(collection(db, ITINERARIES_COLLECTION), newItinerary);
      
      console.log('Created new itinerary with ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newItinerary,
        days: []
      };
    }

  } catch (error) {
    console.error('Error getting or creating itinerary:', error);
    throw error;
  }
};

/**
 * Add a new day to an itinerary
 */
export const addDayToItinerary = async (tripId, userId, dayData = {}) => {
  try {
    console.log('Adding day to itinerary for trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get or create itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }

    // Create new day object
    const newDay = {
      id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      date: dayData.date || null,
      weather: dayData.weather || null,
      activities: dayData.activities || [],
      notes: dayData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add day to the itinerary's days array
    const updatedDays = [...itinerary.days, newDay];
    
    // Update the itinerary document
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: updatedDays,
      updatedAt: serverTimestamp()
    });
    
    console.log('Added day with ID:', newDay.id);
    
    return newDay;

  } catch (error) {
    console.error('Error adding day to itinerary:', error);
    throw error;
  }
};

/**
 * Get a specific day from an itinerary by index
 */
export const getDay = async (tripId, userId, dayIndex) => {
  try {
    console.log('Getting day at index', dayIndex, 'from trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (dayIndex < 0) {
      throw new Error('Day index must be non-negative');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }

    // Check if day index exists
    if (dayIndex >= itinerary.days.length) {
      return null; // Day doesn't exist
    }

    return itinerary.days[dayIndex];

  } catch (error) {
    console.error('Error getting day:', error);
    throw error;
  }
};

/**
 * Update a day in an itinerary
 */
export const updateDay = async (tripId, userId, dayIndex, updateData) => {
  try {
    console.log('Updating day at index', dayIndex, 'in trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (dayIndex < 0) {
      throw new Error('Day index must be non-negative');
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data is required');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }

    // Check if day index exists
    if (dayIndex >= itinerary.days.length) {
      throw new Error(`Day at index ${dayIndex} not found`);
    }

    // Update the specific day
    const updatedDays = [...itinerary.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      ...updateData,
      updatedAt: new Date()
    };

    // Update the itinerary document
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: updatedDays,
      updatedAt: serverTimestamp()
    });
    
    console.log('Day updated successfully');
    
    return updatedDays[dayIndex];

  } catch (error) {
    console.error('Error updating day:', error);
    throw error;
  }
};

/**
 * Delete a day from an itinerary
 */
export const deleteDay = async (tripId, userId, dayIndex) => {
  try {
    console.log('Deleting day at index', dayIndex, 'from trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (dayIndex < 0) {
      throw new Error('Day index must be non-negative');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }

    // Check if day index exists
    if (dayIndex >= itinerary.days.length) {
      throw new Error(`Day at index ${dayIndex} not found`);
    }

    // Remove the day from the array
    const updatedDays = itinerary.days.filter((_, index) => index !== dayIndex);

    // Update the itinerary document
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: updatedDays,
      updatedAt: serverTimestamp()
    });
    
    console.log('Day deleted successfully');
    return true;

  } catch (error) {
    console.error('Error deleting day:', error);
    throw error;
  }
};

/**
 * Get all days for a trip
 */
export const getTripDays = async (tripId, userId) => {
  try {
    console.log('Getting all days for trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);
    
    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }
    
    console.log(`Retrieved ${itinerary.days.length} days for trip`);
    return itinerary.days;

  } catch (error) {
    console.error('Error getting trip days:', error);
    throw error;
  }
};

/**
 * Reorder days in an itinerary
 */
export const reorderDays = async (tripId, userId, newOrder) => {
  try {
    console.log('Reordering days for trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!Array.isArray(newOrder)) {
      throw new Error('New order must be an array of day indices');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }

    // Validate that all indices in newOrder are valid
    const maxIndex = itinerary.days.length - 1;
    for (const index of newOrder) {
      if (index < 0 || index > maxIndex) {
        throw new Error(`Invalid day index: ${index}`);
      }
    }

    // Reorder the days array
    const reorderedDays = newOrder.map(index => itinerary.days[index]);

    // Update the itinerary document
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: reorderedDays,
      updatedAt: serverTimestamp()
    });
    
    console.log('Days reordered successfully');
    return reorderedDays;

  } catch (error) {
    console.error('Error reordering days:', error);
    throw error;
  }
};

/**
 * Add an activity to a specific day in an itinerary
 */
export const addActivityToDay = async (tripId, userId, dayIndex, activityData) => {
  try {
    console.log('Adding activity to day', dayIndex, 'in trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (typeof dayIndex !== 'number' || dayIndex < 0) {
      throw new Error('Valid day index is required');
    }
    if (!activityData || typeof activityData !== 'object') {
      throw new Error('Activity data is required');
    }

    // Validate required activity fields
    if (!activityData.title || !activityData.title.trim()) {
      throw new Error('Activity title is required');
    }
    if (!activityData.startTime || !activityData.endTime) {
      throw new Error('Activity start and end times are required');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }

    // Check if day index exists
    if (dayIndex >= itinerary.days.length) {
      throw new Error(`Day at index ${dayIndex} not found`);
    }

    // Create the activity object with proper ID and timestamps
    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: activityData.title.trim(),
      startTime: activityData.startTime instanceof Date ? activityData.startTime.toISOString() : activityData.startTime,
      endTime: activityData.endTime instanceof Date ? activityData.endTime.toISOString() : activityData.endTime,
      notes: activityData.notes ? activityData.notes.trim() : '',
      location: activityData.location || null,
      type: activityData.type || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update the specific day's activities array
    const updatedDays = [...itinerary.days];
    const currentDay = updatedDays[dayIndex];
    
    // Ensure activities array exists
    if (!currentDay.activities) {
      currentDay.activities = [];
    }

    // Add the new activity to the day's activities
    currentDay.activities = [...currentDay.activities, activity];
    currentDay.updatedAt = new Date().toISOString();

    // Update the itinerary document
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: updatedDays,
      updatedAt: serverTimestamp()
    });
    
    console.log('Activity added successfully with ID:', activity.id);
    
    return activity;

  } catch (error) {
    console.error('Error adding activity to day:', error);
    throw error;
  }
};

/**
 * Update an activity in a specific day
 */
export const updateActivityInDay = async (tripId, userId, dayIndex, activityId, updateData) => {
  try {
    console.log('Updating activity', activityId, 'in day', dayIndex, 'for trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (typeof dayIndex !== 'number' || dayIndex < 0) {
      throw new Error('Valid day index is required');
    }
    if (!activityId) {
      throw new Error('Activity ID is required');
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data is required');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      throw new Error('No days found in itinerary');
    }

    // Check if day index exists
    if (dayIndex >= itinerary.days.length) {
      throw new Error(`Day at index ${dayIndex} not found`);
    }

    // Update the specific day's activity
    const updatedDays = [...itinerary.days];
    const currentDay = updatedDays[dayIndex];
    
    // Ensure activities array exists
    if (!currentDay.activities) {
      throw new Error('No activities found for this day');
    }

    // Find and update the activity
    const activityIndex = currentDay.activities.findIndex(activity => activity.id === activityId);
    if (activityIndex === -1) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    // Update the activity
    currentDay.activities[activityIndex] = {
      ...currentDay.activities[activityIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    currentDay.updatedAt = new Date().toISOString();

    // Update the itinerary document
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: updatedDays,
      updatedAt: serverTimestamp()
    });
    
    console.log('Activity updated successfully');
    
    return currentDay.activities[activityIndex];

  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

/**
 * Delete an activity from a specific day
 */
export const deleteActivityFromDay = async (tripId, userId, dayIndex, activityId) => {
  try {
    console.log('Deleting activity', activityId, 'from day', dayIndex, 'in trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (typeof dayIndex !== 'number' || dayIndex < 0) {
      throw new Error('Valid day index is required');
    }
    if (!activityId) {
      throw new Error('Activity ID is required');
    }

    // Get itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      throw new Error('No days found in itinerary');
    }

    // Check if day index exists
    if (dayIndex >= itinerary.days.length) {
      throw new Error(`Day at index ${dayIndex} not found`);
    }

    // Update the specific day's activities
    const updatedDays = [...itinerary.days];
    const currentDay = updatedDays[dayIndex];
    
    // Ensure activities array exists
    if (!currentDay.activities) {
      throw new Error('No activities found for this day');
    }

    // Remove the activity
    const initialLength = currentDay.activities.length;
    currentDay.activities = currentDay.activities.filter(activity => activity.id !== activityId);
    
    if (currentDay.activities.length === initialLength) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    currentDay.updatedAt = new Date().toISOString();

    // Update the itinerary document
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: updatedDays,
      updatedAt: serverTimestamp()
    });
    
    console.log('Activity deleted successfully');
    
    return true;

  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

/**
 * Get activities for a specific day
 */
export const getDayActivities = async (tripId, userId, dayIndex) => {
  try {
    console.log('Getting activities for day', dayIndex, 'in trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (typeof dayIndex !== 'number' || dayIndex < 0) {
      throw new Error('Valid day index is required');
    }

    // Get the specific day
    const day = await getDay(tripId, userId, dayIndex);
    
    if (!day) {
      return [];
    }

    // Return activities array, ensuring it exists
    return day.activities || [];

  } catch (error) {
    console.error('Error getting day activities:', error);
    throw error;
  }
};

/**
 * Add multiple days to an itinerary (for initial setup)
 */
export const addMultipleDays = async (tripId, userId, startDay, endDay) => {
  try {
    console.log(`Adding days ${startDay} to ${endDay} for trip:`, tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!startDay || !endDay || startDay > endDay) {
      throw new Error('Valid start and end day numbers are required');
    }

    // Get or create itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // Ensure days array exists
    if (!itinerary.days) {
      itinerary.days = [];
    }

    // Calculate how many days to add
    const daysToAdd = endDay - startDay + 1;
    const currentDayCount = itinerary.days.length;
    
    // Create new days
    const newDays = [];
    for (let i = 0; i < daysToAdd; i++) {
      const dayNumber = startDay + i;
      
      // Check if day already exists (by checking if we have enough days)
      if (dayNumber <= currentDayCount) {
        continue; // Day already exists
      }
      
      const newDay = {
        id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: null,
        weather: null,
        activities: [],
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      newDays.push(newDay);
    }

    // Add new days to the itinerary
    if (newDays.length > 0) {
      const updatedDays = [...itinerary.days, ...newDays];
      
      await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
        days: updatedDays,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Added ${newDays.length} new days to itinerary`);
    } else {
      console.log('No new days to add');
    }

    return newDays;

  } catch (error) {
    console.error('Error adding multiple days:', error);
    throw error;
  }
};

/**
 * Initialize an itinerary for a newly created trip
 * This function creates an itinerary with the appropriate number of days based on trip dates
 */
export const initializeItineraryForTrip = async (tripId, userId, startDate, endDate) => {
  try {
    console.log('Initializing itinerary for trip:', tripId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    // Calculate the number of days for the trip
    const numberOfDays = calculateTripDays(startDate, endDate);
    
    console.log(`Trip has ${numberOfDays} days, creating itinerary...`);

    // Create or get the itinerary
    const itinerary = await getOrCreateItinerary(tripId, userId);

    // If itinerary already has days, don't reinitialize
    if (itinerary.days && itinerary.days.length > 0) {
      console.log('Itinerary already has days, skipping initialization');
      return itinerary;
    }

    // Create days with proper date assignments
    const newDays = [];
    for (let i = 0; i < numberOfDays; i++) {
      // Calculate the date for this day
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      
      const newDay = {
        id: `day_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        date: dayDate.toISOString().split('T')[0], // Store as YYYY-MM-DD format
        weather: null,
        activities: [],
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      newDays.push(newDay);
    }

    // Update the itinerary with the new days
    await updateDoc(doc(db, ITINERARIES_COLLECTION, itinerary.id), {
      days: newDays,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Successfully initialized itinerary with ${numberOfDays} days`);
    
    return {
      ...itinerary,
      days: newDays
    };

  } catch (error) {
    console.error('Error initializing itinerary for trip:', error);
    throw error;
  }
};
