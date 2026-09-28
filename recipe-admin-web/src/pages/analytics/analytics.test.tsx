/**
 * Test cho Analytics Dashboard (Task 33, FR-ADM-05).
 *
 * Ruling Task 33 (user chot 2026-09-28): KHONG cai recharts - Charts.tsx ve
 * chart bang SVG/CSS thuan, de khong pha nguyen tac "khong them dependency"
 * (Task 29) va khong dong vao lockfile/node_modules (clone dang track).
 * Diagram nhan du lieu da chuan hoa tu `analyticsQuery.ts` (ham thuan test duoc).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../test/helpers';
import { apiClient } from '../../api/client';
import DashboardPage from './DashboardPage';
import { BarChart, LineChart } from './Charts';
import {
  buildAnalyticsParams,
  chartCoords,
  barChunks,
  formatChartDate,
  isAnalyticsDays,
  toPolylinePoints,
  type DashboardData,
} from './analyticsQuery';

vi.mock('../../api/client', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);

// --- Fixture ------------------------------------------------------------------

function dash(over: Partial<DashboardData> = {}): DashboardData {
  return {
    rangeDays: 7,
    totalUsers: 12500,
    activeUsers: 3420,
    publishedRecipes: 850,
    topRatedRecipes: [
      { id: 'r1', title: 'Phở bò', averageRating: 4.8, totalRatings: 150 },
      { id: 'r2', title: 'Bún chả', averageRating: 4.7, totalRatings: 89 },
    ],
    usersGrowth: [
      { date: '2026-08-19', newUsers: 45 },
      { date: '2026-08-20', newUsers: 52 },
      { date: '2026-08-21', newUsers: 30 },
      { date: '2026-08-22', newUsers: 61 },
      { date: '2026-08-23', newUsers: 40 },
      { date: '2026-08-24', newUsers: 55 },
      { date: '2026-08-25', newUsers: 48 },
    ],
    recipesGrowth: [
      { date: '2026-08-19', newRecipes: 3 },
      { date: '2026-08-20', newRecipes: 5 },
      { date: '2026-08-21', newRecipes: 2 },
      { date: '2026-08-22', newRecipes: 8 },
      { date: '2026-08-23', newRecipes: 4 },
      { date: '2026-08-24', newRecipes: 6 },
      { date: '2026-08-25', newRecipes: 7 },
    ],
    engagement: { totalFavorites: 12500, totalRatings: 8900, totalComments: 3400 },
    ...over,
  };
}

function serveDash(data: DashboardData) {
  get.mockImplementation((url: unknown) => {
    const u = String(url);
    if (u.startsWith('/admin/analytics/dashboard?')) {
      return Promise.resolve({ data } as never);
    }
    return Promise.reject(new Error(`URL khong mong doi: ${u}`));
  });
}

function requestedUrls(): string[] {
  return get.mock.calls.map((c) => String(c[0]));
}

beforeEach(() => {
  get.mockReset();
});

// =============================================================================
describe('analyticsQuery - logic thuan', () => {
  it('buildAnalyticsParams: mac dinh days=7, gia tri la ha ve 7', () => {
    expect(buildAnalyticsParams(7).get('days')).toBe('7');
    expect(buildAnalyticsParams(30).get('days')).toBe('30');
    expect(buildAnalyticsParams(90).get('days')).toBe('90');
    expect(buildAnalyticsParams(99 as never).get('days')).toBe('7');
  });

  it('isAnalyticsDays chi nhan 7/30/90', () => {
    expect(isAnalyticsDays(7)).toBe(true);
    expect(isAnalyticsDays(30)).toBe(true);
    expect(isAnalyticsDays(90)).toBe(true);
    expect(isAnalyticsDays(14)).toBe(false);
    expect(isAnalyticsDays('7' as never)).toBe(false);
    expect(isAnalyticsDays(undefined)).toBe(false);
  });

  it('formatChartDate: YYYY-MM-DD -> d/M, sai thi giu nguyen', () => {
    expect(formatChartDate('2026-08-19')).toBe('19/8');
    expect(formatChartDate('2026-12-05')).toBe('5/12');
    expect(formatChartDate('khong-phai-ngay')).toBe('khong-phai-ngay');
    expect(formatChartDate('')).toBe('');
  });

  it('chartCoords: gia tri lon -> y nho (tren cao), x tang dan, [0,0,0] o day', () => {
    const coords = chartCoords([5, 10], 100, 50, 4);
    expect(coords).toHaveLength(2);
    expect(coords[0].x).toBeLessThan(coords[1].x);
    // max=10: diem 10 o dinh (y=pad=4), diem 5 o giua (y lon hon)
    expect(coords[1].y).toBeLessThan(coords[0].y);
    expect(coords[1].y).toBeCloseTo(4);
    expect(coords[0].y).toBeCloseTo(25);

    const flat = chartCoords([0, 0, 0], 100, 50, 4);
    expect(flat[0].y).toBe(flat[2].y);

    expect(chartCoords([], 100, 50)).toEqual([]);
  });

  it('chartCoords: gia tri toan 0 khong chia cho 0', () => {
    const coords = chartCoords([0, 0], 100, 50, 4);
    expect(coords[0].y).toBe(46);
    expect(coords[1].y).toBe(46);
  });

  it('toPolylinePoints: coords -> chuoi "x,y x,y"', () => {
    expect(
      toPolylinePoints([
        { x: 3, y: 46 },
        { x: 53, y: 4 },
      ]),
    ).toBe('3,46 53,4');
  });

  it('barChunks: cot nay cao hon cot kia khi gia tri lon hon, tong dung so cot', () => {
    const bars = barChunks([50, 100], 100, 40, 4);
    expect(bars).toHaveLength(2);
    expect(bars[0].w).toBeGreaterThan(0);
    expect(bars[1].w).toBeGreaterThan(0);
    expect(bars[1].h).toBeGreaterThan(bars[0].h); // 100 > 50
    expect(bars[1].y).toBeLessThan(bars[0].y);
    expect(bars[1].h).toBeCloseTo(32);
    expect(bars[0].h).toBeCloseTo(16);
    expect(barChunks([], 100, 40)).toEqual([]);
  });
});

// =============================================================================
describe('Charts (SVG thuan)', () => {
  it('LineChart render svg co polyline voi dung so diem va aria-label', () => {
    const { container } = renderWithProviders(
      <LineChart
        label="Biểu đồ người dùng mới"
        values={[45, 52, 30, 61, 40, 55, 48]}
        width={240}
        height={80}
      />,
    );
    const svg = screen.getByRole('img', { name: 'Biểu đồ người dùng mới' });
    expect(svg).toBeInTheDocument();
    const poly = container.querySelector('polyline');
    expect(poly).not.toBeNull();
    expect(poly!.getAttribute('points')?.split(' ')).toHaveLength(7);
  });

  it('BarChart render dung so cot va nhan gia tri bang formatVn', () => {
    renderWithProviders(
      <BarChart
        label="Biểu đồ tương tác"
        items={[
          { key: 'favorites', label: 'Lượt thích', value: 12500 },
          { key: 'ratings', label: 'Đánh giá', value: 8900 },
          { key: 'comments', label: 'Bình luận', value: 3400 },
        ]}
        width={240}
        height={80}
      />,
    );
    const svg = screen.getByRole('img', { name: 'Biểu đồ tương tác' });
    const bars = within(svg).getAllByTestId(/^bar-/);
    expect(bars).toHaveLength(3);
    expect(within(svg).getByText('8.900')).toBeInTheDocument();
    expect(within(svg).getByText('3.400')).toBeInTheDocument();
    expect(within(svg).getByText('Lượt thích')).toBeInTheDocument();
  });
});

// =============================================================================
describe('DashboardPage', () => {
  it('goi /admin/analytics/dashboard voi days=7 mac dinh', async () => {
    serveDash(dash());
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());
    expect(requestedUrls()[0]).toBe('/admin/analytics/dashboard?days=7');
  });

  it('4 card chinh: nguoi dung, hoat dong, cong thuc da duyet, mon danh gia cao', async () => {
    serveDash(dash());
    renderWithProviders(<DashboardPage />);
    // '3.420' (activeUsers) khong trung voi bat ky so nao cua bar chart.
    await waitFor(() => expect(screen.getByText('3.420')).toBeInTheDocument());

    expect(screen.getByText('Tổng người dùng')).toBeInTheDocument();
    expect(screen.getByText('Người dùng hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Công thức đã duyệt')).toBeInTheDocument();
    expect(screen.getByText('Món đánh giá cao')).toBeInTheDocument();

    // Khoanh vung tung card de '12.500' khong trung voi bar chart engagement.
    const totalCard = screen.getByText('Tổng người dùng').closest('div') as HTMLElement;
    expect(within(totalCard).getByText('12.500')).toBeInTheDocument(); // totalUsers
    const activeCard = screen.getByText('Người dùng hoạt động').closest('div') as HTMLElement;
    expect(within(activeCard).getByText('3.420')).toBeInTheDocument(); // activeUsers
    const pubCard = screen.getByText('Công thức đã duyệt').closest('div') as HTMLElement;
    expect(within(pubCard).getByText('850')).toBeInTheDocument(); // publishedRecipes
  });

  it('card "Mon danh gia cao" hien mon top voi diem (vi-VN) va so luot', async () => {
    serveDash(dash());
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());
    const topCard = screen.getByText('Món đánh giá cao').closest('div') as HTMLElement;
    expect(within(topCard).getByText('Phở bò')).toBeInTheDocument();
    // Prefix "★ " cua NumberDisplay lam exact-match hong -> dung regex.
    expect(within(topCard).getByText(/4,8/)).toBeInTheDocument();
    // So luot hien trong hint: "Từ 150 lượt đánh giá".
    expect(within(topCard).getByText(/150/)).toBeInTheDocument();
  });

  it('doi khoang thoi gian: bam "30 ngay" -> goi lai voi days=30', async () => {
    serveDash(dash());
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '30 ngày' }));
    await waitFor(() =>
      expect(requestedUrls().some((u) => u.includes('days=30'))).toBe(true),
    );
    expect(requestedUrls().at(-1)).toBe('/admin/analytics/dashboard?days=30');
  });

  it('co 2 line chart (nguoi dung moi, cong thuc moi) va 1 bar chart tuong tac', async () => {
    serveDash(dash());
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    expect(screen.getByRole('img', { name: 'Biểu đồ người dùng mới' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Biểu đồ công thức mới' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Biểu đồ tương tác' })).toBeInTheDocument();
    // nhan nhom chart bang heading
    expect(screen.getByText('Người dùng mới')).toBeInTheDocument();
    expect(screen.getByText('Công thức mới')).toBeInTheDocument();
    expect(screen.getByText('Tương tác')).toBeInTheDocument();
  });

  it('loi tai du lieu hien ErrorBanner voi ma loi backend', async () => {
    get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500, data: { statusCode: 500, message: '[MET-01] Lỗi máy chủ' } },
    });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText(/\[MET-01\]/)).toBeInTheDocument());
  });

  it('khong co mon top (topRatedRecipes rong) thi card hien "—"', async () => {
    serveDash(dash({ topRatedRecipes: [] }));
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText('3.420')).toBeInTheDocument());
    const topCard = screen.getByText('Món đánh giá cao').closest('div') as HTMLElement;
    expect(within(topCard).getByText('—')).toBeInTheDocument();
  });
});