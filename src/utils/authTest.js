import { auth, db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getOrCreateItinerary, addDayToItinerary } from '../services/itinerary';

/**
 * Test authentication state and Firestore access
 */
export const testAuthAndFirestore = async () => {
  try {
    console.log('🔍 Testing authentication and Firestore access...');
    
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    console.log('Current user:', currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified
    } : 'No user authenticated');
    
    if (!currentUser) {
      return {
        success: false,
        error: 'No user authenticated',
        authState: 'not_authenticated'
      };
    }
    
    // Test Firestore access with a simple query
    console.log('Testing Firestore access...');
    const testQuery = query(
      collection(db, 'trips'),
      where('userId', '==', currentUser.uid)
    );
    
    const querySnapshot = await getDocs(testQuery);
    console.log('✅ Firestore query successful, found documents:', querySnapshot.size);
    
    return {
      success: true,
      user: {
        uid: currentUser.uid,
        email: currentUser.email
      },
      firestoreAccess: 'working',
      documentCount: querySnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Auth/Firestore test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
      authState: auth.currentUser ? 'authenticated' : 'not_authenticated'
    };
  }
};

/**
 * Test creating a simple document to verify write permissions
 */
export const testWritePermission = async () => {
  try {
    console.log('🔍 Testing write permissions...');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user authenticated');
    }
    
    // Try to create a test document
    const testDoc = {
      userId: currentUser.uid,
      testField: 'test_value',
      timestamp: new Date(),
      description: 'Test document for permission verification'
    };
    
    const docRef = await addDoc(collection(db, 'trips'), testDoc);
    console.log('✅ Write permission test successful, created document:', docRef.id);
    
    return {
      success: true,
      documentId: docRef.id,
      message: 'Write permissions working correctly'
    };
    
  } catch (error) {
    console.error('❌ Write permission test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Test itinerary creation and day addition
 */
export const testItineraryOperations = async () => {
  try {
    console.log('🔍 Testing itinerary operations...');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user authenticated');
    }
    
    // First, get a trip ID to work with
    const tripsQuery = query(
      collection(db, 'trips'),
      where('userId', '==', currentUser.uid)
    );
    
    const tripsSnapshot = await getDocs(tripsQuery);
    
    if (tripsSnapshot.empty) {
      return {
        success: false,
        error: 'No trips found. Please create a trip first.',
        step: 'no_trips'
      };
    }
    
    const tripId = tripsSnapshot.docs[0].id;
    console.log('Using trip ID for testing:', tripId);
    
    // Test 1: Get or create itinerary
    console.log('Testing getOrCreateItinerary...');
    const itinerary = await getOrCreateItinerary(tripId, currentUser.uid);
    console.log('✅ Itinerary retrieved/created:', itinerary.id);
    console.log('Current days count:', itinerary.days.length);
    
    // Test 2: Add a day to the itinerary
    console.log('Testing addDayToItinerary...');
    const newDay = await addDayToItinerary(tripId, currentUser.uid, {
      date: new Date(),
      notes: 'Test day'
    });
    console.log('✅ Day added successfully:', newDay.id);
    
    return {
      success: true,
      tripId,
      itineraryId: itinerary.id,
      dayId: newDay.id,
      daysCount: itinerary.days.length + 1,
      message: 'Itinerary operations working correctly'
    };
    
  } catch (error) {
    console.error('❌ Itinerary operations test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
      step: 'itinerary_operation'
    };
  }
};

/**
 * Test specific itinerary creation step
 */
export const testItineraryCreation = async () => {
  try {
    console.log('🔍 Testing itinerary creation specifically...');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user authenticated');
    }
    
    // Get a trip ID
    const tripsQuery = query(
      collection(db, 'trips'),
      where('userId', '==', currentUser.uid)
    );
    
    const tripsSnapshot = await getDocs(tripsQuery);
    
    if (tripsSnapshot.empty) {
      return {
        success: false,
        error: 'No trips found. Please create a trip first.',
        step: 'no_trips'
      };
    }
    
    const tripId = tripsSnapshot.docs[0].id;
    console.log('Testing with trip ID:', tripId);
    
    // Test only the getOrCreateItinerary function
    const itinerary = await getOrCreateItinerary(tripId, currentUser.uid);
    
    return {
      success: true,
      tripId,
      itineraryId: itinerary.id,
      daysCount: itinerary.days.length,
      message: 'Itinerary creation working correctly'
    };
    
  } catch (error) {
    console.error('❌ Itinerary creation test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
      step: 'itinerary_creation'
    };
  }
};
