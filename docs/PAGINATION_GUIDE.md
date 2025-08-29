# Pagination Implementation Guide

This guide explains how to use the pagination features implemented in the Tabi travel app.

## Overview

The pagination system provides efficient data loading for large datasets using:

- **Cursor-based pagination** for Firestore queries (trips)
- **Index-based pagination** for in-memory data (activities)
- **React hooks** for state management
- **Reusable components** for UI controls

## Key Features

### 1. Firestore Cursor Pagination
- Uses `startAfter()` for efficient large dataset querying
- Configurable page sizes (1-50 items)
- Multiple sort orders supported
- Search integration with pagination

### 2. Activity Pagination  
- Client-side pagination for activity arrays
- Filtering by date and search terms
- Cross-day activity aggregation
- Sorting by time or creation date

### 3. React Hooks
- `usePagination` - Generic pagination state management
- `useTripPagination` - Specialized for trip data
- `useActivityPagination` - Specialized for activity data

### 4. UI Components
- `PaginationControls` - Load more, refresh, stats display
- `PaginatedTripList` - Complete paginated trip list
- Integration with existing `TripList` component

## Usage Examples

### Basic Trip Pagination

```javascript
import { useTripPagination } from '../hooks/usePagination';
import { getUserTripsPaginated } from '../services/trips';

const MyTripList = () => {
  const { user } = useAuth();
  const pagination = useTripPagination({ initialPageSize: 10 });
  
  const {
    data: trips,
    loading,
    hasMore,
    loadFirstPage,
    loadNextPage
  } = pagination;

  useEffect(() => {
    if (user?.uid) {
      loadFirstPage(getUserTripsPaginated, user.uid);
    }
  }, [user?.uid]);

  return (
    <FlatList
      data={trips}
      onEndReached={() => loadNextPage(getUserTripsPaginated, user.uid)}
      // ... other props
    />
  );
};
```

### Search with Pagination

```javascript
import { searchTripsPaginated } from '../services/trips';

const SearchResults = ({ searchTerm }) => {
  const pagination = useTripPagination();
  
  useEffect(() => {
    if (searchTerm && user?.uid) {
      pagination.loadFirstPage(searchTripsPaginated, user.uid, searchTerm);
    }
  }, [searchTerm, user?.uid]);

  // ... render logic
};
```

### Activity Pagination

```javascript
import { getDayActivitiesPaginated } from '../services/itinerary';
import { useActivityPagination } from '../hooks/usePagination';

const DayActivities = ({ tripId, dayIndex }) => {
  const { user } = useAuth();
  const pagination = useActivityPagination({ initialPageSize: 20 });

  useEffect(() => {
    if (tripId && user?.uid) {
      pagination.loadFirstPage(getDayActivitiesPaginated, tripId, user.uid, dayIndex);
    }
  }, [tripId, user?.uid, dayIndex]);

  // ... render logic
};
```

## API Reference

### Services

#### `getUserTripsPaginated(userId, options)`
Returns paginated trips for a user.

**Options:**
- `pageSize` (number): Items per page (default: 10, max: 50)
- `lastTrip` (DocumentSnapshot): Cursor for next page
- `orderField` (string): Field to sort by ('createdAt', 'startDate', etc.)
- `orderDirection` (string): 'asc' or 'desc'

**Returns:**
```javascript
{
  trips: Trip[],
  lastDocument: DocumentSnapshot,
  hasMore: boolean,
  pageSize: number,
  totalRetrieved: number
}
```

#### `searchTripsPaginated(userId, searchTerm, options)`
Search trips with pagination support.

#### `getDayActivitiesPaginated(tripId, userId, dayIndex, options)`
Get activities for a specific day with pagination.

#### `getAllTripActivitiesPaginated(tripId, userId, options)`
Get all activities across all days with filtering and pagination.

### Hooks

#### `usePagination(options)`
Generic pagination hook.

**Options:**
- `initialPageSize` (number): Starting page size
- `maxPageSize` (number): Maximum allowed page size  
- `type` (string): 'cursor' or 'index'
- `onLoadMore` (function): Auto-load callback

