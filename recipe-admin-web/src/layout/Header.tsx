import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="bg-white border-b shrink-0">
      <div className="px-6 py-3 flex items-center justify-end gap-3">
        <span className="text-sm text-gray-700">{user?.displayName}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">ADMIN</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
