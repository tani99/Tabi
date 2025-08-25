import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { ProfileProvider, useProfile } from '../ProfileContext';
import { getUserProfile, updateUserDisplayName } from '../../services/user';

// Mock the user service
jest.mock('../../services/user');

// Mock the AuthContext
jest.mock('../AuthContext', () => ({
  ...jest.requireActual('../AuthContext'),
  useAuth: jest.fn(),
}));

const { useAuth } = require('../AuthContext');

// Test component to access context
const TestComponent = () => {
  const profileContext = useProfile();
  return (
    <View>
      <Text testID="profile">{JSON.stringify(profileContext.profile)}</Text>
      <Text testID="loading">{profileContext.loading.toString()}</Text>
      <Text testID="error">{profileContext.error || ''}</Text>
    </View>
  );
};

// Wrapper component for testing
const TestWrapper = ({ children }) => (
  <ProfileProvider>
    {children}
  </ProfileProvider>
);

describe('ProfileContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserProfile.mockClear();
    updateUserDisplayName.mockClear();
  });

  describe('useProfile hook', () => {
    it('should throw error when used outside ProfileProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useProfile must be used within a ProfileProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide profile context when used within ProfileProvider', () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      useAuth.mockReturnValue({ user: mockUser });
      
      getUserProfile.mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      });

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(getByTestId('loading')).toBeTruthy();
    });
  });

  describe('ProfileProvider', () => {
    it('should load profile when user is available', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      useAuth.mockReturnValue({ user: mockUser });
      
      const mockProfile = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        creationTime: '2023-01-01T00:00:00Z',
        lastSignInTime: '2023-01-01T00:00:00Z'
      };
      
      getUserProfile.mockResolvedValue(mockProfile);

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getUserProfile).toHaveBeenCalledWith('test-uid');
      });

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await waitFor(() => {
        expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockProfile));
      });
    });

    it('should handle profile loading errors', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      useAuth.mockReturnValue({ user: mockUser });
      
      const errorMessage = 'Failed to load profile';
      getUserProfile.mockRejectedValue(new Error(errorMessage));

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe(errorMessage);
      });

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });
    });

    it('should clear profile when user is null', async () => {
      useAuth.mockReturnValue({ user: null });

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('profile').props.children).toBe('null');
      });

      expect(getUserProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile function', () => {
    it('should update profile successfully', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      useAuth.mockReturnValue({ user: mockUser });
      
      const mockProfile = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Updated User'
      };
      
      getUserProfile.mockResolvedValue(mockProfile);
      updateUserDisplayName.mockResolvedValue({ success: true, user: mockUser });

      let profileContext;
      const TestComponentWithUpdate = () => {
        profileContext = useProfile();
        return (
          <View>
            <Text testID="profile">{JSON.stringify(profileContext.profile)}</Text>
            <Text testID="loading">{profileContext.loading.toString()}</Text>
          </View>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponentWithUpdate />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        const result = await profileContext.updateProfile('Updated User');
        expect(result.success).toBe(true);
      });

      expect(updateUserDisplayName).toHaveBeenCalledWith('Updated User');
      expect(getUserProfile).toHaveBeenCalledTimes(2); // Initial load + after update
    });

    it('should handle update errors', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      useAuth.mockReturnValue({ user: mockUser });
      
      getUserProfile.mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' });
      updateUserDisplayName.mockResolvedValue({ 
        success: false, 
        error: 'Display name cannot be empty' 
      });

      let profileContext;
      const TestComponentWithUpdate = () => {
        profileContext = useProfile();
        return (
          <View>
            <Text testID="error">{profileContext.error || ''}</Text>
            <Text testID="loading">{profileContext.loading.toString()}</Text>
          </View>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponentWithUpdate />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        const result = await profileContext.updateProfile('');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Display name cannot be empty');
      });

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('Display name cannot be empty');
      });
    });
  });

  describe('utility functions', () => {
    it('should clear error when clearError is called', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      useAuth.mockReturnValue({ user: mockUser });
      
      getUserProfile.mockRejectedValue(new Error('Test error'));

      let profileContext;
      const TestComponentWithClear = () => {
        profileContext = useProfile();
        return (
          <View>
            <Text testID="error">{profileContext.error || ''}</Text>
          </View>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponentWithClear />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('Test error');
      });

      act(() => {
        profileContext.clearError();
      });

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('');
      });
    });

    it('should refresh profile when refreshProfile is called', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      useAuth.mockReturnValue({ user: mockUser });
      
      getUserProfile.mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' });

      let profileContext;
      const TestComponentWithRefresh = () => {
        profileContext = useProfile();
        return (
          <View>
            <Text testID="profile">{JSON.stringify(profileContext.profile)}</Text>
          </View>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponentWithRefresh />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getUserProfile).toHaveBeenCalledTimes(1);
      });

      act(() => {
        profileContext.refreshProfile();
      });

      await waitFor(() => {
        expect(getUserProfile).toHaveBeenCalledTimes(2);
      });
    });
  });
});
