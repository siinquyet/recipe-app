import { fireEvent, render } from '@testing-library/react-native';
import type { CongThuc } from '../../../types/api';
import { DanhSachCongThuc } from '../DanhSachCongThuc';

jest.mock('expo-image', () => {
  const { Image } = jest.requireActual('react-native');
  return { Image };
});

jest.mock('lucide-react-native', () => {
  const { Text } = jest.requireActual('react-native');
  const Stub = () => <Text>icon</Text>;
  return { __esModule: true, Clock: Stub, Star: Stub, Users: Stub };
});

function taoCongThuc(id: string, ten: string): CongThuc {
  return {
    id,
    ten,
    moTa: null,
    anhThumbnail: null,
    thoiGianNauPhut: 30,
    thoiGianChuanBiPhut: null,
    khauPhan: 2,
    tacGia: {
      id: 'u-1',
      email: 'a@b.c',
      tenHienThi: 'Bếp Nhà',
      anhDaiDien: null,
      vaiTro: 'USER',
      trangThai: 'ACTIVE',
    },
    nguyenLieu: [],
    cacBuoc: [],
    dinhDuong: null,
    ngayTao: '2026-01-01T00:00:00.000Z',
    ngayCapNhat: '2026-01-01T00:00:00.000Z',
  };
}

describe('DanhSachCongThuc', () => {
  it('render danh sách và gọi khiChon đúng id', async () => {
    const khiChon = jest.fn();
    const { getByText } = await render(
      <DanhSachCongThuc
        duLieu={[taoCongThuc('1', 'Phở bò'), taoCongThuc('2', 'Bún chả')]}
        dangTai={false}
        khiChon={khiChon}
      />,
    );
    expect(getByText('Phở bò')).toBeTruthy();
    await fireEvent.press(getByText('Bún chả'));
    expect(khiChon).toHaveBeenCalledWith('2');
  });

  it('hiển thị trạng thái tải khi chưa có dữ liệu', async () => {
    const { getByText } = await render(<DanhSachCongThuc duLieu={[]} dangTai />);
    expect(getByText('Đang tải...')).toBeTruthy();
  });

  it('hiển thị trạng thái trống', async () => {
    const { getByText } = await render(<DanhSachCongThuc duLieu={[]} dangTai={false} />);
    expect(getByText('Chưa có công thức')).toBeTruthy();
  });

  it('hiển thị lỗi kèm nút thử lại', async () => {
    const khiLamMoi = jest.fn();
    const { getByText } = await render(
      <DanhSachCongThuc duLieu={[]} dangTai={false} loi="Mất mạng" khiLamMoi={khiLamMoi} />,
    );
    expect(getByText('Mất mạng')).toBeTruthy();
    await fireEvent.press(getByText('Thử lại'));
    expect(khiLamMoi).toHaveBeenCalledTimes(1);
  });
});
