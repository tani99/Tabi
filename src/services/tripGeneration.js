/**
 * Trip Generation Service
 * 
 * Orchestrates AI response processing and trip data generation,
 * ensuring generated trips have all required fields and proper validation.
 */

import { parseTripPlanningResponse, sanitizeAIText } from '../utils/tripDataParser';
import { createTrip } from './trips';
import { initializeItineraryForTrip } from './itinerary';
import { TRIP_VALIDATION, TRIP_STATUS } from '../utils/tripConstants';

/**
 * Generate a complete trip from AI response
 * @param {string} aiResponse - Raw AI response JSON string
 * @param {string} userId - User ID for trip creation
 * @param {Object} options - Additional options for trip generation
 * @returns {Object} - Generation result with trip ID and data
 */
export const generateTripFromAI = async (aiResponse, userId, options = {}) => {
  try {
    console.log('TripGeneration: Starting trip generation from AI response');
    
    // Step 1: Parse and validate AI response
    const parseResult = parseTripPlanningResponse(aiResponse);
    if (!parseResult.success) {
      return {
        success: false,
        error: `Failed to parse AI response: ${parseResult.error}`,
        code: 'parsing-failed',
        details: parseResult
      };
    }

    console.log('TripGeneration: AI response parsed successfully');
    const { trip: tripData, itinerary: itineraryData, metadata } = parseResult.data;

    // Step 2: Enhance trip data with additional processing
    const enhancedTrip = await enhanceTripData(tripData, options);
    if (!enhancedTrip.success) {
      return {
        success: false,
        error: `Failed to enhance trip data: ${enhancedTrip.error}`,
        code: 'enhancement-failed',
        details: enhancedTrip
      };
    }

    // Step 3: Validate final trip data
    const validationResult = validateGeneratedTrip(enhancedTrip.data);
    if (!validationResult.success) {
      return {
        success: false,
        error: `Trip validation failed: ${validationResult.error}`,
        code: 'validation-failed',
        details: validationResult
      };
    }

    console.log('TripGeneration: Trip data validated successfully');

    // Step 4: Create the trip in the database
    const tripId = await createTrip(enhancedTrip.data, userId);
    
    console.log('TripGeneration: Trip created with ID:', tripId);

    // Step 5: Initialize activities if itinerary data exists
    let activitiesCreated = 0;
    if (itineraryData && Object.keys(itineraryData).length > 0) {
      try {
        const activityResult = await generateActivitiesFromItinerary(
          tripId, 
          userId, 
          itineraryData, 
          enhancedTrip.data
        );
        activitiesCreated = activityResult.activitiesCreated;
        console.log(`TripGeneration: ${activitiesCreated} activities created`);
      } catch (activityError) {
        console.warn('TripGeneration: Failed to create activities, but trip was created:', activityError);
        // Don't fail the overall operation if activities fail
      }
    }

    return {
      success: true,
      data: {
        tripId,
        trip: { ...enhancedTrip.data, id: tripId },
        activitiesCreated,
        metadata: {
          ...metadata,
          generatedAt: new Date().toISOString(),
          activitiesGenerated: activitiesCreated > 0
        }
      }
    };

  } catch (error) {
    console.error('TripGeneration: Unexpected error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during trip generation',
      code: 'unexpected-error',
      originalError: error.message
    };
  }
};

/**
 * Enhance trip data with additional processing and defaults
 * @param {Object} tripData - Parsed trip data from AI
 * @param {Object} options - Enhancement options
 * @returns {Object} - Enhanced trip data
 */
