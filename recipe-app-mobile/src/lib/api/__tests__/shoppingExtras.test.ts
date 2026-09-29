import { capNhatDanhSachDiCho, suaMonDiCho, taoTuCongThuc, themMonDiCho, xoaDanhSachDiCho, xoaMonDiCho } from '../shoppingLists';

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

describe('taoTuCongThuc', () => {
  it('goi POST generate-from-recipe voi congThucId', async () => {
    mockJson(
      {
        success: true,
        data: { id: 'ds-1', ten: 'Đi chợ - Phở', loaiNguon: 'RECIPE', nguonId: 'ct-1', trangThai: 'ACTIVE', cacMon: [] },
        error: null,
      },
      201,
    );

    const ketQua = await taoTuCongThuc('ct-1', 2);

    expect(ketQua.nguonId).toBe('ct-1');
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/generate-from-recipe');
    expect(req.method).toBe('POST');
  });
});

describe('capNhatDanhSachDiCho', () => {
  it('goi PATCH voi trangThai COMPLETED', async () => {
    mockJson({
      success: true,
      data: { id: 'ds-1', ten: 'Đi chợ', loaiNguon: 'MANUAL', nguonId: null, trangThai: 'COMPLETED', cacMon: [] },
      error: null,
    });

    const ketQua = await capNhatDanhSachDiCho('ds-1', { trangThai: 'COMPLETED' });

    expect(ketQua.trangThai).toBe('COMPLETED');
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/ds-1');
    expect(req.method).toBe('PATCH');
  });
});

describe('xoaDanhSachDiCho', () => {
  it('goi DELETE dung id', async () => {
    mockJson({ success: true, data: null, error: null });

    await xoaDanhSachDiCho('ds-1');

    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/ds-1');
    expect(req.method).toBe('DELETE');
  });
});

const dsMau = {
  id: 'ds-1',
  ten: 'Đi chợ',
  loaiNguon: 'MANUAL',
  nguonId: null,
  trangThai: 'ACTIVE',
  cacMon: [
    { id: 'mon-1', nguyenLieuId: null, tenGoc: 'Rau muống', dinhLuong: '300', donVi: 'g', daChon: false, thuTu: 0 },
  ],
};

describe('themMonDiCho', () => {
  it('goi POST items voi ten/luong/don vi', async () => {
    mockJson({ success: true, data: dsMau, error: null }, 201);

    const ketQua = await themMonDiCho('ds-1', { tenGoc: 'Rau muống', dinhLuong: 300, donVi: 'g' });

    expect(ketQua.cacMon).toHaveLength(1);
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/ds-1/items');
    expect(req.method).toBe('POST');
  });
});

describe('suaMonDiCho', () => {
  it('goi PATCH item voi ten moi', async () => {
    mockJson({ success: true, data: dsMau, error: null });

    const ketQua = await suaMonDiCho('ds-1', 'mon-1', { tenGoc: 'Rau muống non' });

    expect(ketQua.id).toBe('ds-1');
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/ds-1/items/mon-1');
    expect(req.method).toBe('PATCH');
  });
});

describe('xoaMonDiCho', () => {
  it('goi DELETE item dung id', async () => {
    mockJson({ success: true, data: { ...dsMau, cacMon: [] }, error: null });

    const ketQua = await xoaMonDiCho('ds-1', 'mon-1');

    expect(ketQua.cacMon).toHaveLength(0);
    const req = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(req.url).toContain('shopping-lists/ds-1/items/mon-1');
    expect(req.method).toBe('DELETE');
  });
});
