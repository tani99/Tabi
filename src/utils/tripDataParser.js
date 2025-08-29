/**
 * Trip Data Parser for AI Responses
 * 
 * This module handles parsing and validation of AI-generated trip data,
 * converting it to match Tabi's data models and validation requirements.
 */

import { TRIP_VALIDATION, TRIP_MODEL } from './tripConstants';

/**
 * Parse AI response into valid trip data
 * @param {string} aiResponse - Raw AI response string
 * @returns {Object} - Parsed and validated trip data
 */
export const parseTripPlanningResponse = (aiResponse) => {
  try {
    // Step 1: Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (parseError) {
      return {
        success: false,
        error: 'Invalid JSON response from AI',
        originalError: parseError.message
      };
    }

    // Step 2: Validate structure
    const structureValidation = validateResponseStructure(parsedData);
    if (!structureValidation.valid) {
      return {
        success: false,
        error: structureValidation.error,
        partialData: structureValidation.partialData
      };
    }

    // Step 3: Parse and validate trip data
    const tripParseResult = parseTripData(parsedData.trip);
    if (!tripParseResult.success) {
      return {
        success: false,
        error: `Trip data validation failed: ${tripParseResult.error}`,
        originalData: parsedData
      };
    }

    // Step 4: Parse itinerary if present
    let itineraryData = null;
    if (parsedData.itinerary) {
      const itineraryParseResult = parseItineraryData(parsedData.itinerary, tripParseResult.data);
      if (!itineraryParseResult.success) {
        // Allow trip without itinerary if itinerary parsing fails
        console.warn('Itinerary parsing failed, proceeding with trip data only:', itineraryParseResult.error);
      } else {
        itineraryData = itineraryParseResult.data;
      }
    }

    return {
      success: true,
      data: {
        trip: tripParseResult.data,
        itinerary: itineraryData,
        metadata: {
          parsedAt: new Date().toISOString(),
          aiGenerated: true,
          hasItinerary: !!itineraryData
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      error: 'Unexpected error parsing AI response',
      originalError: error.message
    };
  }
};

/**
 * Validate the basic structure of AI response
 * @param {Object} data - Parsed AI response
 * @returns {Object} - Validation result
 */
const validateResponseStructure = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: 'Response must be a valid object'
    };
  }

  if (!data.trip || typeof data.trip !== 'object') {
    return {
      valid: false,
      error: 'Response must contain a "trip" object'
    };
  }

  return {
    valid: true,
    partialData: data
  };
};

/**
 * Parse and validate trip data against Tabi requirements
 * @param {Object} tripData - Trip data from AI response
 * @returns {Object} - Parsed trip data or error
 */
const parseTripData = (tripData) => {
  const errors = [];
  const parsedTrip = { ...TRIP_MODEL };

  // Validate and parse name
  if (!tripData.name || typeof tripData.name !== 'string') {
    errors.push('Trip name is required');
  } else {
    const name = tripData.name.trim();
    if (name.length < TRIP_VALIDATION.name.minLength || name.length > TRIP_VALIDATION.name.maxLength) {
      errors.push(`Trip name must be ${TRIP_VALIDATION.name.minLength}-${TRIP_VALIDATION.name.maxLength} characters`);
    } else {
      parsedTrip.name = name;
    }
  }

  // Validate and parse location
  if (!tripData.location || typeof tripData.location !== 'string') {
    errors.push('Trip location is required');
  } else {
    const location = tripData.location.trim();
    if (location.length < TRIP_VALIDATION.location.minLength || location.length > TRIP_VALIDATION.location.maxLength) {
      errors.push(`Location must be ${TRIP_VALIDATION.location.minLength}-${TRIP_VALIDATION.location.maxLength} characters`);
    } else {
      parsedTrip.location = location;
    }
  }

  // Validate and parse dates
  const dateParseResult = parseDateFields(tripData);
  if (!dateParseResult.success) {
    errors.push(dateParseResult.error);
  } else {
    parsedTrip.startDate = dateParseResult.startDate;
    parsedTrip.endDate = dateParseResult.endDate;
  }

  // Parse optional description
  if (tripData.description && typeof tripData.description === 'string') {
    const description = tripData.description.trim();
    if (description.length > TRIP_VALIDATION.description.maxLength) {
      parsedTrip.description = description.substring(0, TRIP_VALIDATION.description.maxLength);
    } else {
      parsedTrip.description = description;
    }
  }

  // Add AI-specific metadata
  parsedTrip.aiGenerated = true;
  parsedTrip.aiPrompt = tripData.aiPrompt || '';
  parsedTrip.generatedAt = tripData.generatedAt || new Date().toISOString();

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('; '),
      partialData: parsedTrip
    };
  }

  return {
    success: true,
    data: parsedTrip
  };
};

/**
 * Parse and validate date fields
 * @param {Object} tripData - Trip data containing date fields
 * @returns {Object} - Parsed dates or error
 */
const parseDateFields = (tripData) => {
  // Parse start date
  if (!tripData.startDate) {
    return { success: false, error: 'Start date is required' };
  }

  const startDate = new Date(tripData.startDate);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: 'Invalid start date format' };
  }

  // Parse end date
  if (!tripData.endDate) {
    return { success: false, error: 'End date is required' };
  }

  const endDate = new Date(tripData.endDate);
  if (isNaN(endDate.getTime())) {
    return { success: false, error: 'Invalid end date format' };
  }

  // Validate date logic
  if (startDate > endDate) {
    return { success: false, error: 'Start date must be before or equal to end date' };
  }

  // Check for reasonable date range (not too far in future/past)
  const now = new Date();
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  if (startDate > oneYearFromNow) {
    return { success: false, error: 'Start date cannot be more than one year in the future' };
  }

  if (endDate < oneYearAgo) {
    return { success: false, error: 'End date cannot be more than one year in the past' };
  }

  return {
    success: true,
    startDate: startDate,
    endDate: endDate
  };
};

