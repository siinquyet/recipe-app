import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Recipe {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  author?: { fullName: string };
}

interface RecipePage {
  content: Recipe[];
  totalElements: number;
  totalPages: number;
}

async function fetchPending(): Promise<RecipePage> {
  const res = await axios.get('/api/v1/recipes?status=PENDING&size=50');
  return res.data;
}

export default function PendingRecipesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pending-recipes'],
    queryFn: fetchPending,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Duyệt Công thức</h2>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
          {data?.totalElements ?? 0} chờ duyệt
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">STT</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tên công thức</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tác giả</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ngày gửi</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : data?.content.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Không có công thức chờ duyệt</td></tr>
            ) : (
              data?.content.map((recipe, i) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="text-left px-4 py-3 text-sm">{i + 1}</td>
                  <td className="text-left px-4 py-3 text-sm font-medium">{recipe.title}</td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">{recipe.author?.fullName || '--'}</td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">
                    {new Date(recipe.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="text-left px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        Duyệt
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
