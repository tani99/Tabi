const { testTripCollection, testAccessControl } = require('./src/services/__tests__/tripTest.js');

// Mock user IDs for testing
const TEST_USER_ID = 'test-user-123';
const OTHER_USER_ID = 'other-user-456';

async function runTripTests() {
  console.log('🚀 Starting Trip Tests...\n');
  
  try {
    // Run the main trip collection tests
    console.log('=== Running Trip Collection Tests ===');
    const collectionTestResult = await testTripCollection(TEST_USER_ID);
    
    if (collectionTestResult) {
      console.log('\n✅ Trip Collection Tests PASSED!\n');
    } else {
      console.log('\n❌ Trip Collection Tests FAILED!\n');
    }
    
    // Run access control tests
    console.log('=== Running Access Control Tests ===');
    const accessControlResult = await testAccessControl(TEST_USER_ID, OTHER_USER_ID);
    
    if (accessControlResult) {
      console.log('\n✅ Access Control Tests PASSED!\n');
    } else {
      console.log('\n❌ Access Control Tests FAILED!\n');
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTripTests();