const enhanceTripData = async (tripData, options = {}) => {
  try {
    const enhanced = { ...tripData };

    // Sanitize text fields
    enhanced.name = sanitizeAIText(enhanced.name, TRIP_VALIDATION.name.maxLength);
    enhanced.location = sanitizeAIText(enhanced.location, TRIP_VALIDATION.location.maxLength);
    enhanced.description = sanitizeAIText(enhanced.description, TRIP_VALIDATION.description.maxLength);

    // Ensure required fields have fallbacks
    if (!enhanced.name || enhanced.name.trim() === '') {
      enhanced.name = generateFallbackTripName(enhanced.location, enhanced.startDate);
    }

    if (!enhanced.description || enhanced.description.trim() === '') {
      enhanced.description = generateFallbackDescription(enhanced.location, enhanced.startDate, enhanced.endDate);
    }

    // Add computed fields
    enhanced.duration = calculateTripDuration(enhanced.startDate, enhanced.endDate);
    enhanced.status = inferTripStatus(enhanced.startDate, enhanced.endDate);

    // Preserve AI metadata but remove fields that shouldn't be in Firestore
    enhanced.aiGenerated = true;
    enhanced.generatedAt = new Date().toISOString();
    
    // Clean up fields that shouldn't be saved
    delete enhanced.id;
    delete enhanced.userId;

    return {
      success: true,
      data: enhanced
    };

  } catch (error) {
    return {
      success: false,
      error: `Enhancement failed: ${error.message}`
    };
  }
};

/**
 * Validate generated trip data against business rules
 * @param {Object} tripData - Trip data to validate
 * @returns {Object} - Validation result
 */
const validateGeneratedTrip = (tripData) => {
  const errors = [];

  // Check required fields
  if (!tripData.name || tripData.name.trim() === '') {
    errors.push('Trip name is required');
  }

  if (!tripData.location || tripData.location.trim() === '') {
    errors.push('Trip location is required');
  }

  if (!tripData.startDate) {
    errors.push('Start date is required');
  }

  if (!tripData.endDate) {
    errors.push('End date is required');
  }

  // Validate dates
  if (tripData.startDate && tripData.endDate) {
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push('Invalid date format');
    } else if (startDate >= endDate) {
      errors.push('End date must be after start date');
    } else {
      // Check reasonable date range
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      if (startDate > oneYearFromNow) {
        errors.push('Start date cannot be more than one year in the future');
      }

      if (endDate < oneYearAgo) {
        errors.push('End date cannot be more than one year in the past');
      }
    }
  }

  // Validate text lengths
  if (tripData.name && tripData.name.length > TRIP_VALIDATION.name.maxLength) {
    errors.push(`Trip name must be ${TRIP_VALIDATION.name.maxLength} characters or less`);
  }

  if (tripData.location && tripData.location.length > TRIP_VALIDATION.location.maxLength) {
    errors.push(`Location must be ${TRIP_VALIDATION.location.maxLength} characters or less`);
  }

  if (tripData.description && tripData.description.length > TRIP_VALIDATION.description.maxLength) {
    errors.push(`Description must be ${TRIP_VALIDATION.description.maxLength} characters or less`);
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('; ')
    };
  }

  return {
    success: true
  };
};

/**
 * Generate activities from itinerary data
 * @param {string} tripId - Trip ID for activities
 * @param {string} userId - User ID
 * @param {Object} itineraryData - Parsed itinerary data
 * @param {Object} tripData - Trip data for context
 * @returns {Object} - Activities creation result
 */
const generateActivitiesFromItinerary = async (tripId, userId, itineraryData, tripData) => {
  try {
    console.log('TripGeneration: Generating activities from itinerary');
    
    let activitiesCreated = 0;
    const startDate = new Date(tripData.startDate);

    // Process each day's activities
    for (const [dayKey, activities] of Object.entries(itineraryData)) {
      if (!Array.isArray(activities)) continue;

      // Extract day number from key (e.g., "day_1" -> 1)
      const dayNumber = parseInt(dayKey.split('_')[1]);
      const activityDate = new Date(startDate);
      activityDate.setDate(startDate.getDate() + dayNumber - 1);

      for (const activity of activities) {
        try {
          const processedActivity = await processActivityForCreation(
            activity, 
            activityDate, 
            tripId, 
            userId
          );

          if (processedActivity.success) {
            activitiesCreated++;
          } else {
            console.warn(`Failed to create activity: ${processedActivity.error}`);
          }
        } catch (activityError) {
          console.warn(`Error processing activity:`, activityError);
        }
      }
    }

    return {
      success: true,
      activitiesCreated
    };

  } catch (error) {
    console.error('TripGeneration: Error generating activities:', error);
    return {
      success: false,
      error: error.message,
      activitiesCreated: 0
    };
  }
};

