import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { formatVn } from '@shared/number';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
}

interface UserPage {
  content: User[];
  totalElements: number;
  totalPages: number;
}

async function fetchUsers(page: number = 0): Promise<UserPage> {
  const res = await apiClient.get(`/admin/users?page=${page}&size=20`);
  return res.data;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(0),
  });

  const [actionError, setActionError] = useState('');
  const [result, setResult] = useState('');

  // ADM-03/04: Cấm / mở khóa tài khoản
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      setResult('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => setActionError(err.response?.data?.message || 'Cập nhật trạng thái thất bại'),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý Người dùng</h2>

      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{actionError}</div>
      )}
      {result && (
        <div className="mb-4 px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm">{result}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">STT</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tên hiển thị</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Vai trò</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ngày tạo</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : data?.content.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Chưa có người dùng</td></tr>
            ) : (
              data?.content.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="text-left px-4 py-3 text-sm">{formatVn(i + 1)}</td>
                  <td className="text-left px-4 py-3 text-sm font-medium">{user.displayName}</td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="text-left px-4 py-3 text-sm">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="text-left px-4 py-3 text-sm">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="text-left px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="text-left px-4 py-3 text-sm">
                    {user.status === 'BANNED' ? (
                      <button
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: user.id, status: 'ACTIVE' })}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        Mở khóa
                      </button>
                    ) : (
                      <button
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: user.id, status: 'BANNED' })}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                      >
                        Cấm
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalElements > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Tổng: {formatVn(data.totalElements)} người dùng
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    USER: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    BANNED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
