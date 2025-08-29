import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing pagination state and operations
 * Supports both cursor-based (Firestore) and index-based pagination
 */
export const usePagination = (options = {}) => {
  const {
    initialPageSize = 10,
    maxPageSize = 50,
    type = 'cursor', // 'cursor' for Firestore, 'index' for array-based
    onLoadMore = null // Callback when more data is needed
  } = options;

  // Pagination state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(Math.min(Math.max(1, initialPageSize), maxPageSize));
  
  // Cursor-based pagination state (Firestore)
  const [lastDocument, setLastDocument] = useState(null);
  
  // Index-based pagination state (arrays)
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Total counts
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(null);

  /**
   * Load the first page of data
   */
  const loadFirstPage = useCallback(async (loadFunction, ...args) => {
    setLoading(true);
    setError(null);
    setData([]);
    setLastDocument(null);
    setCurrentIndex(0);
    setTotalLoaded(0);
    
    try {
      const result = await loadFunction(...args, {
        pageSize,
        lastTrip: null, // Reset cursor
        startIndex: 0
      });
      
      if (type === 'cursor') {
        // Handle Firestore cursor-based pagination
        setData(result.trips || result.activities || []);
        setLastDocument(result.lastDocument);
        setHasMore(result.hasMore);
        setTotalLoaded(result.totalRetrieved || 0);
      } else {
        // Handle index-based pagination
        setData(result.activities || result.items || []);
        setCurrentIndex(result.nextStartIndex || 0);
        setHasMore(result.hasMore);
        setTotalLoaded(result.totalRetrieved || 0);
        setTotalAvailable(result.totalActivities || result.totalItems || null);
      }
      
    } catch (err) {
      console.error('Error loading first page:', err);
      setError(err.message || 'Failed to load data');
      setData([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [pageSize, type]);

  /**
   * Load the next page and append to existing data
   */
  const loadNextPage = useCallback(async (loadFunction, ...args) => {
    if (!hasMore || loading) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const options = type === 'cursor' 
        ? { pageSize, lastTrip: lastDocument }
        : { pageSize, startIndex: currentIndex };
        
      const result = await loadFunction(...args, options);
      
      if (type === 'cursor') {
        // Handle Firestore cursor-based pagination
        const newData = result.trips || result.activities || [];
        setData(prevData => [...prevData, ...newData]);
        setLastDocument(result.lastDocument);
        setHasMore(result.hasMore);
        setTotalLoaded(prev => prev + (result.totalRetrieved || 0));
      } else {
        // Handle index-based pagination
        const newData = result.activities || result.items || [];
        setData(prevData => [...prevData, ...newData]);
        setCurrentIndex(result.nextStartIndex || currentIndex);
        setHasMore(result.hasMore);
        setTotalLoaded(prev => prev + (result.totalRetrieved || 0));
        setTotalAvailable(result.totalActivities || result.totalItems || null);
      }
      
    } catch (err) {
      console.error('Error loading next page:', err);
      setError(err.message || 'Failed to load more data');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, pageSize, type, lastDocument, currentIndex]);

  /**
   * Refresh the entire dataset
   */
  const refresh = useCallback(async (loadFunction, ...args) => {
    await loadFirstPage(loadFunction, ...args);
  }, [loadFirstPage]);

  /**
   * Update page size and reload
   */
  const updatePageSize = useCallback(async (newPageSize, loadFunction, ...args) => {
    const validPageSize = Math.min(Math.max(1, newPageSize), maxPageSize);
    setPageSize(validPageSize);
    
    if (loadFunction) {
      await loadFirstPage(loadFunction, ...args);
    }
  }, [maxPageSize, loadFirstPage]);

  /**
   * Add new item to the beginning of the list (for real-time updates)
   */
  const prependItem = useCallback((item) => {
    setData(prevData => [item, ...prevData]);
    setTotalLoaded(prev => prev + 1);
    if (totalAvailable !== null) {
      setTotalAvailable(prev => prev + 1);
    }
  }, [totalAvailable]);

  /**
   * Update an existing item in the list
   */
  const updateItem = useCallback((itemId, updateData, idField = 'id') => {
    setData(prevData => 
      prevData.map(item => 
        item[idField] === itemId 
          ? { ...item, ...updateData }
          : item
      )
    );
  }, []);

  /**
   * Remove an item from the list
   */
  const removeItem = useCallback((itemId, idField = 'id') => {
    setData(prevData => prevData.filter(item => item[idField] !== itemId));
    setTotalLoaded(prev => Math.max(0, prev - 1));
    if (totalAvailable !== null) {
      setTotalAvailable(prev => Math.max(0, prev - 1));
    }
  }, [totalAvailable]);

  /**
   * Clear all data
   */
  const clear = useCallback(() => {
    setData([]);
    setLastDocument(null);
    setCurrentIndex(0);
    setTotalLoaded(0);
    setTotalAvailable(null);
    setHasMore(true);
    setError(null);
  }, []);

  // Trigger onLoadMore callback when appropriate
  useEffect(() => {
    if (onLoadMore && hasMore && !loading && data.length > 0) {
      // Check if we're near the end of current data
      const threshold = Math.min(5, Math.floor(pageSize / 2));
      if (data.length - threshold <= totalLoaded) {
        onLoadMore();
      }
    }
  }, [data.length, totalLoaded, hasMore, loading, pageSize, onLoadMore]);

  return {
    // Data state
    data,
    loading,
    error,
    hasMore,
    totalLoaded,
    totalAvailable,
    pageSize,
    
    // Pagination info
    isFirstPage: totalLoaded === 0,
    currentPage: type === 'cursor' ? Math.ceil(totalLoaded / pageSize) : Math.floor(currentIndex / pageSize) + 1,
    
    // Actions
    loadFirstPage,
    loadNextPage,
    refresh,
    updatePageSize,
    prependItem,
    updateItem,
    removeItem,
    clear,
    
    // Utilities
    canLoadMore: hasMore && !loading,
    isEmpty: data.length === 0 && !loading,
    hasError: !!error
  };
};

/**
 * Specialized hook for trip pagination using Firestore cursors
 */
export const useTripPagination = (options = {}) => {
  return usePagination({
    ...options,
    type: 'cursor',
    initialPageSize: options.initialPageSize || 10
  });
};

/**
 * Specialized hook for activity pagination using array indices
 */
export const useActivityPagination = (options = {}) => {
  return usePagination({
    ...options,
    type: 'index',
    initialPageSize: options.initialPageSize || 20
  });
};

export default usePagination;