**Returns:**
```javascript
{
  // State
  data: any[],
  loading: boolean,
  error: string,
  hasMore: boolean,
  totalLoaded: number,
  
  // Actions
  loadFirstPage: (fn, ...args) => Promise,
  loadNextPage: (fn, ...args) => Promise,
  refresh: (fn, ...args) => Promise,
  updateItem: (id, data) => void,
  removeItem: (id) => void,
  clear: () => void
}
```

#### `useTripPagination(options)`
Specialized hook for trip pagination (cursor-based).

#### `useActivityPagination(options)`
Specialized hook for activity pagination (index-based).

### Components

#### `PaginationControls`
Displays pagination controls and statistics.

**Props:**
- `loading` (boolean): Loading state
- `hasMore` (boolean): More data available
- `totalLoaded` (number): Items currently loaded
- `onLoadMore` (function): Load more callback
- `onRefresh` (function): Refresh callback
- `showStats` (boolean): Show item counts
- `showRefresh` (boolean): Show refresh button

#### `PaginatedTripList`
Complete trip list with pagination.

**Props:**
- `searchTerm` (string): Filter trips by search
- `pageSize` (number): Items per page
- `orderField` (string): Sort field
- `onTripPress` (function): Trip selection callback
- `onCreateTrip` (function): Create trip callback

## Performance Considerations

### Firestore Queries
- **Index Requirements**: Ensure composite indexes exist for `userId` + sort field
- **Page Size**: Larger pages reduce round trips but increase memory usage
- **Cursor Storage**: Store last document references for navigation

### Memory Management
- **Data Cleanup**: Use `clear()` when navigating away
- **Component Unmounting**: Clean up subscriptions
- **Large Lists**: Consider virtual scrolling for 100+ items

### Best Practices

1. **Page Sizes**
   - Trips: 10-20 items per page
   - Activities: 20-50 items per page
   - Search: Smaller pages (5-10) for faster results

2. **Error Handling**
   - Implement retry logic for failed requests
   - Show meaningful error messages
   - Graceful degradation when offline

3. **User Experience**
   - Loading indicators for initial and subsequent loads
   - Pull-to-refresh functionality
   - Infinite scroll with load more buttons

4. **Caching**
   - Keep loaded data in memory during session
   - Refresh data when returning from background
   - Consider persistence for offline access

## Firestore Index Requirements

Add these indexes to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips", 
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "startDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Testing

Run pagination tests:

```javascript
import { runAllPaginationTests } from '../services/__tests__/pagination.test';

// Test with a sample trip ID
runAllPaginationTests('sample-trip-id');
```

## Migration Guide

### From Non-Paginated to Paginated

1. **Update Service Calls**
   ```javascript
   // Old
   const trips = await getUserTrips(userId);
   
   // New
   const result = await getUserTripsPaginated(userId, { pageSize: 10 });
   const trips = result.trips;
   ```

2. **Add Pagination Hooks**
   ```javascript
   // Replace manual state management
   const [trips, setTrips] = useState([]);
   const [loading, setLoading] = useState(false);
   
   // With pagination hook
   const pagination = useTripPagination();
   ```

3. **Update Components**
   ```javascript
   // Add pagination controls
   <PaginationControls
     loading={pagination.loading}
     hasMore={pagination.hasMore}
     onLoadMore={handleLoadMore}
   />
   ```

## Future Enhancements

1. **Real-time Updates**: Integrate with onSnapshot for live data
2. **Offline Pagination**: Cache pages locally with AsyncStorage  
3. **Virtual Scrolling**: Handle thousands of items efficiently
4. **Smart Prefetching**: Load next page in background
5. **Search Optimization**: Server-side search with Algolia/Elasticsearch

## Troubleshooting

### Common Issues

**"Missing index" errors**
- Add required composite indexes to Firestore
- Deploy indexes with `firebase deploy --only firestore:indexes`

**Slow performance**
- Reduce page sizes
- Check network conditions
- Verify index usage in Firestore console

**Memory leaks**
- Call `clear()` when unmounting components
- Remove event listeners properly
- Use useCallback for event handlers

**Inconsistent results**
- Ensure consistent ordering in queries
- Handle timezone issues with dates
- Use server timestamps for consistency
