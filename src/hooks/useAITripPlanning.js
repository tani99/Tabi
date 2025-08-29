import { useState, useCallback, useRef, useEffect } from 'react';
import { generateTripPlan, generateActivitySuggestions, isOpenAIAvailable } from '../services/openai';
import { createTrip } from '../services/trips';
import { initializeItineraryForTrip } from '../services/itinerary';
import { useAuth } from '../context/AuthContext';

/**
 * Loading states for detailed progress tracking
 */
const LOADING_STATES = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  GENERATING: 'generating', 
  PARSING: 'parsing',
  VALIDATING: 'validating',
  COMPLETE: 'complete',
  ERROR: 'error'
};

/**
 * Error types for better error handling
 */
const ERROR_TYPES = {
  CONFIGURATION: 'configuration',
  NETWORK: 'network',
  PARSING: 'parsing',
  VALIDATION: 'validation',
  SERVICE: 'service',
  UNKNOWN: 'unknown'
};

/**
 * Custom hook for AI trip planning operations
 * Provides a clean interface for components to interact with AI trip planning
 */
const useAITripPlanning = () => {
  const { user } = useAuth();
  
  // Main state
  const [state, setState] = useState({
    // Loading states
    isLoading: false,
    loadingState: LOADING_STATES.IDLE,
    
    // Data states
    aiResponse: null,
    parsedTripData: null,
    lastUserInput: null,
    
    // Error states
    error: null,
    errorType: null,
    canRetry: false,
    retryCount: 0,
    
    // Metadata
    responseTime: null,
    tokenUsage: null,
    lastRequestId: null
  });

  // Cache for responses (prevent duplicate requests)
  const cacheRef = useRef(new Map());
  const lastRequestRef = useRef(null);

  /**
   * Clear all state and return to idle
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      loadingState: LOADING_STATES.IDLE,
      aiResponse: null,
      parsedTripData: null,
      lastUserInput: null,
      error: null,
      errorType: null,
      canRetry: false,
      retryCount: 0,
      responseTime: null,
      tokenUsage: null,
      lastRequestId: null
    });
  }, []);

  /**
   * Clear error state only
   */
  const clearError = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      error: null,
      errorType: null,
      canRetry: false
    }));
  }, []);

  /**
   * Update loading state with optional message
   */
  const updateLoadingState = useCallback((newState, additionalData = {}) => {
    setState(prevState => ({
      ...prevState,
      loadingState: newState,
      isLoading: newState !== LOADING_STATES.IDLE && newState !== LOADING_STATES.COMPLETE && newState !== LOADING_STATES.ERROR,
      ...additionalData
    }));
  }, []);

  /**
   * Set error state with retry capability
   */
  const setError = useCallback((error, errorType = ERROR_TYPES.UNKNOWN, canRetry = false) => {
    setState(prevState => ({
      ...prevState,
      error,
      errorType,
      canRetry,
      isLoading: false,
      loadingState: LOADING_STATES.ERROR
    }));
  }, []);

  /**
   * Generate cache key for user input
   */
  const getCacheKey = useCallback((userInput, options = {}) => {
    return `${userInput.trim().toLowerCase()}_${JSON.stringify(options)}`;
  }, []);

  /**
   * Check if response is cached and still valid
   */
  const getCachedResponse = useCallback((cacheKey) => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;

    // Check if cache is expired (1 hour)
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    const cacheExpiry = 60 * 60 * 1000; // 1 hour

    if (cacheAge > cacheExpiry) {
      cacheRef.current.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, []);

  /**
   * Cache a response
   */
  const setCachedResponse = useCallback((cacheKey, data) => {
    // Limit cache size to prevent memory issues
    if (cacheRef.current.size >= 20) {
      // Remove oldest entries
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 5; i++) {
        cacheRef.current.delete(entries[i][0]);
      }
    }

    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Main function to plan a trip using AI
   */
  const planTrip = useCallback(async (userInput, options = {}) => {
    // Validate inputs
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length < 3) {
      setError('Please provide a valid trip description (at least 3 characters)', ERROR_TYPES.VALIDATION);
      return { success: false, error: 'Invalid input' };
    }

    // Check if AI is available
    const availability = isOpenAIAvailable();
    if (!availability.available) {
      setError(availability.reason, ERROR_TYPES.CONFIGURATION);
      return { success: false, error: availability.reason };
    }

    const cacheKey = getCacheKey(userInput, options);
    
    try {
      // Cancel any existing request
      if (lastRequestRef.current) {
        lastRequestRef.current.cancelled = true;
      }

      // Create new request reference
      const requestRef = { cancelled: false };
      lastRequestRef.current = requestRef;

      // Clear previous errors and update state
      clearError();
      updateLoadingState(LOADING_STATES.ANALYZING, {
        lastUserInput: userInput.trim(),
        retryCount: 0
      });

      // Check cache first
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log('AI Hook: Using cached response for:', userInput.substring(0, 50));
        
        setState(prevState => ({
          ...prevState,
          aiResponse: cachedResponse.aiResponse,
          parsedTripData: cachedResponse.parsedTripData,
          responseTime: cachedResponse.responseTime,
          tokenUsage: cachedResponse.tokenUsage,
          lastRequestId: cachedResponse.lastRequestId,
          isLoading: false,
          loadingState: LOADING_STATES.COMPLETE
        }));

        return { success: true, data: cachedResponse.parsedTripData, cached: true };
      }

      // Check if request was cancelled
      if (requestRef.cancelled) {
        return { success: false, error: 'Request cancelled' };
      }

      updateLoadingState(LOADING_STATES.GENERATING);

      // Make AI request
      const result = await generateTripPlan(userInput, options);

      // Check if request was cancelled after AI call
      if (requestRef.cancelled) {
        return { success: false, error: 'Request cancelled' };
      }

      updateLoadingState(LOADING_STATES.PARSING);

      if (!result.success) {
        const errorType = result.code === 'configuration-invalid' ? ERROR_TYPES.CONFIGURATION :
                         result.code === 'parsing-failed' ? ERROR_TYPES.PARSING :
                         result.code === 'network-error' ? ERROR_TYPES.NETWORK :
                         ERROR_TYPES.SERVICE;
        
        setError(result.error, errorType, true);
        return { success: false, error: result.error, code: result.code };
      }

      updateLoadingState(LOADING_STATES.VALIDATING);

      // Update state with successful result
      const responseData = {
        aiResponse: result.data,
        parsedTripData: result.data,
        responseTime: result.data.metadata.responseTime,
        tokenUsage: result.data.metadata.usage,
        lastRequestId: result.data.metadata.requestId
      };

      setState(prevState => ({
        ...prevState,
        ...responseData,
        isLoading: false,
        loadingState: LOADING_STATES.COMPLETE,
        error: null,
        errorType: null
      }));

      // Cache the response
      setCachedResponse(cacheKey, responseData);

      updateLoadingState(LOADING_STATES.COMPLETE);

      console.log('AI Hook: Trip planning completed successfully', {
        tripName: result.data.trip.name,
        responseTime: result.data.metadata.responseTime,
        cached: false
      });

      return { success: true, data: result.data };

    } catch (error) {
      console.error('AI Hook: Unexpected error during trip planning:', error);
      setError('An unexpected error occurred. Please try again.', ERROR_TYPES.UNKNOWN, true);
      return { success: false, error: error.message };
    }
  }, [clearError, updateLoadingState, setError, getCacheKey, getCachedResponse, setCachedResponse]);

  /**
   * Generate activity suggestions for existing trip
   */
  const suggestActivities = useCallback(async (tripData, activityRequest) => {
    if (!tripData || !activityRequest || activityRequest.trim().length < 3) {
      setError('Please provide valid trip data and activity request', ERROR_TYPES.VALIDATION);
      return { success: false, error: 'Invalid input' };
    }

    // Check if AI is available
    const availability = isOpenAIAvailable();
    if (!availability.available) {
      setError(availability.reason, ERROR_TYPES.CONFIGURATION);
      return { success: false, error: availability.reason };
    }

    try {
      clearError();
      updateLoadingState(LOADING_STATES.GENERATING);

      const result = await generateActivitySuggestions(tripData, activityRequest);

      if (!result.success) {
        setError(result.error, ERROR_TYPES.SERVICE, true);
        return { success: false, error: result.error };
      }

      updateLoadingState(LOADING_STATES.COMPLETE);

      console.log('AI Hook: Activity suggestions generated successfully', {
        activityCount: result.data.activities.length
      });

      return { success: true, data: result.data };

    } catch (error) {
      console.error('AI Hook: Error generating activity suggestions:', error);
      setError('Failed to generate activity suggestions', ERROR_TYPES.UNKNOWN, true);
      return { success: false, error: error.message };
    }
  }, [clearError, updateLoadingState, setError]);

  /**
   * Retry the last failed request
   */
  const retry = useCallback(async () => {
    if (!state.canRetry || !state.lastUserInput) {
      return { success: false, error: 'No request to retry' };
    }

    setState(prevState => ({
      ...prevState,
      retryCount: prevState.retryCount + 1
    }));

    return await planTrip(state.lastUserInput);
  }, [state.canRetry, state.lastUserInput, planTrip]);

  /**
   * Save AI-generated trip to user's trips
   */
  const saveTrip = useCallback(async () => {
    if (!state.parsedTripData) {
      return { success: false, error: 'No trip data to save' };
    }

    if (!user || !user.uid) {
      return { success: false, error: 'User not authenticated. Please log in and try again.' };
    }

    try {
      updateLoadingState(LOADING_STATES.GENERATING, { loadingMessage: 'Saving trip...' });

      // Prepare trip data for saving (without userId in the data)
      const tripToSave = {
        ...state.parsedTripData.trip
      };

      // Remove AI-specific fields that shouldn't be saved to Firestore
      delete tripToSave.id;
      delete tripToSave.userId; // Remove this as it's passed separately
      delete tripToSave.aiGenerated; // Remove this as it's not in the standard TRIP_MODEL
      delete tripToSave.aiPrompt; // Remove this as it's not in the standard TRIP_MODEL  
      delete tripToSave.generatedAt; // Remove this as it's not in the standard TRIP_MODEL

      console.log('AI Hook: Saving trip with user ID:', user.uid);
      console.log('AI Hook: Trip data to save:', tripToSave);

      // Create the trip with userId as separate parameter
      const tripId = await createTrip(tripToSave, user.uid);
      
      console.log('AI Hook: Trip created successfully with ID:', tripId);

      // Initialize itinerary if we have one
      if (state.parsedTripData.itinerary) {
        console.log('AI Hook: Initializing itinerary for saved trip');
        try {
          await initializeItineraryForTrip(tripId, user.uid, tripToSave.startDate, tripToSave.endDate);
          console.log('AI Hook: Itinerary initialized successfully');
        } catch (itineraryError) {
          console.warn('AI Hook: Failed to initialize itinerary, but trip was created:', itineraryError);
          // Don't fail the overall operation if itinerary fails
        }
      }

      updateLoadingState(LOADING_STATES.COMPLETE);

      console.log('AI Hook: Trip saved successfully', { tripId });

      return { 
        success: true, 
        tripId,
        trip: { ...tripToSave, id: tripId }
      };

    } catch (error) {
      console.error('AI Hook: Error saving trip:', error);
      setError('Failed to save trip', ERROR_TYPES.SERVICE);
      return { success: false, error: error.message };
    }
  }, [state.parsedTripData, user, updateLoadingState, setError]);

  /**
   * Clear cache (useful for logout or manual refresh)
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('AI Hook: Cache cleared');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lastRequestRef.current) {
        lastRequestRef.current.cancelled = true;
      }
    };
  }, []);

  // Auto-clear cache on user change (logout/login)
  useEffect(() => {
    clearCache();
  }, [user?.uid, clearCache]);

  return {
    // State
    isLoading: state.isLoading,
    loadingState: state.loadingState,
    error: state.error,
    errorType: state.errorType,
    canRetry: state.canRetry,
    retryCount: state.retryCount,
    
    // Data
    aiResponse: state.aiResponse,
    parsedTripData: state.parsedTripData,
    tripData: state.parsedTripData?.trip || null,
    itineraryData: state.parsedTripData?.itinerary || null,
    lastUserInput: state.lastUserInput,
    
    // Metadata
    responseTime: state.responseTime,
    tokenUsage: state.tokenUsage,
    lastRequestId: state.lastRequestId,
    
    // Actions
    planTrip,
    suggestActivities,
    saveTrip,
    retry,
    clearError,
    reset,
    clearCache,
    
    // Computed properties
    hasData: !!state.parsedTripData,
    hasError: !!state.error,
    isIdle: state.loadingState === LOADING_STATES.IDLE,
    isAnalyzing: state.loadingState === LOADING_STATES.ANALYZING,
    isGenerating: state.loadingState === LOADING_STATES.GENERATING,
    isParsing: state.loadingState === LOADING_STATES.PARSING,
    isValidating: state.loadingState === LOADING_STATES.VALIDATING,
    isComplete: state.loadingState === LOADING_STATES.COMPLETE
  };
};

export default useAITripPlanning;
