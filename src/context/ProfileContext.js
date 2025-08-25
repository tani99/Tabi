import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile, updateUserDisplayName } from '../services/user';
import { updateProfilePhoto } from '../services/photo';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (displayName) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateUserDisplayName(displayName);
      if (result.success) {
        await loadProfile(); // Reload profile data
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePhoto = async (photoURL) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateProfilePhoto(photoURL);
      if (result.success) {
        await loadProfile(); // Reload profile data
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update photo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [user]);

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    updatePhoto,
    loadProfile,
    clearError,
    refreshProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
