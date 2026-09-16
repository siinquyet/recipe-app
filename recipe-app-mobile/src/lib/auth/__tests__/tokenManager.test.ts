import {
  lamMoiAccessToken,
  layAccessToken,
  layRefreshToken,
  layThoiDiemHetHan,
  luuTokens,
  tokenHetHan,
  xoaTokens,
} from '../tokenManager';

jest.mock('../khoLuuTru', () => {
  const kho = new Map<string, string>();
  return {
    datMuc: jest.fn(async (k: string, v: string) => {
      kho.set(k, v);
    }),
    layMuc: jest.fn(async (k: string) => kho.get(k) ?? null),
    xoaMuc: jest.fn(async (k: string) => {
      kho.delete(k);
    }),
    __kho: kho,
  };
});

function taoJwtFake(hetHanGiay: number): string {
  const maHoa = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${maHoa({ alg: 'HS256' })}.${maHoa({ exp: hetHanGiay })}.chuky`;
}

describe('tokenManager', () => {
  beforeEach(async () => {
    await xoaTokens();
    jest.restoreAllMocks();
  });

  it('lưu và đọc tokens', async () => {
    await luuTokens('access-123', 'refresh-456');
    expect(await layAccessToken()).toBe('access-123');
    expect(await layRefreshToken()).toBe('refresh-456');
  });

  it('xóa tokens', async () => {
    await luuTokens('a', 'b');
    await xoaTokens();
    expect(await layAccessToken()).toBeNull();
    expect(await layRefreshToken()).toBeNull();
  });

  describe('tokenHetHan', () => {
    it('token null coi như hết hạn', () => {
      expect(tokenHetHan(null)).toBe(true);
    });

    it('token còn hạn xa trả về false', () => {
      const token = taoJwtFake(Math.floor(Date.now() / 1000) + 3600);
      expect(tokenHetHan(token)).toBe(false);
    });

    it('token đã hết hạn trả về true', () => {
      const token = taoJwtFake(Math.floor(Date.now() / 1000) - 10);
      expect(tokenHetHan(token)).toBe(true);
    });

    it('token sai định dạng coi như hết hạn', () => {
      expect(tokenHetHan('khong-phai-jwt')).toBe(true);
    });
  });

  describe('lamMoiAccessToken', () => {
    it('đổi refresh token lấy access token mới và lưu lại', async () => {
      await luuTokens('cu', 'refresh-hop-le');
      const phanHoi = {
        success: true,
        data: { accessToken: 'moi', refreshToken: 'refresh-moi', thoiGianHetHan: 3600 },
        error: null,
      };
      global.fetch = jest.fn(async () =>
        new Response(JSON.stringify(phanHoi), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ) as unknown as typeof fetch;

      expect(await lamMoiAccessToken()).toBe('moi');
      expect(await layAccessToken()).toBe('moi');
      expect(await layRefreshToken()).toBe('refresh-moi');
    });

    it('trả về null và xóa tokens khi không có refresh token', async () => {
      expect(await lamMoiAccessToken()).toBeNull();
    });

    it('trả về null và xóa tokens khi server từ chối', async () => {
      await luuTokens('cu', 'refresh-het-han');
      global.fetch = jest.fn(async () => new Response('Unauthorized', { status: 401 })) as unknown as typeof fetch;

      expect(await lamMoiAccessToken()).toBeNull();
      expect(await layAccessToken()).toBeNull();
    });
  });

  describe('layThoiDiemHetHan', () => {
    it('đọc exp từ payload', () => {
      const exp = Math.floor(Date.now() / 1000) + 100;
      expect(layThoiDiemHetHan(taoJwtFake(exp))).toBe(exp * 1000);
    });
  });
});
