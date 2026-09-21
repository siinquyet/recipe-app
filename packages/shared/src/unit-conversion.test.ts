import { describe, it, expect } from 'vitest';
import {
  getUnitInfo,
  canConvert,
  convertToBase,
  convertFromBase,
  formatQuantity,
  aggregateQuantities,
  scaleQuantity,
  generateShoppingItems,
} from './unit-conversion';

describe('unit-conversion.ts - Unit conversion & aggregation (BR-03, BR-04)', () => {
  describe('getUnitInfo', () => {
    it('returns unit info for known units', () => {
      expect(getUnitInfo('g')).toEqual({ name: 'g', category: 'MASS', toBase: 1 });
      expect(getUnitInfo('kg')).toEqual({ name: 'kg', category: 'MASS', toBase: 1000 });
      expect(getUnitInfo('ml')).toEqual({ name: 'ml', category: 'VOLUME', toBase: 1 });
      expect(getUnitInfo('l')).toEqual({ name: 'l', category: 'VOLUME', toBase: 1000 });
      expect(getUnitInfo('cái')).toEqual({ name: 'cái', category: 'COUNT', toBase: 1 });
    });

    it('returns null for unknown units', () => {
      expect(getUnitInfo('unknown')).toBeNull();
      expect(getUnitInfo('')).toBeNull();
    });

    it('handles case insensitive', () => {
      expect(getUnitInfo('KG')).toEqual({ name: 'kg', category: 'MASS', toBase: 1000 });
      expect(getUnitInfo('Ml')).toEqual({ name: 'ml', category: 'VOLUME', toBase: 1 });
    });
  });

  describe('canConvert', () => {
    it('returns true for same category', () => {
      expect(canConvert('g', 'kg')).toBe(true);
      expect(canConvert('ml', 'l')).toBe(true);
      expect(canConvert('cái', 'quả')).toBe(true);
    });

    it('returns false for different categories', () => {
      expect(canConvert('g', 'ml')).toBe(false);
      expect(canConvert('kg', 'cái')).toBe(false);
    });

    it('returns false for unknown units', () => {
      expect(canConvert('g', 'unknown')).toBe(false);
    });
  });

  describe('convertToBase', () => {
    it('converts to base unit and returns base unit name', () => {
      expect(convertToBase(1, 'kg')).toEqual({ value: 1000, baseUnit: 'g' });
      expect(convertToBase(500, 'g')).toEqual({ value: 500, baseUnit: 'g' });
      expect(convertToBase(2, 'l')).toEqual({ value: 2000, baseUnit: 'ml' });
    });

    it('returns null for unknown units', () => {
      expect(convertToBase(1, 'unknown')).toBeNull();
    });
  });

  describe('convertFromBase', () => {
    it('converts from base unit', () => {
      expect(convertFromBase(1000, 'kg')).toBe(1);
      expect(convertFromBase(2000, 'l')).toBe(2);
    });

    it('returns null for unknown units', () => {
      expect(convertFromBase(1000, 'unknown')).toBeNull();
    });
  });

  describe('formatQuantity', () => {
    it('formats quantity with unit using Vietnamese locale', () => {
      expect(formatQuantity(1000, 'g')).toBe(`1.000 g`);
      expect(formatQuantity(100000, 'g')).toBe(`100.000 g`);
      // vi-VN uses comma for decimal
      expect(formatQuantity(1.5, 'kg')).toBe(`1,5 kg`);
    });
  });

  describe('aggregateQuantities (BR-03)', () => {
    it('aggregates same ingredient with same unit', () => {
      const items = [
        { internalIngredientId: 'ing-1', originalText: '500g thịt bò', quantity: 500, unit: 'g' },
        { internalIngredientId: 'ing-1', originalText: '300g thịt bò', quantity: 300, unit: 'g' },
      ];
      const result = aggregateQuantities(items);
      expect(result.size).toBe(1);
      expect(result.get('ing-1')?.quantity).toBe(800);
      expect(result.get('ing-1')?.unit).toBe('g');
      expect(result.get('ing-1')?.originalTexts).toHaveLength(2);
    });

    it('aggregates same ingredient with convertible units', () => {
      const items = [
        { internalIngredientId: 'ing-1', originalText: '500g thịt bò', quantity: 500, unit: 'g' },
        { internalIngredientId: 'ing-1', originalText: '0.5kg thịt bò', quantity: 0.5, unit: 'kg' },
      ];
      const result = aggregateQuantities(items);
      expect(result.size).toBe(1);
      expect(result.get('ing-1')?.quantity).toBe(1000);
      expect(result.get('ing-1')?.unit).toBe('g');
    });

    it('separates different units that cannot convert', () => {
      const items = [
        { internalIngredientId: 'ing-1', originalText: '500g thịt bò', quantity: 500, unit: 'g' },
        { internalIngredientId: 'ing-1', originalText: '2 cái thịt bò', quantity: 2, unit: 'cái' },
      ];
      const result = aggregateQuantities(items);
      expect(result.size).toBe(2);
    });

    it('separates unmapped ingredients by originalText', () => {
      const items = [
        { originalText: '500g rau ngót', quantity: 500, unit: 'g' },
        { originalText: '500g rau ngót', quantity: 300, unit: 'g' }, // same originalText
      ];
      const result = aggregateQuantities(items);
      expect(result.size).toBe(1);
      const key = result.keys().next().value as string;
      expect(key).toContain('unmapped_');
      expect(result.get(key)?.quantity).toBe(800);
    });
  });

  describe('scaleQuantity (BR-04)', () => {
    it('scales quantity correctly', () => {
      const result = scaleQuantity(500, 4, 6);
      expect(result.quantity).toBe(750);
      expect(result.warning).toBeUndefined();
    });

    it('handles zero base servings', () => {
      const result = scaleQuantity(500, 0, 6);
      expect(result.quantity).toBe(500);
      expect(result.warning).toContain('RECIPE_BASE_SERVINGS_INVALID');
    });

    it('handles negative base servings', () => {
      const result = scaleQuantity(500, -1, 6);
      expect(result.quantity).toBe(500);
      expect(result.warning).toContain('RECIPE_BASE_SERVINGS_INVALID');
    });

    it('handles scale down', () => {
      const result = scaleQuantity(1000, 6, 4);
      expect(result.quantity).toBeCloseTo(666.67, 1);
    });
  });

  describe('generateShoppingItems (BR-03 + BR-04 combined)', () => {
    it('scales then aggregates', () => {
      const recipeIngredients = [
        { internalIngredientId: 'ing-1', originalText: '500g thịt bò', quantity: 500, unit: 'g' },
        { internalIngredientId: 'ing-2', originalText: '300g cà rốt', quantity: 300, unit: 'g' },
      ];
      // Recipe base: 4 servings, target: 6 servings
      const result = generateShoppingItems(recipeIngredients, 4, 6);
      expect(result.size).toBe(2);
      expect(result.get('ing-1')?.quantity).toBe(750);
      expect(result.get('ing-2')?.quantity).toBe(450);
    });

    it('aggregates after scaling', () => {
      const recipeIngredients = [
        { internalIngredientId: 'ing-1', originalText: '500g thịt bò', quantity: 500, unit: 'g' },
        { internalIngredientId: 'ing-1', originalText: '300g thịt bò', quantity: 300, unit: 'g' },
      ];
      const result = generateShoppingItems(recipeIngredients, 4, 6);
      expect(result.size).toBe(1);
      expect(result.get('ing-1')?.quantity).toBe(1200); // (500+300) * 1.5
    });
  });
});