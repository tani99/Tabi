import { 
  getOrCreateItinerary, 
  addDayToItinerary, 
  getDay, 
  updateDay, 
  deleteDay, 
  getTripDays,
  addMultipleDays 
} from '../itinerary';

// Mock Firebase Firestore
jest.mock('../../config/firebase', () => ({
  db: {}
}));

// Mock Firebase Firestore functions
const mockAddDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockServerTimestamp = jest.fn(() => new Date());
const mockWriteBatch = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  serverTimestamp: mockServerTimestamp,
  writeBatch: mockWriteBatch
}));

describe('Itinerary Service', () => {
  const mockTripId = 'trip_123';
  const mockUserId = 'user_456';
  const mockItineraryId = 'itinerary_789';
  const mockDayId = 'day_101';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock behavior
    mockCollection.mockReturnValue('mock-collection');
    mockQuery.mockReturnValue('mock-query');
    mockWhere.mockReturnValue('mock-where');
    mockOrderBy.mockReturnValue('mock-orderBy');
  });

  describe('getOrCreateItinerary', () => {
    it('should create a new itinerary when none exists', async () => {
      // Mock empty query result
      mockGetDocs.mockResolvedValueOnce({ empty: true });
      
      // Mock successful document creation
      mockAddDoc.mockResolvedValueOnce({ id: mockItineraryId });

      const result = await getOrCreateItinerary(mockTripId, mockUserId);

      expect(result).toEqual({
        id: mockItineraryId,
        tripId: mockTripId,
        userId: mockUserId,
        title: `Itinerary for Trip ${mockTripId}`,
        days: []
      });
    });

    it('should return existing itinerary when found', async () => {
      const mockItineraryData = {
        id: mockItineraryId,
        tripId: mockTripId,
        userId: mockUserId,
        title: 'Existing Itinerary'
      };

      const mockDaysData = [
        { id: 'day_1', dayNumber: 1, activities: [] },
        { id: 'day_2', dayNumber: 2, activities: [] }
      ];

      // Mock existing itinerary query
      mockGetDocs
        .mockResolvedValueOnce({ 
          empty: false, 
          docs: [{ id: mockItineraryId, data: () => mockItineraryData }] 
        })
        .mockResolvedValueOnce({ 
          docs: mockDaysData.map(day => ({ id: day.id, data: () => day })) 
        });

      const result = await getOrCreateItinerary(mockTripId, mockUserId);

      expect(result).toEqual({
        ...mockItineraryData,
        days: mockDaysData
      });
    });

    it('should throw error for missing tripId', async () => {
      await expect(getOrCreateItinerary(null, mockUserId))
        .rejects.toThrow('Trip ID is required');
    });

    it('should throw error for missing userId', async () => {
      await expect(getOrCreateItinerary(mockTripId, null))
        .rejects.toThrow('User ID is required');
    });
  });

  describe('addDayToItinerary', () => {
    it('should add a new day successfully', async () => {
      const mockItinerary = {
        id: mockItineraryId,
        tripId: mockTripId,
        userId: mockUserId
      };

      // Mock getOrCreateItinerary
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => mockItinerary }] })
        .mockResolvedValueOnce({ empty: true }); // No existing day

      mockAddDoc.mockResolvedValueOnce({ id: mockDayId });

      const result = await addDayToItinerary(mockTripId, mockUserId, 1);

      expect(result).toEqual({
        id: mockDayId,
        itineraryId: mockItineraryId,
        tripId: mockTripId,
        userId: mockUserId,
        dayNumber: 1
      });
    });

    it('should throw error if day already exists', async () => {
      const mockItinerary = {
        id: mockItineraryId,
        tripId: mockTripId,
        userId: mockUserId
      };

      // Mock getOrCreateItinerary
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => mockItinerary }] })
        .mockResolvedValueOnce({ empty: false }); // Day already exists

      await expect(addDayToItinerary(mockTripId, mockUserId, 1))
        .rejects.toThrow('Day 1 already exists in this itinerary');
    });
  });

  describe('getDay', () => {
    it('should return day data when found', async () => {
      const mockDayData = {
        id: mockDayId,
        dayNumber: 1,
        activities: []
      };

      // Mock itinerary query
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => ({ id: mockItineraryId }) }] })
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockDayId, data: () => mockDayData }] });

      const result = await getDay(mockTripId, mockUserId, 1);

      expect(result).toEqual({
        id: mockDayId,
        dayNumber: 1,
        activities: []
      });
    });

    it('should return null when day not found', async () => {
      // Mock itinerary query
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => ({ id: mockItineraryId }) }] })
        .mockResolvedValueOnce({ empty: true }); // Day not found

      const result = await getDay(mockTripId, mockUserId, 1);

      expect(result).toBeNull();
    });
  });

  describe('updateDay', () => {
    it('should update day successfully', async () => {
      const mockDayData = {
        id: mockDayId,
        dayNumber: 1,
        activities: []
      };

      // Mock getDay
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => ({ id: mockItineraryId }) }] })
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockDayId, data: () => mockDayData }] });

      mockUpdateDoc.mockResolvedValueOnce();

      const updateData = { activities: [{ title: 'New Activity' }] };
      const result = await updateDay(mockTripId, mockUserId, 1, updateData);

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockDayData,
        ...updateData,
        updatedAt: expect.any(Date)
      });
    });

    it('should throw error when day not found', async () => {
      // Mock getDay returning null
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => ({ id: mockItineraryId }) }] })
        .mockResolvedValueOnce({ empty: true });

      await expect(updateDay(mockTripId, mockUserId, 1, { activities: [] }))
        .rejects.toThrow('Day 1 not found');
    });
  });

  describe('deleteDay', () => {
    it('should delete day successfully', async () => {
      const mockDayData = {
        id: mockDayId,
        dayNumber: 1
      };

      // Mock getDay
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => ({ id: mockItineraryId }) }] })
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockDayId, data: () => mockDayData }] });

      mockDeleteDoc.mockResolvedValueOnce();

      const result = await deleteDay(mockTripId, mockUserId, 1);

      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getTripDays', () => {
    it('should return all days for a trip', async () => {
      const mockDaysData = [
        { id: 'day_1', dayNumber: 1, activities: [] },
        { id: 'day_2', dayNumber: 2, activities: [] }
      ];

      // Mock itinerary query
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => ({ id: mockItineraryId }) }] })
        .mockResolvedValueOnce({ docs: mockDaysData.map(day => ({ id: day.id, data: () => day })) });

      const result = await getTripDays(mockTripId, mockUserId);

      expect(result).toEqual(mockDaysData);
    });
  });

  describe('addMultipleDays', () => {
    it('should add multiple days successfully', async () => {
      const mockItinerary = {
        id: mockItineraryId,
        tripId: mockTripId,
        userId: mockUserId
      };

      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue()
      };

      mockWriteBatch.mockReturnValue(mockBatch);
      mockDoc.mockReturnValue({ id: 'new_day_id' });

      // Mock getOrCreateItinerary
      mockGetDocs
        .mockResolvedValueOnce({ empty: false, docs: [{ id: mockItineraryId, data: () => mockItinerary }] })
        .mockResolvedValue({ empty: true }); // No existing days

      const result = await addMultipleDays(mockTripId, mockUserId, 1, 3);

      expect(mockBatch.set).toHaveBeenCalledTimes(3);
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });
  });
});
