import { formatVn } from '@shared/number';
import { barChunks, chartCoords, formatChartDate, toPolylinePoints } from './analyticsQuery';

const GRAY = '#9ca3af';

/**
 * Chart ve bang SVG thuan (Task 33, Ruling: khong cai recharts).
 *
 * Ca hai dung `viewBox` co dinh + `className="w-full h-auto"` de scale theo
 * be rong container ma khong vo cu truc toa do. Nhan du lieu da chuan hoa tu
 * `analyticsQuery.ts` (ham thuan) nen component chi lo viec ve.
 */

export function LineChart({
  label,
  values,
  labels = [],
  width = 240,
  height = 80,
  color = '#2563eb',
  strokeWidth = 1.5,
}: {
  label: string;
  values: readonly number[];
  /** Ngay cua tung diem (chi hien 3 moc dau/giua/cuoi de truc X bot choi). */
  labels?: readonly string[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const coords = chartCoords(values, width, height);
  const max = Math.max(...values, 0);

  const ticks: Array<{ x: number; text: string }> = [];
  if (labels.length > 0) {
    const pick = [0, Math.floor((labels.length - 1) / 2), labels.length - 1].filter(
      (i, idx, arr) => arr.indexOf(i) === idx,
    );
    for (const i of pick) {
      ticks.push({ x: coords[i].x, text: formatChartDate(labels[i]) });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="w-full h-auto"
    >
      {max > 0 && (
        <text x={2} y={7} fontSize={5} fill={GRAY}>
          {formatVn(max)}
        </text>
      )}
      {ticks.map((t) => (
        <text
          key={t.text}
          x={t.x}
          y={height - 1}
          fontSize={4}
          textAnchor="middle"
          fill={GRAY}
        >
          {t.text}
        </text>
      ))}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={toPolylinePoints(coords)}
      />
    </svg>
  );
}

export interface BarItem {
  key: string;
  label: string;
  value: number;
}

const BAR_COLORS = ['#2563eb', '#059669', '#d97706'];

export function BarChart({
  label,
  items,
  width = 240,
  height = 80,
}: {
  label: string;
  items: readonly BarItem[];
  width?: number;
  height?: number;
}) {
  const bars = barChunks(
    items.map((i) => i.value),
    width,
    height,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="w-full h-auto"
    >
      {bars.map((b, i) => {
        const item = items[i];
        const cx = b.x + b.w / 2;
        return (
          <g key={item.key}>
            <rect
              data-testid={`bar-${item.key}`}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={1}
              fill={BAR_COLORS[i % BAR_COLORS.length]}
            />
            <text x={cx} y={height - 1} fontSize={4} textAnchor="middle" fill={GRAY}>
              {item.label}
            </text>
            <text
              x={cx}
              y={Math.max(b.y - 1, 4)}
              fontSize={4.5}
              textAnchor="middle"
              fill="#374151"
            >
              {formatVn(item.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}