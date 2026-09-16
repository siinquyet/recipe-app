import { fireEvent, render } from '@testing-library/react-native';
import type { DuLieuTheCongThuc } from '../../recipe/TheCongThuc';
import { TheCongThuc } from '../../recipe/TheCongThuc';

jest.mock('expo-image', () => {
  const { Image } = jest.requireActual('react-native');
  return { Image };
});

jest.mock('lucide-react-native', () => {
  const { Text } = jest.requireActual('react-native');
  const Stub = () => <Text>icon</Text>;
  return { __esModule: true, Clock: Stub, Star: Stub, Users: Stub };
});

const mau: DuLieuTheCongThuc = {
  id: 'ct-1',
  hinhAnh: null,
  tenMon: 'Phở bò Hà Nội',
  thoiGianNau: 120,
  khauPhan: 4,
  tacGia: 'Bếp Nhà',
  tacGiaAvatar: null,
  diemDanhGia: 4.8,
  soLuotDanhGia: 230,
};

describe('TheCongThuc', () => {
  it.each(['compact', 'large', 'grid'] as const)('render biến thể %s đầy đủ thông tin', async (bienThe) => {
    const { getByText } = await render(<TheCongThuc duLieu={mau} bienThe={bienThe} />);
    expect(getByText('Phở bò Hà Nội')).toBeTruthy();
    expect(getByText('120 p')).toBeTruthy();
    expect(getByText('4 người')).toBeTruthy();
  });

  it.each(['compact', 'grid'] as const)('biến thể %s hiển thị badge điểm', async (bienThe) => {
    const { getByText } = await render(<TheCongThuc duLieu={mau} bienThe={bienThe} />);
    expect(getByText('4.8')).toBeTruthy();
  });

  it('gọi khiBam khi bấm vào thẻ', async () => {
    const khiBam = jest.fn();
    const { getByText } = await render(<TheCongThuc duLieu={mau} khiBam={khiBam} />);
    await fireEvent.press(getByText('Phở bò Hà Nội'));
    expect(khiBam).toHaveBeenCalledTimes(1);
  });

  it('ẩn badge đánh giá khi chưa có điểm', async () => {
    const { queryByText } = await render(<TheCongThuc duLieu={{ ...mau, diemDanhGia: 0 }} />);
    expect(queryByText('0.0')).toBeNull();
  });

  it('hiển thị chữ cái đầu khi thiếu ảnh', async () => {
    const { getByText } = await render(
      <TheCongThuc duLieu={{ ...mau, hinhAnh: null }} bienThe="compact" />,
    );
    expect(getByText('P')).toBeTruthy();
  });
});
