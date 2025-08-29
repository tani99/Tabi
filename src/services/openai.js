import OpenAI from 'openai';
import { openaiConfig, validateOpenAIConfig } from '../config/openai';
import { getUserFriendlyError } from '../utils/errorMessages';

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

export default {
  testConnection: testOpenAIConnection,
  isAvailable: isOpenAIAvailable,
  getStatus: getOpenAIStatus
};
