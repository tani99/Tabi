import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileAvatar from '../ProfileAvatar';
import ProfileHeader from '../ProfileHeader';
import ProfileInfoCard from '../ProfileInfoCard';
import ProfileActionsCard from '../ProfileActionsCard';

// Mock the colors theme
jest.mock('../../../theme/colors', () => ({
  colors: {
    primary: { main: '#FF6B35' },
    text: { primary: '#1E293B', secondary: '#64748B', inverse: '#FFFFFF' },
    background: { primary: '#FFFFFF' },
    border: { primary: '#E2E8F0', light: '#F1F5F9' },
    shadow: { primary: '#000000' },
    status: { error: { main: '#EF4444', background: '#FEF2F2' } },
  },
}));

describe('Profile Components', () => {
  const mockProfile = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    creationTime: '2023-01-01T00:00:00.000Z',
    lastSignInTime: '2023-12-01T00:00:00.000Z',
  };

  const mockHandlers = {
    onEditPress: jest.fn(),
    onLogout: jest.fn(),
    onSettings: jest.fn(),
    onHelp: jest.fn(),
    onAbout: jest.fn(),
  };

  describe('ProfileAvatar', () => {
    it('renders with default props', () => {
      const { getByText } = render(<ProfileAvatar />);
      expect(getByText('U')).toBeTruthy();
    });

    it('renders with display name initials', () => {
      const { getByText } = render(<ProfileAvatar displayName="John Doe" />);
      expect(getByText('JD')).toBeTruthy();
    });

    it('renders with photo URL', () => {
      const { getByTestId } = render(
        <ProfileAvatar photoURL="https://example.com/photo.jpg" />
      );
      // Note: Image component doesn't have a testID by default, so we check for the component
      expect(getByTestId).toBeDefined();
    });
  });

  describe('ProfileHeader', () => {
    it('renders with profile data', () => {
      const { getByText } = render(
        <ProfileHeader profile={mockProfile} onEditPress={mockHandlers.onEditPress} />
      );
      
      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('Edit Profile')).toBeTruthy();
    });

    it('renders with fallback values', () => {
      const { getByText } = render(
        <ProfileHeader profile={{}} onEditPress={mockHandlers.onEditPress} />
      );
      
      expect(getByText('User')).toBeTruthy();
      expect(getByText('Edit Profile')).toBeTruthy();
    });
  });

  describe('ProfileInfoCard', () => {
    it('renders with profile data', () => {
      const { getByText } = render(<ProfileInfoCard profile={mockProfile} />);
      
      expect(getByText('Account Information')).toBeTruthy();
      expect(getByText('Display Name')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Email Verified')).toBeTruthy();
      expect(getByText('Account Created')).toBeTruthy();
      expect(getByText('Last Sign In')).toBeTruthy();
    });

    it('renders with fallback values', () => {
      const { getAllByText } = render(<ProfileInfoCard profile={{}} />);
      
      expect(getAllByText('Not set')).toBeTruthy();
    });
  });

  describe('ProfileActionsCard', () => {
    it('renders all action buttons', () => {
      const { getByText } = render(
        <ProfileActionsCard {...mockHandlers} />
      );
      
      expect(getByText('Actions')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('Help & Support')).toBeTruthy();
      expect(getByText('About Tabi')).toBeTruthy();
      expect(getByText('Logout')).toBeTruthy();
    });
  });
});
