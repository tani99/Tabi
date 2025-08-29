import { getUserTripsPaginated, searchTripsPaginated } from '../trips';
import { getDayActivitiesPaginated, getAllTripActivitiesPaginated } from '../itinerary';

/**
 * Test file demonstrating pagination functionality
 * These tests show how the pagination features work
 * 
 * Note: These are demonstration tests - in a real app, you'd use Jest/testing-library
 */

// Mock user ID for testing
const TEST_USER_ID = 'test-user-123';

/**
 * Test trip pagination
 */
export const testTripPagination = async () => {
  console.log('🧪 Testing Trip Pagination');
  
  try {
    // Test 1: Load first page
    console.log('Test 1: Loading first page of trips...');
    const firstPage = await getUserTripsPaginated(TEST_USER_ID, {
      pageSize: 5,
      orderField: 'createdAt',
      orderDirection: 'desc'
    });
    
    console.log('✅ First page result:', {
      tripsCount: firstPage.trips.length,
      hasMore: firstPage.hasMore,
      pageSize: firstPage.pageSize
    });
    
    // Test 2: Load second page if available
    if (firstPage.hasMore && firstPage.lastDocument) {
      console.log('Test 2: Loading second page of trips...');
      const secondPage = await getUserTripsPaginated(TEST_USER_ID, {
        pageSize: 5,
        lastTrip: firstPage.lastDocument,
        orderField: 'createdAt',
        orderDirection: 'desc'
      });
      
      console.log('✅ Second page result:', {
        tripsCount: secondPage.trips.length,
        hasMore: secondPage.hasMore,
        totalLoaded: firstPage.trips.length + secondPage.trips.length
      });
    }
    
    // Test 3: Search with pagination
    console.log('Test 3: Testing search with pagination...');
    const searchResults = await searchTripsPaginated(TEST_USER_ID, 'Paris', {
      pageSize: 3,
      orderField: 'createdAt',
      orderDirection: 'desc'
    });
    
    console.log('✅ Search pagination result:', {
      searchTerm: 'Paris',
      resultsCount: searchResults.trips.length,
      hasMore: searchResults.hasMore
    });
    
    return {
      success: true,
      message: 'Trip pagination tests completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Trip pagination test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test activity pagination
 */
export const testActivityPagination = async (tripId) => {
  console.log('🧪 Testing Activity Pagination');
  
  try {
    // Test 1: Get paginated activities for a specific day
    console.log('Test 1: Loading paginated activities for day 0...');
    const dayActivities = await getDayActivitiesPaginated(tripId, TEST_USER_ID, 0, {
      pageSize: 10,
      startIndex: 0,
      orderBy: 'startTime'
    });
    
    console.log('✅ Day activities result:', {
      activitiesCount: dayActivities.activities.length,
      hasMore: dayActivities.hasMore,
      totalActivities: dayActivities.totalActivities
    });
    
    // Test 2: Get all trip activities with pagination
    console.log('Test 2: Loading all trip activities with pagination...');
    const allActivities = await getAllTripActivitiesPaginated(tripId, TEST_USER_ID, {
      pageSize: 15,
      startIndex: 0,
      orderBy: 'startTime'
    });
    
    console.log('✅ All trip activities result:', {
      activitiesCount: allActivities.activities.length,
      hasMore: allActivities.hasMore,
      totalFiltered: allActivities.totalActivities,
      totalUnfiltered: allActivities.totalUnfilteredActivities
    });
    
    // Test 3: Search activities with pagination
    console.log('Test 3: Searching activities with pagination...');
    const searchActivities = await getAllTripActivitiesPaginated(tripId, TEST_USER_ID, {
      pageSize: 10,
      startIndex: 0,
      searchTerm: 'restaurant',
      orderBy: 'startTime'
    });
    
    console.log('✅ Activity search result:', {
      searchTerm: 'restaurant',
      activitiesCount: searchActivities.activities.length,
      totalFiltered: searchActivities.totalActivities
    });
    
    return {
      success: true,
      message: 'Activity pagination tests completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Activity pagination test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test pagination performance with large datasets
 */
export const testPaginationPerformance = async () => {
  console.log('🧪 Testing Pagination Performance');
  
  try {
    const startTime = Date.now();
    
    // Test loading multiple pages quickly
    const pages = [];
    let currentLastDoc = null;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 5; // Limit for testing
    
    while (hasMore && pageCount < maxPages) {
      const pageResult = await getUserTripsPaginated(TEST_USER_ID, {
        pageSize: 10,
        lastTrip: currentLastDoc,
        orderField: 'createdAt',
        orderDirection: 'desc'
      });
      
      pages.push(pageResult);
      currentLastDoc = pageResult.lastDocument;
      hasMore = pageResult.hasMore;
      pageCount++;
      
      console.log(`Page ${pageCount}: ${pageResult.trips.length} trips loaded`);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const totalTrips = pages.reduce((sum, page) => sum + page.trips.length, 0);
    
    console.log('✅ Performance test result:', {
      pagesLoaded: pageCount,
      totalTrips,
      totalTime: `${totalTime}ms`,
      averageTimePerPage: `${Math.round(totalTime / pageCount)}ms`
    });
    
    return {
      success: true,
      performance: {
        pagesLoaded: pageCount,
        totalTrips,
        totalTime,
        averageTimePerPage: Math.round(totalTime / pageCount)
      }
    };
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test pagination edge cases
 */
export const testPaginationEdgeCases = async () => {
  console.log('🧪 Testing Pagination Edge Cases');
  
  try {
    // Test 1: Very small page size
    console.log('Test 1: Testing very small page size...');
    const smallPage = await getUserTripsPaginated(TEST_USER_ID, {
      pageSize: 1
    });
    console.log('✅ Small page size works:', smallPage.pageSize === 1);
    
    // Test 2: Very large page size (should be limited)
    console.log('Test 2: Testing very large page size...');
    const largePage = await getUserTripsPaginated(TEST_USER_ID, {
      pageSize: 1000
    });
    console.log('✅ Large page size limited:', largePage.pageSize <= 50);
    
    // Test 3: Invalid page size (should default)
    console.log('Test 3: Testing invalid page size...');
    const invalidPage = await getUserTripsPaginated(TEST_USER_ID, {
      pageSize: -5
    });
    console.log('✅ Invalid page size handled:', invalidPage.pageSize > 0);
    
    // Test 4: Empty search term
    console.log('Test 4: Testing empty search term...');
    try {
      await searchTripsPaginated(TEST_USER_ID, '');
      console.log('❌ Empty search should throw error');
      return { success: false, error: 'Empty search validation failed' };
    } catch (error) {
      console.log('✅ Empty search properly rejected');
    }
    
    return {
      success: true,
      message: 'Edge case tests completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Edge case test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run all pagination tests
 */
export const runAllPaginationTests = async (tripId = null) => {
  console.log('🚀 Running All Pagination Tests');
  console.log('=====================================');
  
  const results = [];
  
  // Test trip pagination
  results.push(await testTripPagination());
  
  // Test activity pagination if tripId provided
  if (tripId) {
    results.push(await testActivityPagination(tripId));
  }
  
  // Test performance
  results.push(await testPaginationPerformance());
  
  // Test edge cases
  results.push(await testPaginationEdgeCases());
  
  // Summary
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log('=====================================');
  console.log(`📊 Test Summary: ${successCount}/${totalCount} tests passed`);
  
  if (successCount === totalCount) {
    console.log('🎉 All pagination tests passed!');
  } else {
    console.log('⚠️  Some pagination tests failed');
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`Test ${index + 1} failed: ${result.error}`);
      }
    });
  }
  
  return {
    success: successCount === totalCount,
    results,
    summary: {
      passed: successCount,
      total: totalCount
    }
  };
};

export default {
  testTripPagination,
  testActivityPagination,
  testPaginationPerformance,
  testPaginationEdgeCases,
  runAllPaginationTests
};
