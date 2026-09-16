import { fireEvent, render } from '@testing-library/react-native';
import { NumberDisplay } from '../NumberDisplay';

describe('NumberDisplay', () => {
  it('hiển thị số format VN căn phải kèm đơn vị', async () => {
    const { getByText } = await render(<NumberDisplay value={1500} unit="g" />);
    expect(getByText('1.500 g')).toBeTruthy();
  });

  it('hiển thị không đơn vị khi unit rỗng', async () => {
    const { getByText } = await render(<NumberDisplay value={100000} />);
    expect(getByText('100.000')).toBeTruthy();
  });

  it('hỗ trợ chuỗi số', async () => {
    const { getByText } = await render(<NumberDisplay value="2500" unit="ml" />);
    expect(getByText('2.500 ml')).toBeTruthy();
  });

  it('hiển thị 0 khi giá trị bằng 0', async () => {
    const { getByText } = await render(<NumberDisplay value={0} />);
    expect(getByText('0')).toBeTruthy();
    expect(fireEvent).toBeDefined();
  });
});
