/**
 * Vietnamese number formatting utilities
 * Format: 1.000, 100.000, 1.500.000 (dấu chấm phân cách nghìn)
 */

const VN_LOCALE = 'vi-VN';

const vnFormatter = new Intl.NumberFormat(VN_LOCALE, {
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const vnDecimalFormatter = new Intl.NumberFormat(VN_LOCALE, {
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

/**
 * Format integer/number to Vietnamese format (1.000, 100.000, etc.)
 */
export function formatVn(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (!Number.isFinite(num)) {
    return '0';
  }

  // Handle decimals (e.g., 1.5kg -> "1.5")
  if (!Number.isInteger(num)) {
    return vnDecimalFormatter.format(num);
  }

  return vnFormatter.format(num);
}

/**
 * Format compact number (1K, 1M, etc.) - optional for UI space saving
 */
export function formatCompactVn(value: number): string {
  const compactFormatter = new Intl.NumberFormat(VN_LOCALE, {
    notation: 'compact',
    compactDisplay: 'short',
  });
  return compactFormatter.format(value);
}

/**
 * Parse Vietnamese formatted string back to number
 * "1.000" -> 1000, "100.000" -> 100000
 */
export function parseVn(value: string): number {
  // Remove all dots (Vietnamese thousand separator)
  const cleaned = value.replace(/\./g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Kotlin equivalent for Android:
 *
 * object NumberFormatUtils {
 *   private val VN_FORMAT = NumberFormat.getNumberInstance(Locale("vi", "VN")).apply {
 *     groupingUsed = true
 *     minimumFractionDigits = 0
 *     maximumFractionDigits = 0
 *   }
 *
 *   private val VN_DECIMAL_FORMAT = NumberFormat.getNumberInstance(Locale("vi", "VN")).apply {
 *     groupingUsed = true
 *     minimumFractionDigits = 0
 *     maximumFractionDigits = 3
 *   }
 *
 *   fun Number.formatVn(): String =
 *     if (this !is Int && this !is Long) VN_DECIMAL_FORMAT.format(this)
 *     else VN_FORMAT.format(this)
 *
 *   fun parseVn(value: String): Double =
 *     value.replace(".", "").toDoubleOrNull() ?: 0.0
 * }
 */