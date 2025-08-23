import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditModeContext = createContext();

const EDIT_MODE_STORAGE_KEY = 'editModeState';

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};

export const EditModeProvider = ({ children }) => {
  // Global edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted edit mode state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const persistedState = await AsyncStorage.getItem(EDIT_MODE_STORAGE_KEY);
        if (persistedState) {
          const { isEditMode: persistedEditMode, hasUnsavedChanges: persistedUnsavedChanges } = JSON.parse(persistedState);
          setIsEditMode(persistedEditMode || false);
          setHasUnsavedChanges(persistedUnsavedChanges || false);
        }
      } catch (error) {
        console.warn('Failed to load persisted edit mode state:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadPersistedState();
  }, []);

  // Persist edit mode state when it changes
  const persistState = useCallback(async (editMode, unsavedChanges) => {
    try {
      const stateToPersist = {
        isEditMode: editMode,
        hasUnsavedChanges: unsavedChanges,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(EDIT_MODE_STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn('Failed to persist edit mode state:', error);
    }
  }, []);

  /**
   * Toggle edit mode on/off
   */
  const toggleEditMode = useCallback(() => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    if (isEditMode) {
      // Exiting edit mode - clear unsaved changes
      setHasUnsavedChanges(false);
      setSaveError(null);
      persistState(newEditMode, false);
    } else {
      persistState(newEditMode, hasUnsavedChanges);
    }
  }, [isEditMode, hasUnsavedChanges, persistState]);

  /**
   * Enter edit mode
   */
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    setHasUnsavedChanges(false);
    setSaveError(null);
    persistState(true, false);
  }, [persistState]);

  /**
   * Exit edit mode
   */
  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setSaveError(null);
    persistState(false, false);
  }, [persistState]);

  /**
   * Mark that there are unsaved changes
   */
  const markUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(true);
    persistState(isEditMode, true);
  }, [isEditMode, persistState]);

  /**
   * Clear unsaved changes flag
   */
  const clearUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    persistState(isEditMode, false);
  }, [isEditMode, persistState]);

  /**
   * Set saving state
   */
  const setSavingState = useCallback((saving, error = null) => {
    setIsSaving(saving);
    setSaveError(error);
  }, []);

  /**
   * Clear all persisted state (useful for logout or app reset)
   */
  const clearPersistedState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(EDIT_MODE_STORAGE_KEY);
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setSaveError(null);
    } catch (error) {
      console.warn('Failed to clear persisted edit mode state:', error);
    }
  }, []);

  const value = {
    // State
    isEditMode,
    hasUnsavedChanges,
    isSaving,
    saveError,
    isInitialized,
    
    // Actions
    toggleEditMode,
    enterEditMode,
    exitEditMode,
    markUnsavedChanges,
    clearUnsavedChanges,
    setSavingState,
    clearPersistedState,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};
