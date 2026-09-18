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
});