/**
 * Process and create individual activity
 * @param {Object} activity - Activity data from AI
 * @param {Date} date - Date for the activity
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID
 * @returns {Object} - Processing result
 */
const processActivityForCreation = async (activity, date, tripId, userId) => {
  try {
    // Create activity object compatible with the itinerary service
    const processedActivity = {
      title: sanitizeAIText(activity.title, 100),
      description: sanitizeAIText(activity.description, 300),
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location ? sanitizeAIText(activity.location, 200) : '',
      category: activity.category || 'sightseeing',
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      aiGenerated: true,
      createdAt: new Date().toISOString()
    };

    // Here you would typically call an activity creation service
    // For now, we'll simulate success since the actual activity service
    // would be implemented in a future step
    console.log('TripGeneration: Would create activity:', processedActivity.title);

    return {
      success: true,
      activity: processedActivity
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate fallback trip name if AI didn't provide one
 * @param {string} location - Trip location
 * @param {Date} startDate - Trip start date
 * @returns {string} - Generated trip name
 */
const generateFallbackTripName = (location, startDate) => {
  const year = new Date(startDate).getFullYear();
  const locationName = location ? location.split(',')[0].trim() : 'Adventure';
  return `${locationName} Trip ${year}`;
};

/**
 * Generate fallback description if AI didn't provide one
 * @param {string} location - Trip location
 * @param {Date} startDate - Trip start date
 * @param {Date} endDate - Trip end date
 * @returns {string} - Generated description
 */
const generateFallbackDescription = (location, startDate, endDate) => {
  const duration = calculateTripDuration(startDate, endDate);
  const locationName = location ? location.split(',')[0].trim() : 'an amazing destination';
  return `A ${duration}-day trip to ${locationName}, planned with AI assistance.`;
};

/**
 * Calculate trip duration in days
 * @param {Date} startDate - Trip start date
 * @param {Date} endDate - Trip end date
 * @returns {number} - Duration in days
 */
const calculateTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Infer trip status based on dates
 * @param {Date} startDate - Trip start date
 * @param {Date} endDate - Trip end date
 * @returns {string} - Trip status
 */
const inferTripStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < now) {
    return TRIP_STATUS.COMPLETED;
  } else if (start <= now && end >= now) {
    return TRIP_STATUS.ACTIVE;
  } else {
    return TRIP_STATUS.PLANNING;
  }
};

/**
 * Validate and process AI response for trip generation
 * @param {string} aiResponse - Raw AI response
 * @returns {Object} - Validation and processing result
 */
export const validateAIResponse = (aiResponse) => {
  try {
    // Basic JSON validation
    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (parseError) {
      return {
        success: false,
        error: 'Invalid JSON response from AI',
        code: 'invalid-json'
      };
    }

    // Structure validation
    if (!parsedData.trip) {
      return {
        success: false,
        error: 'Response missing required "trip" object',
        code: 'missing-trip-data'
      };
    }

    // Basic trip data validation
    const trip = parsedData.trip;
    if (!trip.name || !trip.location || !trip.startDate || !trip.endDate) {
      return {
        success: false,
        error: 'Trip data missing required fields (name, location, startDate, endDate)',
        code: 'missing-required-fields'
      };
    }

    return {
      success: true,
      data: parsedData
    };

  } catch (error) {
    return {
      success: false,
      error: 'Unexpected error validating AI response',
      code: 'validation-error',
      originalError: error.message
    };
  }
};

export default {
  generateTripFromAI,
  validateAIResponse
};
