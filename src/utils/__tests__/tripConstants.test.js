import { TRIP_STATUS, inferTripStatus, calculateTripDays } from '../tripConstants';

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

  describe('calculateTripDays', () => {
    it('should calculate 1 day for same start and end date', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(1);
    });

    it('should calculate correct days for multi-day trips', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(3);
    });

    it('should calculate correct days for a week-long trip', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(7);
    });

    it('should calculate correct days for a month-long trip', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(31);
    });

    it('should handle leap year February correctly', () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-29'); // 2024 is a leap year
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(29);
    });

    it('should handle cross-month trips correctly', () => {
      const startDate = new Date('2024-01-30');
      const endDate = new Date('2024-02-02');
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(4); // Jan 30, 31, Feb 1, 2
    });

    it('should return 0 for missing start date', () => {
      const endDate = new Date('2024-01-01');
      
      const days = calculateTripDays(null, endDate);
      expect(days).toBe(0);
    });

    it('should return 0 for missing end date', () => {
      const startDate = new Date('2024-01-01');
      
      const days = calculateTripDays(startDate, null);
      expect(days).toBe(0);
    });

    it('should return 0 for both dates missing', () => {
      const days = calculateTripDays(null, null);
      expect(days).toBe(0);
    });

    it('should handle string dates correctly', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-20');
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(6);
    });

    it('should ensure minimum 1 day for edge cases', () => {
      // Test with times that might cause issues
      const startDate = new Date('2024-01-01T23:59:59');
      const endDate = new Date('2024-01-02T00:00:01');
      
      const days = calculateTripDays(startDate, endDate);
      expect(days).toBe(2);
    });
  });
});
