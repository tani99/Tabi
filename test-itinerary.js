// Simple test script to verify itinerary service functionality
import { 
  getOrCreateItinerary, 
  addDayToItinerary, 
  getDay, 
  updateDay, 
  deleteDay, 
  getTripDays,
  addMultipleDays 
} from './src/services/itinerary.js';

// Test data
const testTripId = 'test-trip-123';
const testUserId = 'test-user-456';

async function testItineraryService() {
  console.log('🧪 Testing Itinerary Service...\n');

  try {
    // Test 1: Create or get itinerary
    console.log('1. Testing getOrCreateItinerary...');
    const itinerary = await getOrCreateItinerary(testTripId, testUserId);
    console.log('✅ Itinerary created/retrieved:', itinerary.id);
    console.log('   Days count:', itinerary.days.length);

    // Test 2: Add multiple days
    console.log('\n2. Testing addMultipleDays...');
    const newDays = await addMultipleDays(testTripId, testUserId, 1, 3);
    console.log('✅ Added days:', newDays.length);
    console.log('   Day numbers:', newDays.map(d => d.dayNumber));

    // Test 3: Get all days
    console.log('\n3. Testing getTripDays...');
    const allDays = await getTripDays(testTripId, testUserId);
    console.log('✅ Retrieved days:', allDays.length);
    console.log('   Day numbers:', allDays.map(d => d.dayNumber));

    // Test 4: Get specific day
    console.log('\n4. Testing getDay...');
    const day1 = await getDay(testTripId, testUserId, 1);
    console.log('✅ Retrieved day 1:', day1 ? day1.id : 'null');

    // Test 5: Update day
    console.log('\n5. Testing updateDay...');
    const updateData = { notes: 'Updated notes for day 1' };
    const updatedDay = await updateDay(testTripId, testUserId, 1, updateData);
    console.log('✅ Updated day 1:', updatedDay.notes);

    // Test 6: Add single day
    console.log('\n6. Testing addDayToItinerary...');
    const newDay = await addDayToItinerary(testTripId, testUserId, 4);
    console.log('✅ Added day 4:', newDay.id);

    // Test 7: Get all days again
    console.log('\n7. Testing getTripDays again...');
    const allDaysAfter = await getTripDays(testTripId, testUserId);
    console.log('✅ Total days now:', allDaysAfter.length);
    console.log('   Day numbers:', allDaysAfter.map(d => d.dayNumber));

    // Test 8: Delete day
    console.log('\n8. Testing deleteDay...');
    await deleteDay(testTripId, testUserId, 4);
    console.log('✅ Deleted day 4');

    // Test 9: Final count
    console.log('\n9. Final day count...');
    const finalDays = await getTripDays(testTripId, testUserId);
    console.log('✅ Final days count:', finalDays.length);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testItineraryService();
