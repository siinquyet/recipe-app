import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NumberDisplay } from '../NumberDisplay';

test('số format VN và căn phải', () => {
  render(<NumberDisplay value={1500000} unit="đ" />);
  const el = screen.getByText(/1\.500\.000/);
  expect(el.className).toContain('number-vn');
});
