import { layDanhSachYeuThich } from '../recipes';
import type { CongThuc, DanhSachTrang } from '../../../types/api';

jest.mock('../../auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => 'token-hien-tai'),
  lamMoiAccessToken: jest.fn(async () => 'token-moi'),
  xoaTokens: jest.fn(async () => {}),
}));

function taoCongThuc(id: string): CongThuc {
  return {
    id,
    ten: 'Phở bò',
    moTa: null,
    anhThumbnail: null,
    thoiGianNauPhut: 30,
    thoiGianChuanBiPhut: null,
    khauPhan: 2,
    tacGia: {
      id: 'user-1',
      email: 'a@b.c',
      tenHienThi: 'An',
      anhDaiDien: null,
      vaiTro: 'USER',
      trangThai: 'ACTIVE',
    },
    nguyenLieu: [],
    cacBuoc: [],
    dinhDuong: null,
    ngayTao: new Date().toISOString(),
    ngayCapNhat: new Date().toISOString(),
  };
}

describe('layDanhSachYeuThich', () => {
  it('goi GET favorites va tra ve trang danh sach', async () => {
    const trang: DanhSachTrang<CongThuc> = { noiDung: [taoCongThuc('ct-1')], tongSoPhanTu: 1, tongSoTrang: 1 };
    global.fetch = jest.fn(async () =>
      new Response(JSON.stringify({ success: true, data: trang, error: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as unknown as typeof fetch;

    const ketQua = await layDanhSachYeuThich({ page: 0, size: 10 });

    expect(ketQua.noiDung).toHaveLength(1);
    expect(ketQua.tongSoPhanTu).toBe(1);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(url.url).toContain('favorites');
  });
});
