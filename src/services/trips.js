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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TRIP_STATUS, TRIP_VALIDATION, DEFAULT_TRIP, inferTripStatus } from '../utils/tripConstants';
import { initializeItineraryForTrip } from './itinerary';

// Collection name for trips
const TRIPS_COLLECTION = 'trips';

/**
 * Validate trip data against defined rules
 */
const validateTripData = (tripData, isUpdate = false) => {
  const errors = [];

  // For updates, only validate provided fields
  const fieldsToValidate = isUpdate ? Object.keys(tripData) : Object.keys(TRIP_VALIDATION);

  fieldsToValidate.forEach(field => {
    const validation = TRIP_VALIDATION[field];
    if (!validation) return;

    const value = tripData[field];

    // Check required fields
    if (validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(`${field} is required`);
      return;
    }

    // Skip validation for empty optional fields
    if (!validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return;
    }

    // Check string length constraints
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`${field} must be at least ${validation.minLength} characters`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`${field} must be no more than ${validation.maxLength} characters`);
      }
    }

    // Check date constraints
    if (field === 'startDate' || field === 'endDate') {
      if (value && !(value instanceof Date)) {
        errors.push(`${field} must be a valid Date object`);
      }
    }

    // Check date range logic
    if (field === 'endDate' && tripData.startDate && value) {
      if (value <= tripData.startDate) {
        errors.push('End date must be after start date');
      }
    }
  });

  return errors;
};

/**
 * Convert Firestore timestamp to Date object
 */
const convertTimestamps = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    startDate: data.startDate?.toDate() || null,
    endDate: data.endDate?.toDate() || null,
    createdAt: data.createdAt?.toDate() || null,
    updatedAt: data.updatedAt?.toDate() || null
  };
};

/**
 * Create a new trip
 */
export const createTrip = async (tripData, userId) => {
  try {
    console.log('Creating trip for user:', userId);

    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Merge with default values
    const tripToCreate = {
      ...DEFAULT_TRIP,
      ...tripData,
      userId
    };

    // Validate trip data
    const validationErrors = validateTripData(tripToCreate);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Infer status based on dates
    const inferredStatus = inferTripStatus(tripToCreate.startDate, tripToCreate.endDate);

    // Add timestamps and inferred status
    const tripWithTimestamps = {
      ...tripToCreate,
      status: inferredStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Create the trip in Firestore
    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), tripWithTimestamps);
    
    console.log('Trip created successfully with ID:', docRef.id);
    
    // Initialize itinerary for the newly created trip
    try {
      await initializeItineraryForTrip(docRef.id, userId, tripToCreate.startDate, tripToCreate.endDate);
      console.log('Itinerary initialized successfully for trip:', docRef.id);
    } catch (itineraryError) {
      console.error('Error initializing itinerary for trip:', itineraryError);
      // Don't fail the trip creation if itinerary initialization fails
      // The itinerary can be created later when needed
    }
    
    return docRef.id;

  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

/**
 * Get a specific trip by ID
 */
export const getTrip = async (tripId, userId) => {
  try {
    console.log('Getting trip:', tripId, 'for user:', userId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get the trip document
    const tripDoc = await getDoc(doc(db, TRIPS_COLLECTION, tripId));
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }

    const tripData = convertTimestamps(tripDoc);

    // Check access control
    if (tripData.userId !== userId) {
      throw new Error('Access denied');
    }

    console.log('Trip retrieved successfully');
    return tripData;

  } catch (error) {
    console.error('Error getting trip:', error);
    throw error;
  }
};

/**
 * Get all trips for a user
 */
export const getUserTrips = async (userId) => {
  try {
    console.log('Getting trips for user:', userId);

    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Query trips for the specific user, ordered by creation date
    const tripsQuery = query(
      collection(db, TRIPS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(tripsQuery);
    
    const trips = querySnapshot.docs.map(doc => convertTimestamps(doc));
    
    console.log(`Retrieved ${trips.length} trips for user`);
    return trips;

  } catch (error) {
    console.error('Error getting user trips:', error);
    throw error;
  }
};

/**
 * Update a trip
 */
export const updateTrip = async (tripId, updateData, userId) => {
  try {
    console.log('Updating trip:', tripId, 'for user:', userId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data is required');
    }

    // First, get the existing trip to check access control
    const existingTrip = await getTrip(tripId, userId);

    // Validate update data
    const validationErrors = validateTripData(updateData, true);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Prepare update data with timestamp
    let updateWithTimestamp = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    // If dates are being updated, re-infer the status
    if (updateData.startDate || updateData.endDate) {
      const currentTrip = { ...existingTrip, ...updateData };
      const inferredStatus = inferTripStatus(currentTrip.startDate, currentTrip.endDate);
      updateWithTimestamp.status = inferredStatus;
    }

    // Update the trip
    await updateDoc(doc(db, TRIPS_COLLECTION, tripId), updateWithTimestamp);
    
    console.log('Trip updated successfully');
    return true;

  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

/**
 * Delete a trip
 */
export const deleteTrip = async (tripId, userId) => {
  try {
    console.log('Deleting trip:', tripId, 'for user:', userId);

    // Validate inputs
    if (!tripId) {
      throw new Error('Trip ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    // First, get the trip to check access control
    await getTrip(tripId, userId);

    // Delete the trip
    await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));
    
    console.log('Trip deleted successfully');
    return true;

  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};



/**
 * Search trips by name or location
 */
export const searchTrips = async (userId, searchTerm) => {
  try {
    console.log('Searching trips for term:', searchTerm, 'for user:', userId);

    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!searchTerm || searchTerm.trim() === '') {
      throw new Error('Search term is required');
    }

    // Get all user trips and filter client-side
    // Note: Firestore doesn't support full-text search, so we filter in memory
    const allTrips = await getUserTrips(userId);
    
    const searchLower = searchTerm.toLowerCase();
    const filteredTrips = allTrips.filter(trip => 
      trip.name.toLowerCase().includes(searchLower) ||
      trip.location.toLowerCase().includes(searchLower) ||
      (trip.description && trip.description.toLowerCase().includes(searchLower))
    );
    
    console.log(`Found ${filteredTrips.length} trips matching "${searchTerm}"`);
    return filteredTrips;

  } catch (error) {
    console.error('Error searching trips:', error);
    throw error;
  }
};
