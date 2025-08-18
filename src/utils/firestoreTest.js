import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';

/**
 * Test Firestore connection and basic operations
 * This is a utility function for development/testing purposes
 */
export const testFirestoreConnection = async (userId) => {
  try {
    console.log('Testing Firestore connection...');
    
    // Test 1: Add a test document
    const testTrip = {
      userId: userId,
      name: 'Test Trip',
      location: 'Test Location',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      description: 'This is a test trip for Firestore verification',
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'trips'), testTrip);
    console.log('✅ Test document created with ID:', docRef.id);

    // Test 2: Query the test document
    const q = query(collection(db, 'trips'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    console.log('✅ Query successful, found documents:', querySnapshot.size);
    
    // Test 3: Clean up test document
    await deleteDoc(docRef);
    console.log('✅ Test document cleaned up');

    return {
      success: true,
      message: 'Firestore connection and operations working correctly'
    };

  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Get Firestore connection status
 */
export const getFirestoreStatus = () => {
  if (!db) {
    return {
      connected: false,
      error: 'Firestore not initialized'
    };
  }
  
  return {
    connected: true,
    message: 'Firestore initialized successfully'
  };
};
