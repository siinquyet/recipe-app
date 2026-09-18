import { taiAnhLen } from '../uploads';

jest.mock('../../auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => 'token-hien-tai'),
  lamMoiAccessToken: jest.fn(async () => 'token-moi'),
  xoaTokens: jest.fn(async () => {}),
}));

describe('taiAnhLen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('goi POST uploads multipart va tra ve url', async () => {
    const fetchMock = jest.fn(async (input: unknown, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith('file://')) {
        return new Response(new Blob(['du-lieu-anh']), { status: 200 });
      }
      return new Response(
        JSON.stringify({ success: true, data: { url: '/uploads/a.jpg' }, error: null }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const url = await taiAnhLen('file:///tmp/a.jpg');

    expect(url).toBe('/uploads/a.jpg');
    const goiUpload = fetchMock.mock.calls.find(([input]) => typeof input === 'string' && (input as string).includes('uploads'));
    expect(goiUpload).toBeDefined();
    const [urlUpload, init] = goiUpload as [string, RequestInit];
    expect(urlUpload).toContain('uploads');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-hien-tai');
  });

  it('bao loi khi khong doc duoc file', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    await expect(taiAnhLen('file:///tmp/khong-co.jpg')).rejects.toThrow();
  });
});
