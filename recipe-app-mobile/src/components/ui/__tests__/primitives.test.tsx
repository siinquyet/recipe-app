import { fireEvent, render } from '@testing-library/react-native';
import { NutBam } from '../NutBam';
import { TrangLoi, TrangTrong } from '../TrangThai';
import { BodyText, CaptionText, TitleText } from '../VanBan';

describe('VanBan', () => {
  it('render 3 cấp chữ', async () => {
    const { getByText } = await render(
      <>
        <BodyText>Nội dung</BodyText>
        <TitleText>Tiêu đề</TitleText>
        <CaptionText>Ghi chú</CaptionText>
      </>,
    );
    expect(getByText('Nội dung')).toBeTruthy();
    expect(getByText('Tiêu đề')).toBeTruthy();
    expect(getByText('Ghi chú')).toBeTruthy();
  });
});

describe('NutBam', () => {
  it('gọi khiBam khi bấm', async () => {
    const khiBam = jest.fn();
    const { getByText } = await render(<NutBam tieuDe="Lưu" khiBam={khiBam} />);
    await fireEvent.press(getByText('Lưu'));
    expect(khiBam).toHaveBeenCalledTimes(1);
  });

  it('không gọi khiBam khi vô hiệu hóa', async () => {
    const khiBam = jest.fn();
    const { getByText } = await render(<NutBam tieuDe="Lưu" khiBam={khiBam} voHieuHoa />);
    await fireEvent.press(getByText('Lưu'));
    expect(khiBam).not.toHaveBeenCalled();
  });
});

describe('TrangThai', () => {
  it('TrangTrong hiển thị tiêu đề và mô tả', async () => {
    const { getByText } = await render(<TrangTrong tieuDe="Trống" moTa="Chưa có dữ liệu" />);
    expect(getByText('Trống')).toBeTruthy();
    expect(getByText('Chưa có dữ liệu')).toBeTruthy();
  });

  it('TrangLoi hiển thị lỗi và nút thử lại', async () => {
    const khiThuLai = jest.fn();
    const { getByText } = await render(<TrangLoi loi="Mất mạng" khiThuLai={khiThuLai} />);
    expect(getByText('Mất mạng')).toBeTruthy();
    await fireEvent.press(getByText('Thử lại'));
    expect(khiThuLai).toHaveBeenCalledTimes(1);
  });
});
