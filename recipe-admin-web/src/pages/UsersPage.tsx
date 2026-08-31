import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
  const res = await axios.get(`/api/v1/admin/users?page=${page}&size=20`);
  return res.data;
}

export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(0),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý Người dùng</h2>

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
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : data?.content.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Chưa có người dùng</td></tr>
            ) : (
              data?.content.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="text-left px-4 py-3 text-sm">{i + 1}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalElements > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Tổng: {data.totalElements} người dùng
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
