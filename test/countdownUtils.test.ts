import { getTargetDate, getCountdownParts, setTargetDate } from '../src/countdownUtils';

describe('countdownUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    // Set system time to noon on May 21, 2025
    jest.useFakeTimers().setSystemTime(new Date('2025-05-21T12:00:00Z').getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTargetDate', () => {
    it('returns stored date if valid', () => {
      const timestamp = 1745606400000;
      localStorage.setItem('targetDate', String(timestamp));
      expect(getTargetDate()).toBe(timestamp);
    });

    it('returns default date if no stored date (end of day in 3 days)', () => {
      const expected = (() => {
        const d = new Date('2025-05-21T12:00:00Z');
        d.setDate(d.getDate() + 3);
        d.setHours(23, 59, 59, 999);
        return d.getTime();
      })();
      
      const result = getTargetDate();
      const resultDate = new Date(result);
      
      expect(result).toBe(expected);
      expect(resultDate.getHours()).toBe(23);
      expect(resultDate.getMinutes()).toBe(59);
      expect(resultDate.getSeconds()).toBe(59);
      expect(resultDate.getMilliseconds()).toBe(999);
    });

    it('returns default date if stored date is invalid', () => {
      localStorage.setItem('targetDate', 'not-a-number');
      const expected = (() => {
        const d = new Date('2025-05-21T12:00:00Z');
        d.setDate(d.getDate() + 3);
        d.setHours(23, 59, 59, 999); // Set to end of day like the implementation
        return d.getTime();
      })();
      
      const result = getTargetDate();
      const resultDate = new Date(result);
      
      expect(result).toBe(expected);
      expect(resultDate.getHours()).toBe(23);
      expect(resultDate.getMinutes()).toBe(59);
      expect(resultDate.getSeconds()).toBe(59);
      expect(resultDate.getMilliseconds()).toBe(999);
    });

    it('throws error if setting invalid date', () => {
      expect(() => setTargetDate(NaN)).toThrow('Invalid date provided');
    });
  });

  describe('getCountdownParts', () => {
    it('returns correct countdown parts for 1 day ahead', () => {
      const now = new Date('2025-05-21T12:00:00Z').getTime();
      const target = now + 24 * 60 * 60 * 1000 + 3600 * 1000 + 60 * 1000 + 1000; // 1d 1h 1m 1s
      const parts = getCountdownParts(target);
      expect(parts.days).toBe(1);
      expect(parts.hours).toBe(1);
      expect(parts.minutes).toBe(1);
      expect(parts.seconds).toBe(1);
      expect(parts.distance).toBe(target - now);
    });

    it('clamps negative values to zero', () => {
      const now = new Date('2025-05-21T12:00:00Z').getTime();
      const target = now - 10000;
      const parts = getCountdownParts(target);
      expect(parts.days).toBe(0);
      expect(parts.hours).toBe(0);
      expect(parts.minutes).toBe(0);
      expect(parts.seconds).toBe(0);
      expect(parts.distance).toBeLessThan(0);
    });
  });

  describe('setTargetDate', () => {
    it('sets the target date in localStorage', () => {
      const timestamp = 1234567890;
      setTargetDate(timestamp);
      expect(localStorage.getItem('targetDate')).toBe(String(timestamp));
    });
  });
});
