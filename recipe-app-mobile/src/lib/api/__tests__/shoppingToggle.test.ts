import { capNhatTrangThaiMon } from '../shoppingLists';

jest.mock('../../auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => 'token-hien-tai'),
  lamMoiAccessToken: jest.fn(async () => 'token-moi'),
  xoaTokens: jest.fn(async () => {}),
}));

describe('capNhatTrangThaiMon', () => {
  it('goi PATCH item voi daChon', async () => {
    global.fetch = jest.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { id: 'ds-1', ten: 'Di cho', loaiNguon: 'MANUAL', nguonId: null, trangThai: 'OPEN', cacMon: [] },
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as unknown as typeof fetch;

    const ketQua = await capNhatTrangThaiMon('ds-1', 'mon-1', true);

    expect(ketQua.id).toBe('ds-1');
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/ds-1/items/mon-1');
    expect(req.method).toBe('PATCH');
  });
});
