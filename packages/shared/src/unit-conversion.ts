/**
 * Quy đổi đơn vị đo lường cho Shopping List
 * BR-03: Cộng gộp định lượng khi cùng internal_ingredient_id VÀ cùng đơn vị hoặc có thể quy đổi chuẩn (g↔kg, ml↔l)
 * BR-04: Scaled Quantity = Original Quantity × (Meal Plan Servings / Recipe Base Servings)
 */

import { formatVn } from './number';

export type UnitCategory = 'MASS' | 'VOLUME' | 'COUNT';

export interface UnitDefinition {
  name: string;
  category: UnitCategory;
  toBase: number; // hệ số quy đổi về đơn vị cơ sở
}

const UNITS: Record<string, UnitDefinition> = {
  // Khối lượng - base: gram (g)
  'g': { name: 'g', category: 'MASS', toBase: 1 },
  'kg': { name: 'kg', category: 'MASS', toBase: 1000 },
  'mg': { name: 'mg', category: 'MASS', toBase: 0.001 },

  // Thể tích - base: milliliter (ml)
  'ml': { name: 'ml', category: 'VOLUME', toBase: 1 },
  'l': { name: 'l', category: 'VOLUME', toBase: 1000 },

  // Đơn vị nấu ăn phổ biến Việt Nam
  'muỗng cà phê': { name: 'muỗng cà phê', category: 'VOLUME', toBase: 5 },
  'muỗng canh': { name: 'muỗng canh', category: 'VOLUME', toBase: 15 },
  'chén': { name: 'chén', category: 'VOLUME', toBase: 200 },
  'bát': { name: 'bát', category: 'VOLUME', toBase: 300 },

  // Đếm - base: cái
  'cái': { name: 'cái', category: 'COUNT', toBase: 1 },
  'quả': { name: 'quả', category: 'COUNT', toBase: 1 },
  'lát': { name: 'lát', category: 'COUNT', toBase: 1 },
  'nhánh': { name: 'nhánh', category: 'COUNT', toBase: 1 },
  'cọng': { name: 'cọng', category: 'COUNT', toBase: 1 },
  'gói': { name: 'gói', category: 'COUNT', toBase: 1 },
  'hộp': { name: 'hộp', category: 'COUNT', toBase: 1 },
  'lon': { name: 'lon', category: 'COUNT', toBase: 1 },
  'chai': { name: 'chai', category: 'COUNT', toBase: 1 },
};

export function getUnitInfo(unit: string): UnitDefinition | null {
  const normalized = unit.toLowerCase().trim();
  return UNITS[normalized] || null;
}

export function canConvert(unit1: string, unit2: string): boolean {
  const info1 = getUnitInfo(unit1);
  const info2 = getUnitInfo(unit2);
  if (!info1 || !info2) return false;
  return info1.category === info2.category;
}

export function convertToBase(value: number, unit: string): { value: number; baseUnit: string } | null {
  const info = getUnitInfo(unit);
  if (!info) return null;
  // Return the base unit name (g for MASS, ml for VOLUME, cái for COUNT)
  const baseUnitNames: Record<UnitCategory, string> = {
    MASS: 'g',
    VOLUME: 'ml',
    COUNT: 'cái',
  };
  return { value: value * info.toBase, baseUnit: baseUnitNames[info.category] };
}

export function convertFromBase(baseValue: number, targetUnit: string): number | null {
  const info = getUnitInfo(targetUnit);
  if (!info) return null;
  return baseValue / info.toBase;
}

export function formatQuantity(value: number, unit: string): string {
  const formatted = formatVn(value);
  return `${formatted} ${unit}`;
}

/**
 * BR-03: Cộng gộp định lượng
 * Group by internalIngredientId (hoặc originalText nếu UNMAPPED)
 * Nếu cùng category unit → convert về base → cộng → format về unit gốc
 * Nếu khác category → tách dòng riêng (key = internalId_unit)
 */
export interface QuantityItem {
  internalIngredientId?: string;
  originalText: string;
  quantity: number;
  unit: string;
}

export interface AggregatedQuantity {
  quantity: number;
  unit: string;
  originalTexts: string[];
}

export function aggregateQuantities(items: QuantityItem[]): Map<string, AggregatedQuantity> {
  const groups = new Map<string, AggregatedQuantity>();

  for (const item of items) {
    const key = item.internalIngredientId || `unmapped_${item.originalText}`;
    const existing = groups.get(key);

    if (existing) {
      if (canConvert(existing.unit, item.unit)) {
        const base1 = convertToBase(existing.quantity, existing.unit)!;
        const base2 = convertToBase(item.quantity, item.unit)!;
        const newBase = base1.value + base2.value;
        const newQty = convertFromBase(newBase, existing.unit)!;
        existing.quantity = newQty;
        existing.originalTexts.push(item.originalText);
      } else {
        // Không quy đổi được - tách dòng riêng
        const newKey = `${key}_${item.unit}`;
        groups.set(newKey, { quantity: item.quantity, unit: item.unit, originalTexts: [item.originalText] });
      }
    } else {
      groups.set(key, { quantity: item.quantity, unit: item.unit, originalTexts: [item.originalText] });
    }
  }

  return groups;
}

/**
 * BR-04: Quy đổi định lượng theo khẩu phần
 * Scaled Quantity = Original Quantity × (Meal Plan Servings / Recipe Base Servings)
 */
export function scaleQuantity(
  originalQuantity: number,
  recipeBaseServings: number,
  mealPlanServings: number
): { quantity: number; warning?: string } {
  if (!recipeBaseServings || recipeBaseServings <= 0) {
    return {
      quantity: originalQuantity,
      warning: 'RECIPE_BASE_SERVINGS_INVALID: Không có khẩu phần cơ sở, giữ nguyên định lượng'
    };
  }

  const scaled = originalQuantity * (mealPlanServings / recipeBaseServings);
  return { quantity: scaled };
}

/**
 * Kết hợp scale + aggregate cho shopping list generation
 */
export interface ScaledItem {
  internalIngredientId?: string;
  originalText: string;
  quantity: number;
  unit: string;
}

export function generateShoppingItems(
  recipeIngredients: ScaledItem[],
  recipeBaseServings: number,
  targetServings: number
): Map<string, AggregatedQuantity> {
  // 1. Scale each ingredient
  const scaled = recipeIngredients.map(item => {
    const { quantity, warning } = scaleQuantity(item.quantity, recipeBaseServings, targetServings);
    if (warning) console.warn(`[BR-04] ${warning} - ${item.originalText}`);
    return { ...item, quantity };
  });

  // 2. Aggregate (BR-03)
  return aggregateQuantities(scaled);
}