import { act } from 'react';
import { useAuthStore } from '../authStore';

jest.mock('../../lib/api/auth', () => ({
  dangNhap: jest.fn(async () => ({ accessToken: 'a', refreshToken: 'r', thoiGianHetHan: 3600 })),
  dangKy: jest.fn(async () => ({ accessToken: 'a', refreshToken: 'r', thoiGianHetHan: 3600 })),
  layThongTinNguoiDung: jest.fn(async () => ({
    id: 'u-1',
    email: 'a@b.c',
    tenHienThi: 'Bếp Nhà',
    anhDaiDien: null,
    vaiTro: 'USER',
    trangThai: 'ACTIVE',
  })),
}));

jest.mock('../../lib/auth/tokenManager', () => ({
  layAccessToken: jest.fn(async () => null),
  luuTokens: jest.fn(async () => {}),
  xoaTokens: jest.fn(async () => {}),
}));

const { layAccessToken } = jest.requireMock('../../lib/auth/tokenManager') as {
  layAccessToken: jest.Mock;
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      nguoiDung: null,
      daDangNhap: false,
      daKhoiTao: false,
      dangTai: false,
      loi: null,
    });
    jest.clearAllMocks();
    layAccessToken.mockResolvedValue(null);
  });

  it('khởi tạo không token → chưa đăng nhập', async () => {
    await act(async () => {
      await useAuthStore.getState().khoiTao();
    });
    const state = useAuthStore.getState();
    expect(state.daKhoiTao).toBe(true);
    expect(state.daDangNhap).toBe(false);
  });

  it('đăng nhập thành công lưu người dùng', async () => {
    await act(async () => {
      await useAuthStore.getState().dangNhap({ email: 'a@b.c', matKhau: 'MatKhau123' });
    });
    const state = useAuthStore.getState();
    expect(state.daDangNhap).toBe(true);
    expect(state.nguoiDung?.tenHienThi).toBe('Bếp Nhà');
    expect(state.loi).toBeNull();
  });

  it('đăng xuất xóa trạng thái', async () => {
    useAuthStore.setState({ nguoiDung: { id: 'u-1' } as never, daDangNhap: true });
    await act(async () => {
      await useAuthStore.getState().dangXuat();
    });
    const state = useAuthStore.getState();
    expect(state.daDangNhap).toBe(false);
    expect(state.nguoiDung).toBeNull();
  });
});
