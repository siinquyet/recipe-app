import { taoTuKeHoachAn } from '../shoppingLists';

jest.mock('../../auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => 'token-hien-tai'),
  lamMoiAccessToken: jest.fn(async () => 'token-moi'),
  xoaTokens: jest.fn(async () => {}),
}));

describe('taoTuKeHoachAn', () => {
  it('goi POST generate-from-meal-plan voi mealPlanId', async () => {
    global.fetch = jest.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { id: 'ds-1', ten: 'Đi chợ - Tuần 1', loaiNguon: 'MEAL_PLAN', nguonId: 'kh-1', trangThai: 'ACTIVE', cacMon: [] },
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as unknown as typeof fetch;

    const ketQua = await taoTuKeHoachAn('kh-1');

    expect(ketQua.nguonId).toBe('kh-1');
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/generate-from-meal-plan');
    expect(req.method).toBe('POST');
  });

  it('gui tuNgay/denNgay khi chon 1 ngay hoac vai ngay', async () => {
    global.fetch = jest.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { id: 'ds-2', ten: 'Đi chợ - 1 ngày', loaiNguon: 'MEAL_PLAN', nguonId: 'kh-1', trangThai: 'ACTIVE', cacMon: [] },
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as unknown as typeof fetch;

    // BR-SHOP: Truyền ngày không làm vỡ envelope, server lọc items theo ngày
    const ketQua = await taoTuKeHoachAn('kh-1', '2026-09-01', '2026-09-01');

    expect(ketQua.nguonId).toBe('kh-1');
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/generate-from-meal-plan');
  });

  it('tick vai ngay thi van tra ve danh sach', async () => {
    global.fetch = jest.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { id: 'ds-3', ten: 'Đi chợ - 2 ngày', loaiNguon: 'MEAL_PLAN', nguonId: 'kh-1', trangThai: 'ACTIVE', cacMon: [] },
          error: null,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as unknown as typeof fetch;

    // BR-SHOP: Tick T2+T5 gui cacNgay, server loc mon theo ngay truoc khi gop
    const ketQua = await taoTuKeHoachAn('kh-1', undefined, undefined, ['2026-09-01', '2026-09-03']);

    expect(ketQua.nguonId).toBe('kh-1');
  });
});
