import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RecipesPage from './pages/RecipesPage';
import IngredientsPage from './pages/IngredientsPage';
import RecipeReferencesPage from './pages/RecipeReferencesPage';
import PendingRecipesPage from './pages/PendingRecipesPage';
import UsersPage from './pages/UsersPage';
import FoodCheckPage from './pages/FoodCheckPage';
import LoginPage from './pages/auth/LoginPage';
import AdminLayout from './layout/AdminLayout';

/**
 * Bang dinh nghia route cua trang quan tri.
 *
 * Tat ca trang con nam duoi `<Route element={<AdminLayout/>}>` nen duoc bao ve
 * va hien thi trong khung chung mot lan - khong con lap `<RequireAdmin>` o
 * tung route nhu truoc day.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/pending" element={<PendingRecipesPage />} />
        <Route path="/food-check" element={<FoodCheckPage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
        <Route path="/references" element={<RecipeReferencesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
