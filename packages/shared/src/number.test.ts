import { describe, it, expect } from 'vitest';
import { formatVn, parseVn, formatCompactVn } from './number';

describe('number.ts - Vietnamese number formatting', () => {
  describe('formatVn', () => {
    it('formats integers with thousand separators', () => {
      expect(formatVn(1000)).toBe('1.000');
      expect(formatVn(100000)).toBe('100.000');
      expect(formatVn(1500000)).toBe('1.500.000');
      expect(formatVn(0)).toBe('0');
    });

    it('formats negative numbers', () => {
      expect(formatVn(-5000)).toBe('-5.000');
      expect(formatVn(-100000)).toBe('-100.000');
    });

    it('formats decimals with comma as decimal separator (vi-VN locale)', () => {
      expect(formatVn(1.5)).toBe('1,5');
      expect(formatVn(1.25)).toBe('1,25');
      expect(formatVn(1.125)).toBe('1,125');
      expect(formatVn(1.1234)).toBe('1,123');
    });

    it('handles string input', () => {
      expect(formatVn('1000')).toBe('1.000');
      expect(formatVn('100000')).toBe('100.000');
    });

    it('returns 0 for invalid input', () => {
      expect(formatVn(NaN)).toBe('0');
      expect(formatVn(Infinity)).toBe('0');
      expect(formatVn('abc')).toBe('0');
    });
  });

  describe('parseVn', () => {
    it('parses formatted Vietnamese numbers', () => {
      expect(parseVn('1.000')).toBe(1000);
      expect(parseVn('100.000')).toBe(100000);
      expect(parseVn('1.500.000')).toBe(1500000);
      expect(parseVn('0')).toBe(0);
    });

    it('parses negative numbers', () => {
      expect(parseVn('-5.000')).toBe(-5000);
    });

    it('returns 0 for invalid input', () => {
      expect(parseVn('abc')).toBe(0);
      expect(parseVn('')).toBe(0);
    });
  });

  describe('formatCompactVn', () => {
    it('formats compact numbers with Vietnamese locale (N=nghìn, Tr=triệu)', () => {
      // vi-VN uses N for nghìn (thousand), Tr for triệu (million)
      expect(formatCompactVn(1000)).toMatch(/1\s*N/i);
      expect(formatCompactVn(1000000)).toMatch(/1\s*Tr/i);
      expect(formatCompactVn(1500)).toMatch(/1,5\s*N/i);
    });
  });

  describe('round-trip', () => {
    it('formatVn -> parseVn returns original for integers', () => {
      const values = [0, 1, 42, 1000, 100000, 1500000, -5000];
      for (const val of values) {
        const formatted = formatVn(val);
        const parsed = parseVn(formatted);
        expect(parsed).toBe(val);
      }
    });
  });
});