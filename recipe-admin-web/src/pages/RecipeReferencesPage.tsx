import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { formatVn } from '@shared/number';
import { StatusBadge } from '../components/ui/StatusBadge';

interface RecipeReference {
  id: string;
  source: string;
  externalId: string;
  title: string;
  imageUrl: string | null;
  servings: number;
  status: string;
  spoonacularScore: number | null;
  healthScore: number | null;
  aggregateLikes: number | null;
  lastSyncedAt: string | null;
}

interface RefPage {
  content: RecipeReference[];
  totalElements: number;
  totalPages: number;
}

async function fetchRefs(page: number = 0): Promise<RefPage> {
  const res = await apiClient.get(`/recipe-references?page=${page}&size=20`);
  return res.data;
}

export default function RecipeReferencesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['recipe-refs'],
    queryFn: () => fetchRefs(0),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Recipe References (Spoonacular)</h2>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">STT</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tên</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nguồn</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Khẩu phần</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Score</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Health</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Lần sync cuối</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : data?.content.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Chưa có reference</td></tr>
            ) : (
              data?.content.map((ref, i) => (
                <tr key={ref.id} className="hover:bg-gray-50">
                  <td className="text-left px-4 py-3 text-sm">{formatVn(i + 1)}</td>
                  <td className="text-left px-4 py-3 text-sm font-medium max-w-[200px] truncate">{ref.title}</td>
                  <td className="text-left px-4 py-3 text-sm">{ref.source}</td>
                  <td className="text-right px-4 py-3 text-sm">{ref.servings}</td>
                  <td className="text-right px-4 py-3 text-sm number-vn">{ref.spoonacularScore ?? '--'}</td>
                  <td className="text-right px-4 py-3 text-sm number-vn">{ref.healthScore ?? '--'}</td>
                  <td className="text-left px-4 py-3 text-sm">
                    <StatusBadge status={ref.status} />
                  </td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">
                    {ref.lastSyncedAt ? new Date(ref.lastSyncedAt).toLocaleDateString('vi-VN') : '--'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalElements > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Tổng: {formatVn(data.totalElements)} references
        </div>
      )}
    </div>
  );
}
