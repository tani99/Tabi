import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

// Auth screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import TripListScreen from '../screens/TripListScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import ItineraryScreen from '../screens/ItineraryScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import EditTripScreen from '../screens/EditTripScreen';
import AITripPlanningScreen from '../screens/AITripPlanningScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// Context providers
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TripDetailsProvider } from '../context/TripDetailsContext';
import { EditModeProvider } from '../context/EditModeContext';
import { ProfileProvider } from '../context/ProfileContext';
import { ItineraryProvider } from '../context/ItineraryContext';
import { colors } from '../theme/colors';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.navigation.background },
    }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.navigation.background },
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      gestureDirection: 'horizontal',
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
    <Stack.Screen name="TripList" component={TripListScreen} />
    <Stack.Screen 
      name="TripDetails" 
      component={(props) => (
        <EditModeProvider>
          <TripDetailsProvider>
            <TripDetailsScreen {...props} />
          </TripDetailsProvider>
        </EditModeProvider>
      )} 
    />
    <Stack.Screen 
      name="Itinerary" 
      component={(props) => (
        <TripDetailsProvider>
          <ItineraryProvider>
            <ItineraryScreen {...props} />
          </ItineraryProvider>
        </TripDetailsProvider>
      )} 
    />
    <Stack.Screen name="EditTrip" component={EditTripScreen} />
    <Stack.Screen name="AITripPlanning" component={AITripPlanningScreen} />
    <Stack.Screen 
      name="Profile" 
      component={(props) => (
        <ProfileProvider>
          <ProfileScreen {...props} />
        </ProfileProvider>
      )} 
    />
    <Stack.Screen 
      name="EditProfile" 
      component={(props) => (
        <ProfileProvider>
          <EditProfileScreen {...props} />
        </ProfileProvider>
      )} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
