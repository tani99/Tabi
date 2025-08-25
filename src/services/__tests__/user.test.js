import { 
  updateUserDisplayName, 
  getUserProfile, 
  updateUserPhotoURL, 
  updateUserProfile 
} from '../user';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { getUserFriendlyError } from '../../utils/errorMessages';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  updateProfile: jest.fn(),
}));

// Mock Firebase config
jest.mock('../../config/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock('../../utils/errorMessages');

describe('User Service', () => {
  let mockUser;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock user
    mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      emailVerified: true,
      metadata: {
        creationTime: '2023-01-01T00:00:00.000Z',
        lastSignInTime: '2023-12-01T00:00:00.000Z'
      }
    };

    // Setup mock auth
    auth.currentUser = mockUser;
    
    // Mock updateProfile
    updateProfile.mockResolvedValue();
    
    // Mock getUserFriendlyError
    getUserFriendlyError.mockReturnValue('User-friendly error message');
  });

  describe('updateUserDisplayName', () => {
    it('should successfully update display name', async () => {
      const result = await updateUserDisplayName('New Name');
      
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New Name' });
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should handle empty display name', async () => {
      const result = await updateUserDisplayName('');
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });

    it('should handle display name too long', async () => {
      const longName = 'a'.repeat(51);
      const result = await updateUserDisplayName(longName);
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });

    it('should handle no authenticated user', async () => {
      auth.currentUser = null;
      
      const result = await updateUserDisplayName('New Name');
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });

    it('should handle Firebase errors', async () => {
      updateProfile.mockRejectedValue(new Error('Firebase error'));
      
      const result = await updateUserDisplayName('New Name');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const result = await getUserProfile();
      
      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        creationTime: '2023-01-01T00:00:00.000Z',
        lastSignInTime: '2023-12-01T00:00:00.000Z'
      });
    });

    it('should return null when no user is authenticated', async () => {
      auth.currentUser = null;
      
      const result = await getUserProfile();
      
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      auth.currentUser = null;
      
      const result = await getUserProfile();
      
      expect(result).toBeNull();
    });
  });

  describe('updateUserPhotoURL', () => {
    it('should successfully update photo URL', async () => {
      const result = await updateUserPhotoURL('https://example.com/new-photo.jpg');
      
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { 
        photoURL: 'https://example.com/new-photo.jpg' 
      });
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should handle empty photo URL', async () => {
      const result = await updateUserPhotoURL('');
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });

    it('should handle invalid URL', async () => {
      const result = await updateUserPhotoURL('invalid-url');
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });

    it('should handle no authenticated user', async () => {
      auth.currentUser = null;
      
      const result = await updateUserPhotoURL('https://example.com/photo.jpg');
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });
  });

  describe('updateUserProfile', () => {
    it('should successfully update multiple profile fields', async () => {
      const profileData = {
        displayName: 'New Name',
        photoURL: 'https://example.com/new-photo.jpg'
      };
      
      const result = await updateUserProfile(profileData);
      
      expect(updateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'New Name',
        photoURL: 'https://example.com/new-photo.jpg'
      });
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should handle empty profile data', async () => {
      const result = await updateUserProfile({});
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });

    it('should handle partial updates', async () => {
      const result = await updateUserProfile({ displayName: 'New Name' });
      
      expect(updateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'New Name'
      });
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should allow clearing photo URL', async () => {
      const result = await updateUserProfile({ photoURL: '' });
      
      expect(updateProfile).toHaveBeenCalledWith(mockUser, {
        photoURL: null
      });
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should handle no authenticated user', async () => {
      auth.currentUser = null;
      
      const result = await updateUserProfile({ displayName: 'New Name' });
      
      expect(updateProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User-friendly error message');
    });
  });
});
