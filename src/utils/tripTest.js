import { createTrip, getUserTrips, getTrip, updateTrip, deleteTrip } from '../services/trips';
import { TRIP_STATUS } from './tripConstants';

/**
 * Test utility for verifying trip collection structure and access control
 * This should only be used for development/testing purposes
 */

/**
 * Test 1: Create a trip and verify all fields are correct
 */
export const testCreateTrip = async (userId) => {
  console.log('📝 Test 1: Creating a trip...');
  
  const testTripData = {
    name: 'Test Trip to Paris',
    location: 'Paris, France',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-07'),
    description: 'This is a test trip for development purposes',
    status: TRIP_STATUS.PLANNING
  };
  
  try {
    const tripId = await createTrip(testTripData, userId);
    console.log('✅ Trip created successfully with ID:', tripId);
    
    // Assert trip ID is not empty
    if (!tripId || typeof tripId !== 'string') {
      throw new Error('Trip ID should be a non-empty string');
    }
    
    return { tripId, testTripData };
  } catch (error) {
    console.error('❌ Create trip test failed:', error);
    throw error;
  }
};

/**
 * Test 2: Retrieve a trip and verify all fields match
 */
export const testGetTrip = async (tripId, userId, expectedData) => {
  console.log('📖 Test 2: Retrieving the created trip...');
  
  try {
    const retrievedTrip = await getTrip(tripId, userId);
    console.log('✅ Trip retrieved successfully');
    
    // Assert all required fields exist
    const requiredFields = ['id', 'userId', 'name', 'location', 'startDate', 'endDate', 'description', 'status', 'createdAt', 'updatedAt'];
    requiredFields.forEach(field => {
      if (!(field in retrievedTrip)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
    
    // Assert trip ID matches
    if (retrievedTrip.id !== tripId) {
      throw new Error(`Trip ID mismatch: expected ${tripId}, got ${retrievedTrip.id}`);
    }
    
    // Assert user ID matches
    if (retrievedTrip.userId !== userId) {
      throw new Error(`User ID mismatch: expected ${userId}, got ${retrievedTrip.userId}`);
    }
    
    // Assert trip data matches expected values
    if (retrievedTrip.name !== expectedData.name) {
      throw new Error(`Name mismatch: expected "${expectedData.name}", got "${retrievedTrip.name}"`);
    }
    
    if (retrievedTrip.location !== expectedData.location) {
      throw new Error(`Location mismatch: expected "${expectedData.location}", got "${retrievedTrip.location}"`);
    }
    
    if (retrievedTrip.description !== expectedData.description) {
      throw new Error(`Description mismatch: expected "${expectedData.description}", got "${retrievedTrip.description}"`);
    }
    
    if (retrievedTrip.status !== expectedData.status) {
      throw new Error(`Status mismatch: expected "${expectedData.status}", got "${retrievedTrip.status}"`);
    }
    
    // Assert dates are Date objects and match expected values
    if (!(retrievedTrip.startDate instanceof Date)) {
      throw new Error('Start date should be a Date object');
    }
    
    if (!(retrievedTrip.endDate instanceof Date)) {
      throw new Error('End date should be a Date object');
    }
    
    if (retrievedTrip.startDate.getTime() !== expectedData.startDate.getTime()) {
      throw new Error(`Start date mismatch: expected ${expectedData.startDate}, got ${retrievedTrip.startDate}`);
    }
    
    if (retrievedTrip.endDate.getTime() !== expectedData.endDate.getTime()) {
      throw new Error(`End date mismatch: expected ${expectedData.endDate}, got ${retrievedTrip.endDate}`);
    }
    
    // Assert timestamps exist
    if (!retrievedTrip.createdAt) {
      throw new Error('Created timestamp should exist');
    }
    
    if (!retrievedTrip.updatedAt) {
      throw new Error('Updated timestamp should exist');
    }
    
    console.log('✅ All trip fields verified correctly');
    return retrievedTrip;
  } catch (error) {
    console.error('❌ Get trip test failed:', error);
    throw error;
  }
};

/**
 * Test 3: Update a trip and verify changes are applied
 */
export const testUpdateTrip = async (tripId, userId) => {
  console.log('✏️ Test 3: Updating the trip...');
  
  const updateData = {
    name: 'Updated Test Trip to Paris',
    status: TRIP_STATUS.ACTIVE,
    description: 'Updated description for testing'
  };
  
  try {
    await updateTrip(tripId, updateData, userId);
    console.log('✅ Trip updated successfully');
    
    // Retrieve the trip again to verify updates
    const updatedTrip = await getTrip(tripId, userId);
    
    // Assert updated fields match
    if (updatedTrip.name !== updateData.name) {
      throw new Error(`Updated name mismatch: expected "${updateData.name}", got "${updatedTrip.name}"`);
    }
    
    if (updatedTrip.status !== updateData.status) {
      throw new Error(`Updated status mismatch: expected "${updateData.status}", got "${updatedTrip.status}"`);
    }
    
    if (updatedTrip.description !== updateData.description) {
      throw new Error(`Updated description mismatch: expected "${updateData.description}", got "${updatedTrip.description}"`);
    }
    
    // Assert updatedAt timestamp was changed
    if (!updatedTrip.updatedAt) {
      throw new Error('Updated timestamp should exist after update');
    }
    
    console.log('✅ All trip updates verified correctly');
    return updatedTrip;
  } catch (error) {
    console.error('❌ Update trip test failed:', error);
    throw error;
  }
};

/**
 * Test 4: Get all user trips and verify the updated trip is included
 */
export const testGetUserTrips = async (userId, expectedTripId) => {
  console.log('📋 Test 4: Getting all user trips...');
  
  try {
    const allTrips = await getUserTrips(userId);
    console.log('✅ All trips retrieved:', allTrips.length, 'trips found');
    
    // Assert we got an array
    if (!Array.isArray(allTrips)) {
      throw new Error('getUserTrips should return an array');
    }
    
    // Assert the expected trip is in the list
    const foundTrip = allTrips.find(trip => trip.id === expectedTripId);
    if (!foundTrip) {
      throw new Error(`Expected trip with ID ${expectedTripId} not found in user trips`);
    }
    
    // Assert the trip has the updated values
    if (foundTrip.name !== 'Updated Test Trip to Paris') {
      throw new Error(`Trip in list has wrong name: expected "Updated Test Trip to Paris", got "${foundTrip.name}"`);
    }
    
    if (foundTrip.status !== TRIP_STATUS.ACTIVE) {
      throw new Error(`Trip in list has wrong status: expected "${TRIP_STATUS.ACTIVE}", got "${foundTrip.status}"`);
    }
    
    console.log('✅ User trips list verified correctly');
    return allTrips;
  } catch (error) {
    console.error('❌ Get user trips test failed:', error);
    throw error;
  }
};

/**
 * Test 5: Delete a trip and verify it's removed
 */
export const testDeleteTrip = async (tripId, userId) => {
  console.log('🗑️ Test 5: Deleting the trip...');
  
  try {
    await deleteTrip(tripId, userId);
    console.log('✅ Trip deleted successfully');
    
    // Verify the trip no longer exists
    try {
      await getTrip(tripId, userId);
      throw new Error('Trip should not exist after deletion');
    } catch (error) {
      if (error.message === 'Trip not found') {
        console.log('✅ Trip deletion verified - trip no longer exists');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Delete trip test failed:', error);
    throw error;
  }
};

/**
 * Test 6: Verify deletion by checking user trips list
 */
export const testVerifyDeletion = async (userId, deletedTripId) => {
  console.log('🔍 Test 6: Verifying deletion in user trips list...');
  
  try {
    const tripsAfterDeletion = await getUserTrips(userId);
    console.log('✅ Verification complete:', tripsAfterDeletion.length, 'trips remaining');
    
    // Assert the deleted trip is not in the list
    const deletedTripStillExists = tripsAfterDeletion.find(trip => trip.id === deletedTripId);
    if (deletedTripStillExists) {
      throw new Error(`Deleted trip with ID ${deletedTripId} still exists in user trips list`);
    }
    
    console.log('✅ Deletion verification passed - trip removed from user trips list');
    return tripsAfterDeletion;
  } catch (error) {
    console.error('❌ Deletion verification test failed:', error);
    throw error;
  }
};

/**
 * Run all trip collection tests in sequence
 */
export const testTripCollection = async (userId) => {
  console.log('🧪 Testing Trip Collection Structure...');
  
  try {
    // Test 1: Create trip
    const { tripId, testTripData } = await testCreateTrip(userId);
    
    // Test 2: Get and verify trip
    await testGetTrip(tripId, userId, testTripData);
    
    // Test 3: Update trip
    await testUpdateTrip(tripId, userId);
    
    // Test 4: Get all user trips
    await testGetUserTrips(userId, tripId);
    
    // Test 5: Delete trip
    await testDeleteTrip(tripId, userId);
    
    // Test 6: Verify deletion
    await testVerifyDeletion(userId, tripId);
    
    console.log('🎉 All trip collection tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Trip collection test failed:', error);
    return false;
  }
};

/**
 * Test access control by attempting to access another user's trip
 * This should fail with an "Access denied" error
 */
export const testAccessControl = async (userId, otherUserId) => {
  console.log('🔒 Testing Access Control...');
  
  try {
    // Create a trip for the other user (this would normally be done by that user)
    const otherUserTripData = {
      name: 'Other User Trip',
      location: 'Tokyo, Japan',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-05'),
      description: 'This trip belongs to another user',
      status: TRIP_STATUS.PLANNING
    };
    
    const otherUserTripId = await createTrip(otherUserTripData, otherUserId);
    console.log('📝 Created trip for other user with ID:', otherUserTripId);
    
    // Try to access the other user's trip (should fail)
    console.log('🚫 Attempting to access other user\'s trip...');
    try {
      await getTrip(otherUserTripId, userId);
      console.error('❌ Access control failed - should not be able to access other user\'s trip');
      return false;
    } catch (accessError) {
      if (accessError.message === 'Access denied') {
        console.log('✅ Access control working correctly - denied access to other user\'s trip');
        
        // Clean up the test trip
        await deleteTrip(otherUserTripId, otherUserId);
        console.log('🧹 Cleaned up test trip');
        
        return true;
      } else {
        console.error('❌ Unexpected error during access control test:', accessError);
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Access control test failed:', error);
    return false;
  }
};
