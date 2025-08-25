import { updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserFriendlyError } from '../utils/errorMessages';

/**
 * Update the current user's display name
 * @param {string} displayName - The new display name to set
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export const updateUserDisplayName = async (displayName) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    // Validate display name
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Display name cannot be empty');
    }
    
    if (displayName.trim().length > 50) {
      throw new Error('Display name must be 50 characters or less');
    }
    
    await updateProfile(user, { displayName: displayName.trim() });
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'profile-update')
    };
  }
};

/**
 * Get the current user's profile information
 * @param {string} userId - Optional user ID (currently uses current user)
 * @returns {Promise<Object|null>} User profile data or null if not authenticated
 */
export const getUserProfile = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Update the current user's profile photo URL
 * @param {string} photoURL - The new photo URL to set
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export const updateUserPhotoURL = async (photoURL) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    // Validate photo URL
    if (!photoURL || photoURL.trim().length === 0) {
      throw new Error('Photo URL cannot be empty');
    }
    
    // Basic URL validation
    try {
      new URL(photoURL);
    } catch {
      throw new Error('Please enter a valid URL');
    }
    
    await updateProfile(user, { photoURL: photoURL.trim() });
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'profile-update')
    };
  }
};

/**
 * Update multiple profile fields at once
 * @param {Object} profileData - Object containing profile fields to update
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const updateData = {};
    
    // Validate and add display name if provided
    if (profileData.displayName !== undefined) {
      if (!profileData.displayName || profileData.displayName.trim().length === 0) {
        throw new Error('Display name cannot be empty');
      }
      if (profileData.displayName.trim().length > 50) {
        throw new Error('Display name must be 50 characters or less');
      }
      updateData.displayName = profileData.displayName.trim();
    }
    
    // Validate and add photo URL if provided
    if (profileData.photoURL !== undefined) {
      if (profileData.photoURL && profileData.photoURL.trim().length > 0) {
        try {
          new URL(profileData.photoURL);
        } catch {
          throw new Error('Please enter a valid photo URL');
        }
        updateData.photoURL = profileData.photoURL.trim();
      } else {
        updateData.photoURL = null; // Allow clearing the photo
      }
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid profile data provided');
    }
    
    await updateProfile(user, updateData);
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'profile-update')
    };
  }
};
