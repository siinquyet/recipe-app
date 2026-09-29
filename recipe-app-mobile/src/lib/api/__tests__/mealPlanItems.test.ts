import { capNhatMonTrongKeHoach, xoaMonKhoiKeHoach } from '../mealPlans';

jest.mock('../../auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => 'token-hien-tai'),
  lamMoiAccessToken: jest.fn(async () => 'token-moi'),
  xoaTokens: jest.fn(async () => {}),
}));

function mockJson(duLieu: unknown, status = 200) {
  global.fetch = jest.fn(async () =>
    new Response(JSON.stringify(duLieu), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  ) as unknown as typeof fetch;
}

describe('xoaMonKhoiKeHoach', () => {
  it('goi DELETE dung keHoachId va monId', async () => {
    mockJson({ success: true, data: null, error: null });

    await xoaMonKhoiKeHoach('kh-1', 'mon-1');

    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('meal-plans/kh-1/items/mon-1');
    expect(req.method).toBe('DELETE');
  });
});

describe('capNhatMonTrongKeHoach', () => {
  it('goi PATCH voi khauPhan moi', async () => {
    mockJson({ success: true, data: null, error: null });

    await capNhatMonTrongKeHoach('kh-1', 'mon-1', { khauPhan: 4 });

    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('meal-plans/kh-1/items/mon-1');
    expect(req.method).toBe('PATCH');
  });
});
