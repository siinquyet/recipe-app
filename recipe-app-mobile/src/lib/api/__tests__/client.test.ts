import { ApiError, apiClient, goiApi } from '../client';
import type { ApiResponse } from '../../../types/api';

jest.mock('../../auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => 'token-hien-tai'),
  lamMoiAccessToken: jest.fn(async () => 'token-moi'),
  xoaTokens: jest.fn(async () => {}),
}));

const { layAccessToken, lamMoiAccessToken } = jest.requireMock('../../auth/tokenManager') as {
  layAccessToken: jest.Mock;
  lamMoiAccessToken: jest.Mock;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    layAccessToken.mockResolvedValue('token-hien-tai');
    lamMoiAccessToken.mockResolvedValue('token-moi');
  });

  it('gắn Authorization header và bóc envelope thành công', async () => {
    global.fetch = jest.fn(async () => jsonResponse({ success: true, data: { ok: true }, error: null })) as unknown as typeof fetch;

    const ketQua = await goiApi(apiClient.get('recipes').json<ApiResponse<{ ok: boolean }>>());

    expect(ketQua).toEqual({ ok: true });
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.headers.get('Authorization')).toBe('Bearer token-hien-tai');
  });

  it('ném ApiError khi envelope success=false', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ success: false, data: null, error: { code: 'REC-01', message: 'Không tồn tại' } }),
    ) as unknown as typeof fetch;

    await expect(goiApi(apiClient.get('recipes/404').json<ApiResponse<{ ok: boolean }>>())).rejects.toMatchObject({
      name: 'ApiError',
      maLoi: 'REC-01',
    } as Partial<ApiError>);
  });

  it('tự refresh và thử lại request khi gặp 401', async () => {
    const fetchMock = jest
      .fn<Promise<Response>, [Request]>()
      .mockResolvedValueOnce(new Response('het han', { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ok: true }, error: null }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const ketQua = await goiApi(apiClient.get('auth/me').json<ApiResponse<{ ok: boolean }>>());

    expect(ketQua).toEqual({ ok: true });
    expect(lamMoiAccessToken).toHaveBeenCalledTimes(1);
    const reqThuLai = fetchMock.mock.calls[1][0] as Request;
    expect(reqThuLai.headers.get('Authorization')).toBe('Bearer token-moi');
  });

  it('ném AUTH-02 khi refresh thất bại', async () => {
    lamMoiAccessToken.mockResolvedValueOnce(null);
    global.fetch = jest.fn(async () => new Response('het han', { status: 401 })) as unknown as typeof fetch;

    await expect(goiApi(apiClient.get('auth/me').json<ApiResponse<{ ok: boolean }>>())).rejects.toMatchObject({
      maLoi: 'AUTH-02',
    } as Partial<ApiError>);
  });

  it('ném NETWORK khi không kết nối được', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    await expect(goiApi(apiClient.get('recipes').json<ApiResponse<{ ok: boolean }>>())).rejects.toMatchObject({
      maLoi: 'NETWORK',
    } as Partial<ApiError>);
  });
});
