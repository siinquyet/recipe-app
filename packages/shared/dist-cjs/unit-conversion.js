"use strict";
/**
 * Quy đổi đơn vị đo lường cho Shopping List
 * BR-03: Cộng gộp định lượng khi cùng internal_ingredient_id VÀ cùng đơn vị hoặc có thể quy đổi chuẩn (g↔kg, ml↔l)
 * BR-04: Scaled Quantity = Original Quantity × (Meal Plan Servings / Recipe Base Servings)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitInfo = getUnitInfo;
exports.canConvert = canConvert;
exports.convertToBase = convertToBase;
exports.convertFromBase = convertFromBase;
exports.formatQuantity = formatQuantity;
exports.aggregateQuantities = aggregateQuantities;
exports.scaleQuantity = scaleQuantity;
exports.generateShoppingItems = generateShoppingItems;
const number_1 = require("./number");
const UNITS = {
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
function getUnitInfo(unit) {
    const normalized = unit.toLowerCase().trim();
    return UNITS[normalized] || null;
}
function canConvert(unit1, unit2) {
    const info1 = getUnitInfo(unit1);
    const info2 = getUnitInfo(unit2);
    if (!info1 || !info2)
        return false;
    return info1.category === info2.category;
}
function convertToBase(value, unit) {
    const info = getUnitInfo(unit);
    if (!info)
        return null;
    // Return the base unit name (g for MASS, ml for VOLUME, cái for COUNT)
    const baseUnitNames = {
        MASS: 'g',
        VOLUME: 'ml',
        COUNT: 'cái',
    };
    return { value: value * info.toBase, baseUnit: baseUnitNames[info.category] };
}
function convertFromBase(baseValue, targetUnit) {
    const info = getUnitInfo(targetUnit);
    if (!info)
        return null;
    return baseValue / info.toBase;
}
function formatQuantity(value, unit) {
    const formatted = (0, number_1.formatVn)(value);
    return `${formatted} ${unit}`;
}
function aggregateQuantities(items) {
    const groups = new Map();
    for (const item of items) {
        const key = item.internalIngredientId || `unmapped_${item.originalText}`;
        const existing = groups.get(key);
        if (existing) {
            // BR-03: Đơn vị đếm chỉ gộp khi y hệt nhau (quả ≠ lát);
            // khối lượng/thể tích gộp được khi quy đổi chuẩn (g↔kg, ml↔l)
            const cungDonVi = existing.unit === item.unit;
            const quyDoiDuoc = canConvert(existing.unit, item.unit) && getUnitInfo(existing.unit)?.category !== 'COUNT';
            if (cungDonVi || quyDoiDuoc) {
                const base1 = convertToBase(existing.quantity, existing.unit);
                const base2 = convertToBase(item.quantity, item.unit);
                const newBase = base1.value + base2.value;
                const newQty = convertFromBase(newBase, existing.unit);
                existing.quantity = newQty;
                existing.originalTexts.push(item.originalText);
            }
            else {
                // Không gộp được - tách dòng riêng, cộng dồn nếu dòng đó đã có
                const newKey = `${key}_${item.unit}`;
                const tach = groups.get(newKey);
                if (tach) {
                    tach.quantity += item.quantity;
                    tach.originalTexts.push(item.originalText);
                }
                else {
                    groups.set(newKey, { quantity: item.quantity, unit: item.unit, originalTexts: [item.originalText] });
                }
            }
        }
        else {
            groups.set(key, { quantity: item.quantity, unit: item.unit, originalTexts: [item.originalText] });
        }
    }
    return groups;
}
/**
 * BR-04: Quy đổi định lượng theo khẩu phần
 * Scaled Quantity = Original Quantity × (Meal Plan Servings / Recipe Base Servings)
 */
function scaleQuantity(originalQuantity, recipeBaseServings, mealPlanServings) {
    if (!recipeBaseServings || recipeBaseServings <= 0) {
        return {
            quantity: originalQuantity,
            warning: 'RECIPE_BASE_SERVINGS_INVALID: Không có khẩu phần cơ sở, giữ nguyên định lượng'
        };
    }
    const scaled = originalQuantity * (mealPlanServings / recipeBaseServings);
    return { quantity: scaled };
}
function generateShoppingItems(recipeIngredients, recipeBaseServings, targetServings) {
    // 1. Scale each ingredient
    const scaled = recipeIngredients.map(item => {
        const { quantity, warning } = scaleQuantity(item.quantity, recipeBaseServings, targetServings);
        if (warning)
            console.warn(`[BR-04] ${warning} - ${item.originalText}`);
        return { ...item, quantity };
    });
    // 2. Aggregate (BR-03)
    return aggregateQuantities(scaled);
}
