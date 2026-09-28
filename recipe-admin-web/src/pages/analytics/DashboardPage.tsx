import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { extractApiMessage } from '../../api/errorMessage';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { NumberDisplay, TextDisplay } from '../../components/ui/NumberDisplay';
import { BarChart, LineChart } from './Charts';
import {
  ANALYTICS_DAYS,
  dashboardKeys,
  fetchDashboard,
  type AnalyticsDays,
} from './analyticsQuery';

function MetricCard({
  title,
  icon,
  children,
  hint,
}: {
  title: string;
  icon: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <div className="text-2xl font-bold text-gray-900 mt-1">{children}</div>
          {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
        <div className="text-3xl shrink-0">{icon}</div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-5">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {hint && <p className="text-xs text-gray-400 mt-0.5 mb-2">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

/**
 * Analytics Dashboard (FR-ADM-05) - tong quan he thong.
 *
 * - 4 card: Tong nguoi dung, Nguoi dung hoat dong, Cong thuc da duyet,
 *   Mon danh gia cao (BR-05: chi mon co >= 5 danh gia).
 * - 2 line chart (SVG thuan): usersGrowth, recipesGrowth.
 * - 1 bar chart: engagement (luot thich / danh gia / binh luan).
 * - Date range picker 7/30/90 ngay (backend chi nhan cac gia tri nay).
 *
 * Chart ve thuan SVG (khong recharts - xem Ruling trong analyticsQuery.ts).
 */
export default function DashboardPage() {
  const [days, setDays] = useState<AnalyticsDays>(7);

  const { data, isLoading, error } = useQuery({
    queryKey: dashboardKeys.detail(days),
    queryFn: () => fetchDashboard(days),
  });

  const top = data?.topRatedRecipes?.[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Thống kê</h2>
        <div
          className="inline-flex rounded-lg border border-gray-300 overflow-hidden"
          role="group"
          aria-label="Khoảng thời gian"
        >
          {ANALYTICS_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              className={clsx(
                'px-3 py-1.5 text-sm transition',
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              )}
              onClick={() => setDays(d)}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner message={error ? extractApiMessage(error, 'Lỗi tải thống kê') : null} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Tổng người dùng" icon="👥">
          <NumberDisplay value={data?.totalUsers} />
        </MetricCard>
        <MetricCard title="Người dùng hoạt động" icon="⚡">
          <NumberDisplay value={data?.activeUsers} />
        </MetricCard>
        <MetricCard title="Công thức đã duyệt" icon="📖">
          <NumberDisplay value={data?.publishedRecipes} />
        </MetricCard>
        <MetricCard
          title="Món đánh giá cao"
          icon="🏆"
          hint={top ? `Từ ${top.totalRatings} lượt đánh giá` : undefined}
        >
          {top ? (
            <div className="min-w-0">
              <TextDisplay value={top.title} className="block truncate" />
              <NumberDisplay prefix="★ " value={top.averageRating} />
            </div>
          ) : isLoading ? (
            '…'
          ) : (
            '—'
          )}
        </MetricCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Người dùng mới" hint="Số tài khoản tạo mới theo ngày">
          <LineChart
            label="Biểu đồ người dùng mới"
            values={data?.usersGrowth.map((p) => p.newUsers ?? 0) ?? []}
            labels={data?.usersGrowth.map((p) => p.date) ?? []}
          />
        </ChartCard>
        <ChartCard title="Công thức mới" hint="Số công thức tạo mới theo ngày">
          <LineChart
            label="Biểu đồ công thức mới"
            values={data?.recipesGrowth.map((p) => p.newRecipes ?? 0) ?? []}
            labels={data?.recipesGrowth.map((p) => p.date) ?? []}
            color="#059669"
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Tương tác"
        hint="Lượt thích / Đánh giá / Bình luận trong hệ thống"
      >
        <BarChart
          label="Biểu đồ tương tác"
          items={
            data
              ? [
                  { key: 'favorites', label: 'Lượt thích', value: data.engagement.totalFavorites },
                  { key: 'ratings', label: 'Đánh giá', value: data.engagement.totalRatings },
                  { key: 'comments', label: 'Bình luận', value: data.engagement.totalComments },
                ]
              : []
          }
        />
      </ChartCard>
    </div>
  );
}