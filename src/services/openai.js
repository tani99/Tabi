import OpenAI from 'openai';
import { openaiConfig, validateOpenAIConfig } from '../config/openai';
import { getUserFriendlyError } from '../utils/errorMessages';
import { createTripPlanningPrompt, createActivitySuggestionPrompt, validatePromptInput } from '../utils/aiPromptTemplates';
import { parseTripPlanningResponse } from '../utils/tripDataParser';

// Initialize OpenAI client
let openaiClient = null;

// Initialize the OpenAI client if configuration is valid
const initializeOpenAIClient = () => {
  const configValidation = validateOpenAIConfig();
  
  if (!configValidation.valid) {
    console.warn('OpenAI: Configuration invalid -', configValidation.error);
    return null;
  }
  
  try {
    openaiClient = new OpenAI({
      apiKey: openaiConfig.apiKey,
      baseURL: openaiConfig.baseURL,
      timeout: openaiConfig.timeout,
      dangerouslyAllowBrowser: true // Required for React Native/browser environments
    });
    
    console.log('OpenAI: Client initialized successfully');
    return openaiClient;
  } catch (error) {
    console.error('OpenAI: Failed to initialize client -', error.message);
    return null;
  }
};

// Get OpenAI client, initializing if needed
const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = initializeOpenAIClient();
  }
  return openaiClient;
};

/**
 * Test OpenAI API connectivity
 * Simple function to verify that we can successfully communicate with OpenAI API
 */
export const testOpenAIConnection = async () => {
  try {
    console.log('OpenAI: Testing API connection...');
    
    // Check if OpenAI is configured
    const configValidation = validateOpenAIConfig();
    if (!configValidation.valid) {
      return {
        success: false,
        error: configValidation.error,
        code: 'configuration-invalid'
      };
    }
    
    // Get OpenAI client
    const client = getOpenAIClient();
    if (!client) {
      return {
        success: false,
        error: 'Failed to initialize OpenAI client',
        code: 'client-initialization-failed'
      };
    }
    
    // Make a simple test API call
    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with exactly: 'Connection test successful'"
        },
        {
          role: "user",
          content: "Test connection"
        }
      ],
      max_tokens: 10,
      temperature: 0
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log('OpenAI: Connection test successful', {
      model: response.model,
      responseTime: `${responseTime}ms`,
      usage: response.usage
    });
    
    return {
      success: true,
      data: {
        message: response.choices[0]?.message?.content || 'Test completed',
        model: response.model,
        responseTime,
        usage: response.usage,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('OpenAI: Connection test failed -', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });
    
    return {
      success: false,
      error: getUserFriendlyError(error, 'ai-connection-test'),
      originalError: error.message,
      code: error.code || 'unknown-error'
    };
  }
};

/**
 * Check if OpenAI service is available and configured
 */
export const isOpenAIAvailable = () => {
  const configValidation = validateOpenAIConfig();
  return {
    available: configValidation.valid && openaiConfig.enabled,
    reason: configValidation.valid ? null : configValidation.error
  };
};

/**
 * Get OpenAI service status information
 */
export const getOpenAIStatus = () => {
  const configValidation = validateOpenAIConfig();
  const availability = isOpenAIAvailable();
  
  return {
    configured: configValidation.valid,
    enabled: openaiConfig.enabled,
    available: availability.available,
    model: openaiConfig.model,
    maxTokens: openaiConfig.maxTokens,
    temperature: openaiConfig.temperature,
    error: availability.reason
  };
};

/**
 * Generate a trip plan from user input
 * @param {string} userInput - User's trip planning request
 * @param {Object} options - Additional options for trip planning
 * @returns {Object} - Success/error result with parsed trip data
 */
