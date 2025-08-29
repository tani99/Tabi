/**
 * OpenAI Configuration Template
 * 
 * Copy this file to openai.js and add your actual OpenAI API key.
 * This template shows the expected configuration structure.
 */

// TODO: Replace with your OpenAI API key
// Get your API key from: https://platform.openai.com/api-keys
// IMPORTANT: Never commit your actual API key to version control!
const OPENAI_API_KEY = 'your_openai_api_key_here';

// OpenAI API Configuration
export const openaiConfig = {
  // API Authentication
  apiKey: OPENAI_API_KEY,
  
  // Model Configuration
  model: 'gpt-4', // Using GPT-4 for better planning quality
  maxTokens: 4000,
  temperature: 0.7, // Balance between creativity and consistency
  
  // Request Configuration
  timeout: 30000, // 30 seconds timeout
  maxRetryAttempts: 3,
  
  // Feature Flags
  enabled: OPENAI_API_KEY !== 'your_openai_api_key_here',
  
  // API URLs
  baseURL: 'https://api.openai.com/v1'
};

// Validation function to check if OpenAI is properly configured
export const isOpenAIConfigured = () => {
  return openaiConfig.enabled && openaiConfig.apiKey && openaiConfig.apiKey.startsWith('sk-');
};

// Development helper to check configuration
export const validateOpenAIConfig = () => {
  if (!openaiConfig.apiKey) {
    return { 
      valid: false, 
      error: 'OpenAI API key is missing. Please add your API key to src/config/openai.js' 
    };
  }
  
  if (openaiConfig.apiKey === 'your_openai_api_key_here') {
    return { 
      valid: false, 
      error: 'Please replace the placeholder with your actual OpenAI API key in src/config/openai.js' 
    };
  }
  
  if (!openaiConfig.apiKey.startsWith('sk-')) {
    return { 
      valid: false, 
      error: 'Invalid OpenAI API key format. Keys should start with "sk-"' 
    };
  }
  
  return { valid: true };
};

export default openaiConfig;
