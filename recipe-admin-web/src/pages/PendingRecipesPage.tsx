import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { formatVn } from '@shared/number';

interface Recipe {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  author?: { displayName: string };
}

interface RecipePage {
  content: Recipe[];
  totalElements: number;
  totalPages: number;
}

async function fetchPending(): Promise<RecipePage> {
  const res = await apiClient.get('/recipes?status=PENDING&page=0&size=50');
  return res.data;
}

export default function PendingRecipesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['pending-recipes'],
    queryFn: fetchPending,
  });
  const [rejectTarget, setRejectTarget] = useState<Recipe | null>(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');

  // BR-02: Admin duyệt công thức PENDING -> APPROVED
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/recipes/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-recipes'] }),
    onError: (err: any) => setActionError(err.response?.data?.message || 'Duyệt thất bại'),
  });

  // BR-02: Admin từ chối kèm lý do khớp rejectReason
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.patch(`/admin/recipes/${id}/reject`, { reason }),
    onSuccess: () => {
      setRejectTarget(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['pending-recipes'] });
    },
    onError: (err: any) => setActionError(err.response?.data?.message || 'Từ chối thất bại'),
  });

  function handleReject() {
    if (!rejectTarget) return;
    if (!reason.trim()) {
      setActionError('[ADM-02] Vui lòng nhập lý do từ chối');
      return;
    }
    rejectMutation.mutate({ id: rejectTarget.id, reason: reason.trim() });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Duyệt Công thức</h2>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
          {data?.totalElements ?? 0} chờ duyệt
        </span>
      </div>

      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {actionError}
        </div>
      )}

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
                  <td className="text-left px-4 py-3 text-sm">{formatVn(i + 1)}</td>
                  <td className="text-left px-4 py-3 text-sm font-medium">{recipe.title}</td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">{recipe.author?.displayName || '--'}</td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">
                    {new Date(recipe.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="text-left px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(recipe.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {approveMutation.isPending ? 'Đang xử lý...' : 'Duyệt'}
                      </button>
                      <button
                        onClick={() => setRejectTarget(recipe)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
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

      {data && data.totalElements > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Tổng: {formatVn(data.totalElements)} công thức chờ duyệt
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-1">Từ chối công thức</h3>
            <p className="text-sm text-gray-500 mb-4">"{rejectTarget.title}"</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Thiếu hình ảnh, thông tin dinh dưỡng..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectTarget(null); setReason(''); setActionError(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                disabled={rejectMutation.isPending}
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Đang gửi...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}