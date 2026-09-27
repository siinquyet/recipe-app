import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { formatVn } from '@shared/number';

interface Recipe {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface RecipePage {
  content: Recipe[];
  totalElements: number;
  totalPages: number;
}

async function fetchRecipes(page: number, status: string): Promise<RecipePage> {
  const params = new URLSearchParams({ page: String(page), size: '10' });
  if (status) params.set('status', status);
  const res = await apiClient.get(`/recipes?${params.toString()}`);
  return res.data;
}

export default function RecipesPage() {
  const [status, setStatus] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['recipes', status],
    queryFn: () => fetchRecipes(0, status === 'ALL' ? '' : status),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Quản lý Công thức</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="HIDDEN">Ẩn</option>
            <option value="DRAFT">Nháp</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">STT</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tên công thức</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">Đang tải...</td>
              </tr>
            ) : data?.content.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">Chưa có công thức</td>
              </tr>
            ) : (
              data?.content.map((recipe, i) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="text-left px-4 py-3 text-sm">{formatVn(i + 1)}</td>
                  <td className="text-left px-4 py-3 text-sm font-medium">{recipe.title}</td>
                  <td className="text-left px-4 py-3 text-sm">
                    <StatusBadge status={recipe.status} />
                  </td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">
                    {new Date(recipe.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalElements > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Tổng: {data.totalElements} công thức
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    HIDDEN: 'bg-gray-100 text-gray-500',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