export const generateTripPlan = async (userInput, options = {}) => {
  try {
    console.log('OpenAI: Starting trip plan generation...', { userInput: userInput.substring(0, 100) });
    
    // Validate input
    const inputValidation = validatePromptInput(userInput);
    if (!inputValidation.valid) {
      return {
        success: false,
        error: inputValidation.error,
        code: 'invalid-input'
      };
    }

    // Check if OpenAI is available
    const availability = isOpenAIAvailable();
    if (!availability.available) {
      return {
        success: false,
        error: availability.reason,
        code: 'service-unavailable'
      };
    }

    // Get OpenAI client
    const client = getOpenAIClient();
    if (!client) {
      return {
        success: false,
        error: 'Failed to initialize OpenAI client',
        code: 'client-initialization-failed'
      };
    }

    // Create prompt
    const prompt = createTripPlanningPrompt(inputValidation.sanitizedInput, options);
    
    // Make API call
    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: openaiConfig.model,
      ...prompt,
      max_tokens: openaiConfig.maxTokens
    });

    const responseTime = Date.now() - startTime;
    console.log('OpenAI: Trip planning response received', {
      responseTime: `${responseTime}ms`,
      usage: response.usage
    });

    // Parse response
    const aiContent = response.choices[0]?.message?.content;
    if (!aiContent) {
      return {
        success: false,
        error: 'Empty response from AI service',
        code: 'empty-response'
      };
    }

    // Parse and validate the AI response
    const parseResult = parseTripPlanningResponse(aiContent);
    if (!parseResult.success) {
      console.error('OpenAI: Failed to parse trip planning response', {
        error: parseResult.error,
        originalResponse: aiContent.substring(0, 200)
      });
      
      return {
        success: false,
        error: `Failed to parse AI response: ${parseResult.error}`,
        code: 'parsing-failed',
        originalError: parseResult.originalError
      };
    }

    console.log('OpenAI: Trip planning completed successfully', {
      tripName: parseResult.data.trip.name,
      hasItinerary: !!parseResult.data.itinerary
    });

    return {
      success: true,
      data: {
        ...parseResult.data,
        metadata: {
          ...parseResult.data.metadata,
          responseTime,
          usage: response.usage,
          model: response.model,
          requestId: response.id
        }
      }
    };

  } catch (error) {
    console.error('OpenAI: Trip planning failed', {
      message: error.message,
      code: error.code,
      status: error.status
    });

    return {
      success: false,
      error: getUserFriendlyError(error, 'ai-trip-planning'),
      originalError: error.message,
      code: error.code || 'unknown-error'
    };
  }
};

/**
 * Generate activity suggestions for an existing trip
 * @param {Object} tripData - Existing trip data
 * @param {string} activityRequest - Specific activity request
 * @returns {Object} - Success/error result with activity suggestions
 */
export const generateActivitySuggestions = async (tripData, activityRequest) => {
  try {
    console.log('OpenAI: Generating activity suggestions...', { 
      location: tripData.location,
      request: activityRequest.substring(0, 50)
    });

    // Validate inputs
    const inputValidation = validatePromptInput(activityRequest);
    if (!inputValidation.valid) {
      return {
        success: false,
        error: inputValidation.error,
        code: 'invalid-input'
      };
    }

    if (!tripData || !tripData.location) {
      return {
        success: false,
        error: 'Valid trip data with location is required',
        code: 'invalid-trip-data'
      };
    }

    // Check availability
    const availability = isOpenAIAvailable();
    if (!availability.available) {
      return {
        success: false,
        error: availability.reason,
        code: 'service-unavailable'
      };
    }

    // Get client and create prompt
    const client = getOpenAIClient();
    if (!client) {
      return {
        success: false,
        error: 'Failed to initialize OpenAI client',
        code: 'client-initialization-failed'
      };
    }

    const prompt = createActivitySuggestionPrompt(tripData, inputValidation.sanitizedInput);
    
    // Make API call
    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: openaiConfig.model,
      ...prompt
    });

    const responseTime = Date.now() - startTime;
    
    // Parse response
    const aiContent = response.choices[0]?.message?.content;
    if (!aiContent) {
      return {
        success: false,
        error: 'Empty response from AI service',
        code: 'empty-response'
      };
    }

    let parsedActivities;
    try {
      parsedActivities = JSON.parse(aiContent);
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to parse activity suggestions',
        code: 'parsing-failed'
      };
    }

    console.log('OpenAI: Activity suggestions generated successfully', {
      activityCount: parsedActivities.activities?.length || 0
    });

    return {
      success: true,
      data: {
        activities: parsedActivities.activities || [],
        metadata: {
          responseTime,
          usage: response.usage,
          model: response.model,
          requestId: response.id,
          generatedAt: new Date().toISOString()
        }
      }
    };

  } catch (error) {
    console.error('OpenAI: Activity suggestion failed', {
      message: error.message,
      code: error.code
    });

    return {
      success: false,
      error: getUserFriendlyError(error, 'ai-activity-suggestions'),
      originalError: error.message,
      code: error.code || 'unknown-error'
    };
  }
};

export default {
  testConnection: testOpenAIConnection,
  isAvailable: isOpenAIAvailable,
  getStatus: getOpenAIStatus,
  generateTripPlan,
  generateActivitySuggestions
};
