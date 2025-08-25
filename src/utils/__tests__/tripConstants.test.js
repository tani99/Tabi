import { TRIP_STATUS, inferTripStatus } from '../tripConstants';

describe('tripConstants', () => {
  describe('inferTripStatus', () => {
    beforeEach(() => {
      // Mock the current date to a fixed value for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-12-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should infer UPCOMING status for future trips', () => {
      const startDate = new Date('2024-12-20');
      const endDate = new Date('2024-12-25');
      
      const status = inferTripStatus(startDate, endDate);
      expect(status).toBe(TRIP_STATUS.UPCOMING);
    });

    it('should infer ONGOING status for current trips', () => {
      const startDate = new Date('2024-12-10');
      const endDate = new Date('2024-12-20');
      
      const status = inferTripStatus(startDate, endDate);
      expect(status).toBe(TRIP_STATUS.ONGOING);
    });

    it('should infer ONGOING status when today is the start date', () => {
      const startDate = new Date('2024-12-15');
      const endDate = new Date('2024-12-20');
      
      const status = inferTripStatus(startDate, endDate);
      expect(status).toBe(TRIP_STATUS.ONGOING);
    });

    it('should infer ONGOING status when today is the end date', () => {
      const startDate = new Date('2024-12-10');
      const endDate = new Date('2024-12-15');
      
      const status = inferTripStatus(startDate, endDate);
      expect(status).toBe(TRIP_STATUS.ONGOING);
    });

    it('should infer COMPLETED status for past trips', () => {
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-10');
      
      const status = inferTripStatus(startDate, endDate);
      expect(status).toBe(TRIP_STATUS.COMPLETED);
    });

    it('should default to UPCOMING when dates are missing', () => {
      expect(inferTripStatus(null, new Date())).toBe(TRIP_STATUS.UPCOMING);
      expect(inferTripStatus(new Date(), null)).toBe(TRIP_STATUS.UPCOMING);
      expect(inferTripStatus(null, null)).toBe(TRIP_STATUS.UPCOMING);
    });

    it('should handle string dates correctly', () => {
      const startDate = '2024-12-20';
      const endDate = '2024-12-25';
      
      const status = inferTripStatus(startDate, endDate);
      expect(status).toBe(TRIP_STATUS.UPCOMING);
    });
  });
});
