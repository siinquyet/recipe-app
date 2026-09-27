import { Injectable } from '@nestjs/common';
import {
  canConvert,
  convertFromBase,
  convertToBase,
  getUnitInfo,
  scaleQuantity,
  type QuantityItem,
} from '@cookbook/shared';

/** Một dòng nguyên liệu sau khi scale (BR-04) */
export interface ScaledIngredientLine {
  internalIngredientId?: string;
  originalText: string;
  quantity: number;
  unit: string;
}

/** Một dòng nguyên liệu sau khi cộng gộp (BR-03) */
export interface AggregatedIngredientLine extends ScaledIngredientLine {
  /** Số dòng nguồn đã cộng vào dòng này */
  sourceCount: number;
  /** Cảnh báo phát sinh khi gộp (SHOP-03) */
  warnings: string[];
}

export interface AggregationResult {
  lines: AggregatedIngredientLine[];
  warnings: string[];
}

/**
 * BR-03 / BR-04 - dùng chung thuật toán với mobile/web trong @cookbook/shared
 * để cùng một kết quả cộng gộp trên mọi nền tảng.
 */
@Injectable()
export class AggregationService {
  /**
   * BR-04: Scaled Quantity = Original × (Target Servings / Recipe Base Servings)
   * recipeBaseServings <= 0 hoặc thiếu -> giữ nguyên kèm cảnh báo SHOP-04.
   */
  scaleQuantity(
    quantity: number,
    recipeBaseServings: number,
    targetServings: number,
    context: string,
  ): { quantity: number; warnings: string[] } {
    const { quantity: scaled, warning } = scaleQuantity(quantity, recipeBaseServings, targetServings);
    if (warning) {
      return {
        quantity,
        warnings: [`[SHOP-04] ${context}: ${warning.split(':')[1]?.trim() ?? warning}`],
      };
    }
    return { quantity: this.round(scaled), warnings: [] };
  }

  /**
   * BR-03: cộng gộp các dòng cùng nguyên liệu.
   * - Cùng `internalIngredientId` + đơn vị quy đổi được (cùng category) -> cộng về đơn vị gốc
   * - Không quy đổi được -> tách dòng riêng, gắn cảnh báo SHOP-03
   * - UNMAPPED (chưa map nguyên liệu nội bộ) -> gộp theo originalText
   */
  aggregate(items: ScaledIngredientLine[]): AggregationResult {
    const warnings: string[] = [];
    // key -> dòng đang gộp. Dùng cấu trúc mảng để giữ thứ tự chèn ổn định.
    const groups = new Map<string, AggregatedIngredientLine>();

    for (const item of items) {
      const qty = this.round(item.quantity);
      const unit = this.normalizeUnit(item.unit);
      // UNMAPPED: gộp theo tên gốc đã chuẩn hóa để tránh trùng do khác hoa/thường
      // Key gộp CHỈ theo nguyên liệu, chưa phân biệt đơn vị: cùng nguyên liệu nhưng
      // khác category đơn vị sẽ được tách thành dòng riêng ở bước bên dưới (SHOP-03).
      const key = item.internalIngredientId
        ? `ing:${item.internalIngredientId}`
        : `text:${item.originalText.trim().toLowerCase()}`;
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          internalIngredientId: item.internalIngredientId,
          originalText: item.originalText,
          quantity: qty,
          unit,
          sourceCount: 1,
          warnings: [],
        });
        continue;
      }

      if (existing.unit === unit || canConvert(existing.unit, unit)) {
        // Quy về đơn vị cơ sở -> cộng -> trả về đơn vị của dòng gốc
        const base = convertToBase(existing.quantity, existing.unit);
        const add = convertToBase(qty, unit);
        if (base && add) {
          existing.quantity = this.round(
            convertFromBase(base.value + add.value, existing.unit) ?? existing.quantity + qty,
          );
          existing.sourceCount += 1;
          continue;
        }
      }

      // Không quy đổi được: tách thành dòng riêng (không cộng)
      const splitKey = `${key}@${unit}#${existing.sourceCount}`;
      groups.set(splitKey, {
        internalIngredientId: item.internalIngredientId,
        originalText: item.originalText,
        quantity: qty,
        unit,
        sourceCount: 1,
        warnings: [],
      });
      const message = `[SHOP-03] Không thể quy đổi đơn vị, tách dòng riêng: "${existing.originalText}" (${existing.unit}) và "${item.originalText}" (${unit})`;
      existing.warnings.push(message);
      warnings.push(message);
    }

    // Dòng đơn vị lạ (không nằm trong bảng đơn vị chia sẻ) -> cảnh báo để client biết không thể gộp
    for (const line of groups.values()) {
      if (!getUnitInfo(line.unit)) {
        const message = `[SHOP-03] Đơn vị "${line.unit}" không hỗ trợ quy đổi, giữ nguyên định lượng cho "${line.originalText}"`;
        line.warnings.push(message);
        warnings.push(message);
      }
    }

    return { lines: [...groups.values()], warnings };
  }

  private normalizeUnit(unit: string): string {
    const trimmed = (unit ?? '').trim();
    return trimmed === '' ? 'g' : trimmed.toLowerCase();
  }

  /** Khớp cột Decimal(10,3): làm tròn 3 chữ số thập phân, tránh sai số do float */
  private round(value: number): number {
    return Math.round(value * 1000) / 1000;
  }
}
