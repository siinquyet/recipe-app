import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RecipesPage from './pages/RecipesPage';
import IngredientsPage from './pages/IngredientsPage';
import RecipeReferencesPage from './pages/RecipeReferencesPage';
import PendingRecipesPage from './pages/PendingRecipesPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import FoodCheckPage from './pages/FoodCheckPage';
import { useAuthStore } from './stores/authStore';

function RequireAdmin({ children }: { children: React.ReactElement }) {
  const { accessToken, user } = useAuthStore();
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && user.role === 'ADMIN' && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Cookbook Admin</h1>
            <div className="flex items-center gap-6">
              <nav className="flex gap-4 text-sm">
                <a href="/" className="text-gray-600 hover:text-gray-900">Trang chủ</a>
                <a href="/recipes" className="text-gray-600 hover:text-gray-900">Công thức</a>
                <a href="/recipes/pending" className="text-gray-600 hover:text-gray-900">Duyệt bài</a>
                <a href="/food-check" className="text-gray-600 hover:text-gray-900">Duyệt món</a>
                <a href="/ingredients" className="text-gray-600 hover:text-gray-900">Nguyên liệu</a>
                <a href="/references" className="text-gray-600 hover:text-gray-900">References</a>
                <a href="/users" className="text-gray-600 hover:text-gray-900">Người dùng</a>
              </nav>
              <div className="flex items-center gap-3 border-l pl-6">
                <span className="text-sm text-gray-700">{user.displayName}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">ADMIN</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-600 transition"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAdmin>
                <DashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/recipes"
            element={
              <RequireAdmin>
                <RecipesPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/recipes/pending"
            element={
              <RequireAdmin>
                <PendingRecipesPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/food-check"
            element={
              <RequireAdmin>
                <FoodCheckPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/ingredients"
            element={
              <RequireAdmin>
                <IngredientsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/references"
            element={
              <RequireAdmin>
                <RecipeReferencesPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}