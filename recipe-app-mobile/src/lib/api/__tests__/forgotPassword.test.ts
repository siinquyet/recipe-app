import { quenMatKhau } from '../auth';

jest.mock('../../auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => null),
  lamMoiAccessToken: jest.fn(async () => null),
  xoaTokens: jest.fn(async () => {}),
}));

describe('quenMatKhau', () => {
  it('goi POST auth/forgot-password', async () => {
    global.fetch = jest.fn(async () =>
      new Response(JSON.stringify({ success: true, data: { daGui: true }, error: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as unknown as typeof fetch;

    await quenMatKhau('ban@example.com');

    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('auth/forgot-password');
  });
});
