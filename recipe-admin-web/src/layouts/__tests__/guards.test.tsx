import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../RequireAuth';

test('chưa đăng nhập thì đá về /dang-nhap', () => {
  localStorage.removeItem('user_access_token');
  render(
    <MemoryRouter initialEntries={['/yeu-thich']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/yeu-thich" element={<p>yêu thích</p>} />
        </Route>
        <Route path="/dang-nhap" element={<p>trang đăng nhập</p>} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText('trang đăng nhập')).toBeTruthy();
});
