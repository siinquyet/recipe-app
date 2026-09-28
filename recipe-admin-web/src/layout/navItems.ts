/**
 * Danh sach muc dieu huong cua trang quan tri.
 *
 * Tach rieng de Sidebar va test deu dung mot nguon - truoc day App.tsx viet
 * truc tiep 7 the `<a href>` nen du cap nhat duong dan la phai sua hai cho.
 */
export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Trang chủ', icon: '📊' },
  { to: '/recipes', label: 'Công thức', icon: '📖' },
  { to: '/recipes/pending', label: 'Duyệt bài', icon: '✅' },
  { to: '/food-check', label: 'Duyệt món', icon: '🥗' },
  { to: '/ingredients', label: 'Nguyên liệu', icon: '🧂' },
  { to: '/references', label: 'References', icon: '🌐' },
  { to: '/users', label: 'Người dùng', icon: '👥' },
];
