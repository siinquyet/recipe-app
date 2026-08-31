import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RecipesPage from './pages/RecipesPage';
import IngredientsPage from './pages/IngredientsPage';
import RecipeReferencesPage from './pages/RecipeReferencesPage';
import PendingRecipesPage from './pages/PendingRecipesPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Cookbook Admin</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/" className="text-gray-600 hover:text-gray-900">Trang chủ</a>
            <a href="/recipes" className="text-gray-600 hover:text-gray-900">Công thức</a>
            <a href="/recipes/pending" className="text-gray-600 hover:text-gray-900">Duyệt bài</a>
            <a href="/ingredients" className="text-gray-600 hover:text-gray-900">Nguyên liệu</a>
            <a href="/references" className="text-gray-600 hover:text-gray-900">References</a>
            <a href="/users" className="text-gray-600 hover:text-gray-900">Người dùng</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/pending" element={<PendingRecipesPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/references" element={<RecipeReferencesPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </main>
    </div>
  );
}