/**
 * Parse itinerary data from AI response
 * @param {Object} itineraryData - Itinerary data from AI response
 * @param {Object} tripData - Associated trip data for validation
 * @returns {Object} - Parsed itinerary or error
 */
const parseItineraryData = (itineraryData, tripData) => {
  if (!itineraryData || typeof itineraryData !== 'object') {
    return {
      success: false,
      error: 'Itinerary must be an object'
    };
  }

  const parsedItinerary = {};
  const errors = [];

  // Calculate expected number of days
  const startDate = new Date(tripData.startDate);
  const endDate = new Date(tripData.endDate);
  const expectedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  // Parse each day
  for (let dayNum = 1; dayNum <= expectedDays; dayNum++) {
    const dayKey = `day_${dayNum}`;
    
    if (itineraryData[dayKey]) {
      const dayParseResult = parseDayActivities(itineraryData[dayKey], dayNum);
      if (dayParseResult.success) {
        parsedItinerary[dayKey] = dayParseResult.data;
      } else {
        errors.push(`Day ${dayNum}: ${dayParseResult.error}`);
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('; '),
      partialData: parsedItinerary
    };
  }

  return {
    success: true,
    data: parsedItinerary
  };
};

/**
 * Parse activities for a specific day
 * @param {Array} activities - Array of activity objects
 * @param {number} dayNumber - Day number for error reporting
 * @returns {Object} - Parsed activities or error
 */
const parseDayActivities = (activities, dayNumber) => {
  if (!Array.isArray(activities)) {
    return {
      success: false,
      error: `Day ${dayNumber} activities must be an array`
    };
  }

  const parsedActivities = [];
  const errors = [];

  activities.forEach((activity, index) => {
    const activityParseResult = parseActivity(activity);
    if (activityParseResult.success) {
      parsedActivities.push(activityParseResult.data);
    } else {
      errors.push(`Activity ${index + 1}: ${activityParseResult.error}`);
    }
  });

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('; '),
      partialData: parsedActivities
    };
  }

  return {
    success: true,
    data: parsedActivities
  };
};

/**
 * Parse and validate individual activity
 * @param {Object} activity - Activity object from AI response
 * @returns {Object} - Parsed activity or error
 */
const parseActivity = (activity) => {
  if (!activity || typeof activity !== 'object') {
    return {
      success: false,
      error: 'Activity must be an object'
    };
  }

  const errors = [];
  const parsedActivity = {};

  // Validate title
  if (!activity.title || typeof activity.title !== 'string') {
    errors.push('Activity title is required');
  } else {
    const title = activity.title.trim();
    if (title.length < 1 || title.length > 100) {
      errors.push('Activity title must be 1-100 characters');
    } else {
      parsedActivity.title = title;
    }
  }

  // Validate description
  if (!activity.description || typeof activity.description !== 'string') {
    errors.push('Activity description is required');
  } else {
    const description = activity.description.trim();
    if (description.length < 1 || description.length > 300) {
      errors.push('Activity description must be 1-300 characters');
    } else {
      parsedActivity.description = description;
    }
  }

  // Validate times
  const timeParseResult = parseActivityTimes(activity);
  if (!timeParseResult.success) {
    errors.push(timeParseResult.error);
  } else {
    parsedActivity.startTime = timeParseResult.startTime;
    parsedActivity.endTime = timeParseResult.endTime;
  }

  // Validate location
  if (activity.location && typeof activity.location === 'string') {
    parsedActivity.location = activity.location.trim();
  }

  // Validate category
  const validCategories = ['sightseeing', 'dining', 'shopping', 'transportation', 'accommodation'];
  if (activity.category && validCategories.includes(activity.category)) {
    parsedActivity.category = activity.category;
  } else {
    parsedActivity.category = 'sightseeing'; // Default category
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('; ')
    };
  }

  return {
    success: true,
    data: parsedActivity
  };
};

/**
 * Parse and validate activity times
 * @param {Object} activity - Activity with time fields
 * @returns {Object} - Parsed times or error
 */
const parseActivityTimes = (activity) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  // Validate start time
  if (!activity.startTime || !timeRegex.test(activity.startTime)) {
    return {
      success: false,
      error: 'Invalid start time format (expected HH:MM)'
    };
  }

  // Validate end time
  if (!activity.endTime || !timeRegex.test(activity.endTime)) {
    return {
      success: false,
      error: 'Invalid end time format (expected HH:MM)'
    };
  }

  // Validate time logic
  const [startHour, startMin] = activity.startTime.split(':').map(Number);
  const [endHour, endMin] = activity.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (startMinutes >= endMinutes) {
    return {
      success: false,
      error: 'Start time must be before end time'
    };
  }

  return {
    success: true,
    startTime: activity.startTime,
    endTime: activity.endTime
  };
};

/**
 * Clean and sanitize text content from AI responses
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized text
 */
export const sanitizeAIText = (text, maxLength = 500) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove any potentially harmful content
  let sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .trim();

  // Truncate if necessary
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
    // Try to end at a word boundary
    const lastSpace = sanitized.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      sanitized = sanitized.substring(0, lastSpace);
    }
  }

  return sanitized;
};

export default {
  parseTripPlanningResponse,
  sanitizeAIText
};
