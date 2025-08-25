# Profile Screen Implementation Steps

## Phase 1: Core Profile Screen (Days 1-3)

### Step 1: Create User Services
**File:** `src/services/user.js`
**Time:** 2-3 hours

**Tasks:**
1. Create the user service file
2. Implement `updateUserDisplayName` function
3. Implement `getUserProfile` function (for future extended profile)
4. Add error handling and validation
5. Test with Firebase Auth integration

**Code Structure:**
```javascript
import { updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserFriendlyError } from '../utils/errorMessages';

export const updateUserDisplayName = async (displayName) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    await updateProfile(user, { displayName });
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'profile-update')
    };
  }
};

export const getUserProfile = async (userId) => {
  // Future implementation for extended profile data
  // For now, return basic user info from auth
  const user = auth.currentUser;
  return user ? {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime
  } : null;
};
```

### Step 2: Create Profile Context
**File:** `src/context/ProfileContext.js`
**Time:** 2-3 hours

**Tasks:**
1. Create ProfileContext with user state management
2. Implement profile loading and error states
3. Add profile update functions
4. Integrate with existing AuthContext
5. Test context functionality

**Code Structure:**
```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile, updateUserDisplayName } from '../services/user';

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

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    loadProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
```

### Step 3: Create Profile Components
**Directory:** `src/components/profile/`
**Time:** 4-6 hours

**Tasks:**
1. Create ProfileHeader component
2. Create ProfileInfoCard component
3. Create ProfileActionsCard component
4. Create ProfileAvatar component
5. Test all components individually

**ProfileHeader.js:**
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import ProfileAvatar from './ProfileAvatar';

const ProfileHeader = ({ profile, onEditPress }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <ProfileAvatar photoURL={profile?.photoURL} size={80} />
      <Text style={styles.displayName}>{profile?.displayName || 'User'}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <Text style={styles.memberSince}>
        Member since {formatDate(profile?.creationTime)}
      </Text>
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 12,
  },
  email: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
  memberSince: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: colors.primary.main,
    borderRadius: 20,
  },
  editButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileHeader;
```

### Step 4: Create Profile Screen
**File:** `src/screens/ProfileScreen.js`
**Time:** 3-4 hours

**Tasks:**
1. Create main ProfileScreen component
2. Integrate ProfileContext
3. Add navigation to edit screen
4. Implement logout functionality
5. Add loading and error states
6. Test screen functionality

**Code Structure:**
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import ScreenLayout from '../components/layout/ScreenLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import ProfileActionsCard from '../components/profile/ProfileActionsCard';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { colors } from '../theme/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { profile, loading, error } = useProfile();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ScreenLayout>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading profile: {error}</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ProfileHeader profile={profile} onEditPress={handleEditProfile} />
      <ProfileInfoCard profile={profile} />
      <ProfileActionsCard onLogout={handleLogout} />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
```

## Phase 2: Profile Editing (Days 4-5)

### Step 5: Create Edit Profile Components
**Directory:** `src/components/profile-edit/`
**Time:** 3-4 hours

**Tasks:**
1. Create ProfileEditForm component
2. Create ProfileEditActions component
3. Add form validation
4. Integrate with ProfileContext
5. Test form functionality

### Step 6: Create Edit Profile Screen
**File:** `src/screens/EditProfileScreen.js`
**Time:** 2-3 hours

**Tasks:**
1. Create EditProfileScreen component
2. Pre-populate form with current data
3. Add save and cancel functionality
4. Implement loading states
5. Add navigation back to profile

## Phase 3: Navigation Integration (Day 6)

### Step 7: Update Navigation
**File:** `src/navigation/AppNavigator.js`
**Time:** 1-2 hours

**Tasks:**
1. Add Profile screen to navigation stack
2. Add EditProfile screen to navigation stack
3. Configure screen options
4. Test navigation flow

### Step 8: Update Home Screen
**File:** `src/screens/HomeScreen.js`
**Time:** 1-2 hours

**Tasks:**
1. Add profile navigation button
2. Update user information display
3. Test navigation integration

## Phase 4: Testing & Polish (Day 7)

### Step 9: Testing
**Time:** 2-3 hours

**Tasks:**
1. Test profile screen rendering
2. Test navigation flows
3. Test form validation
4. Test error handling
5. Test logout functionality

### Step 10: Polish & Optimization
**Time:** 1-2 hours

**Tasks:**
1. Add loading animations
2. Optimize component performance
3. Add error boundaries
4. Test on different screen sizes
5. Final UI/UX improvements

## Implementation Checklist

### Phase 1 Checklist
- [x] Create `src/services/user.js` with basic user functions
- [ ] Create `src/context/ProfileContext.js` with state management
- [ ] Create `src/components/profile/ProfileHeader.js`
- [ ] Create `src/components/profile/ProfileInfoCard.js`
- [ ] Create `src/components/profile/ProfileActionsCard.js`
- [ ] Create `src/components/profile/ProfileAvatar.js`
- [ ] Create `src/screens/ProfileScreen.js`
- [ ] Test profile display functionality

### Phase 2 Checklist
- [ ] Create `src/components/profile-edit/ProfileEditForm.js`
- [ ] Create `src/components/profile-edit/ProfileEditActions.js`
- [ ] Create `src/screens/EditProfileScreen.js`
- [ ] Test profile editing functionality

### Phase 3 Checklist
- [ ] Update `src/navigation/AppNavigator.js`
- [ ] Update `src/screens/HomeScreen.js`
- [ ] Test navigation flows
- [ ] Test integration with existing screens

### Phase 4 Checklist
- [ ] Test all functionality
- [ ] Add error handling
- [ ] Optimize performance
- [ ] Final UI polish
- [ ] Documentation updates

## Testing Strategy

### Unit Tests
- Test each component individually
- Test service functions
- Test context functionality
- Test form validation

### Integration Tests
- Test navigation flows
- Test profile data flow
- Test error scenarios
- Test user interactions

### Manual Testing
- Test on different devices
- Test with different user data
- Test offline scenarios
- Test edge cases

## Success Metrics
- [ ] Profile screen loads and displays user data correctly
- [ ] Profile editing works without errors
- [ ] Navigation between screens is smooth
- [ ] Logout functionality works properly
- [ ] Error states are handled gracefully
- [ ] Performance is acceptable on target devices
- [ ] UI follows existing design patterns
- [ ] Code is well-documented and maintainable

## Notes
- Start with basic functionality and add features incrementally
- Test each component as you build it
- Follow existing code patterns and conventions
- Keep the UI simple and focused on core functionality
- Plan for future enhancements like profile pictures
- Ensure accessibility compliance
- Document any deviations from the plan
