/**
 * AI Prompt Templates for Trip Planning
 * 
 * This module contains structured prompts for generating trip plans
 * that conform to Tabi's data models and validation requirements.
 */

import { TRIP_VALIDATION } from './tripConstants';

/**
 * Create a comprehensive trip planning prompt
 * @param {string} userInput - User's trip planning request
 * @param {Object} options - Additional options for prompt customization
 * @returns {Object} - OpenAI chat completion prompt structure
 */
export const createTripPlanningPrompt = (userInput, options = {}) => {
  const {
    includeItinerary = true,
    maxDays = 14,
    budget = null,
    travelStyle = null
  } = options;

  const systemPrompt = `You are a professional travel planning expert specializing in creating detailed, practical trip itineraries. Your task is to convert user requests into structured trip data that matches specific technical requirements.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no additional text, explanations, or markdown
2. All string fields must respect length limits strictly
3. Dates must be in YYYY-MM-DD format
4. Times must be in HH:MM format (24-hour)
5. All required fields must be present and non-empty

DATA VALIDATION RULES:
- Trip name: 1-${TRIP_VALIDATION.name.maxLength} characters
- Location: 1-${TRIP_VALIDATION.location.maxLength} characters  
- Description: max ${TRIP_VALIDATION.description.maxLength} characters
- Activity titles: 1-100 characters
- Activity descriptions: 1-300 characters
- Start date must be before or equal to end date
- Activity times must be logical (start < end)

TRAVEL PLANNING EXPERTISE:
- Suggest realistic travel times and locations
- Include diverse activity types (sightseeing, dining, culture, leisure)
- Consider local customs, opening hours, and practical logistics
- Balance busy days with relaxation time
- Suggest appropriate activity durations`;

  const userPrompt = `Plan a trip based on this request: "${userInput}"

${budget ? `Budget consideration: ${budget}` : ''}
${travelStyle ? `Travel style: ${travelStyle}` : ''}
${!includeItinerary ? 'Focus on basic trip information only - no detailed itinerary needed.' : ''}`;

  const formatInstructions = `Return ONLY this exact JSON structure with NO additional text:

{
  "trip": {
    "name": "Trip name (1-${TRIP_VALIDATION.name.maxLength} chars)",
    "location": "Primary destination (1-${TRIP_VALIDATION.location.maxLength} chars)",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD", 
    "description": "Brief trip overview (max ${TRIP_VALIDATION.description.maxLength} chars)",
    "aiGenerated": true,
    "aiPrompt": "${userInput.substring(0, 200)}...",
    "generatedAt": "${new Date().toISOString()}"
  }${includeItinerary ? `,
  "itinerary": {
    "day_1": [
      {
        "title": "Activity name",
        "description": "Activity details", 
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "location": "Specific location",
        "category": "sightseeing|dining|shopping|transportation|accommodation"
      }
    ]
  }` : ''}
}`;

  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
      { role: "system", content: formatInstructions }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: "json_object" }
  };
};

/**
 * Create a prompt for suggesting activities for an existing trip
 * @param {Object} tripData - Existing trip information
 * @param {string} activityRequest - Specific activity request
 * @returns {Object} - OpenAI chat completion prompt structure
 */
export const createActivitySuggestionPrompt = (tripData, activityRequest) => {
  const systemPrompt = `You are a local travel expert specializing in activity recommendations. Generate activity suggestions that fit within an existing trip plan.

REQUIREMENTS:
- Return ONLY valid JSON - no additional text
- Activities must be location-appropriate  
- Times must be realistic and non-overlapping
- Include practical details (duration, location, logistics)`;

  const userPrompt = `Trip details:
- Destination: ${tripData.location}
- Dates: ${tripData.startDate} to ${tripData.endDate}
- Trip type: ${tripData.description || 'General travel'}

Activity request: "${activityRequest}"

Suggest 3-5 specific activities that match this request.`;

  const formatInstructions = `Return ONLY this JSON structure:

{
  "activities": [
    {
      "title": "Activity name (1-100 chars)",
      "description": "Detailed description (1-300 chars)",
      "suggestedDuration": "X hours",
      "location": "Specific address or area",
      "category": "sightseeing|dining|shopping|transportation|accommodation",
      "estimatedCost": "Budget estimate",
      "bestTimeToVisit": "Morning|Afternoon|Evening|Anytime"
    }
  ]
}`;

  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
      { role: "system", content: formatInstructions }
    ],
    temperature: 0.8,
    max_tokens: 800,
    response_format: { type: "json_object" }
  };
};

/**
 * Create a prompt for destination-specific planning advice
 * @param {string} destination - Target destination
 * @param {Object} preferences - User preferences and requirements
 * @returns {Object} - OpenAI chat completion prompt structure
 */
export const createDestinationPlanningPrompt = (destination, preferences = {}) => {
  const {
    duration = null,
    interests = [],
    budget = null,
    season = null
  } = preferences;

  const systemPrompt = `You are a destination expert providing practical travel planning advice. Focus on actionable, location-specific information that helps users plan effectively.

REQUIREMENTS:
- Return ONLY valid JSON
- Provide specific, practical recommendations
- Include realistic timeframes and logistics
- Consider seasonal factors and local conditions`;

  const userPrompt = `Destination: ${destination}
${duration ? `Trip duration: ${duration}` : ''}
${interests.length ? `Interests: ${interests.join(', ')}` : ''}
${budget ? `Budget level: ${budget}` : ''}
${season ? `Travel season: ${season}` : ''}

Provide destination-specific planning advice.`;

  const formatInstructions = `Return ONLY this JSON structure:

{
  "destination": "${destination}",
  "overview": "Brief destination overview (max 200 chars)",
  "bestTimeToVisit": "Seasonal recommendations",
  "suggestedDuration": "Recommended trip length",
  "mustSeeAttractions": [
    "Top attraction 1",
    "Top attraction 2", 
    "Top attraction 3"
  ],
  "localTips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3"
  ],
  "budgetEstimate": {
    "daily": "Average daily cost estimate",
    "accommodation": "Accommodation price range",
    "food": "Food cost guidance"
  }
}`;

  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
      { role: "system", content: formatInstructions }
    ],
    temperature: 0.6,
    max_tokens: 700,
    response_format: { type: "json_object" }
  };
};

/**
 * Validate prompt input before sending to AI
 * @param {string} input - User input to validate
 * @returns {Object} - Validation result
 */
export const validatePromptInput = (input) => {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      error: 'Input is required and must be a string'
    };
  }

  const trimmedInput = input.trim();
  
  if (trimmedInput.length < 3) {
    return {
      valid: false,
      error: 'Input must be at least 3 characters long'
    };
  }

  if (trimmedInput.length > 500) {
    return {
      valid: false,
      error: 'Input must be less than 500 characters'
    };
  }

  return {
    valid: true,
    sanitizedInput: trimmedInput
  };
};

export default {
  createTripPlanningPrompt,
  createActivitySuggestionPrompt,
  createDestinationPlanningPrompt,
  validatePromptInput
};
