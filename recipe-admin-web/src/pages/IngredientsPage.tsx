import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Ingredient {
  id: string;
  canonicalName: string;
  normalizedName: string;
  category: string | null;
  unitCategory: string;
  defaultUnit: string;
}

interface IngredientPage {
  content: Ingredient[];
  totalElements: number;
  totalPages: number;
}

async function fetchIngredients(page: number = 0): Promise<IngredientPage> {
  const res = await axios.get(`/api/v1/ingredients?page=${page}&size=20`);
  return res.data;
}

export default function IngredientsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => fetchIngredients(0),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý Nguyên liệu</h2>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">STT</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tên chuẩn</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nhóm</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Loại đơn vị</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Đơn vị mặc định</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Đang tải...</td>
              </tr>
            ) : data?.content.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Chưa có nguyên liệu</td>
              </tr>
            ) : (
              data?.content.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="text-left px-4 py-3 text-sm">{i + 1}</td>
                  <td className="text-left px-4 py-3 text-sm font-medium">{item.canonicalName}</td>
                  <td className="text-left px-4 py-3 text-sm">{item.category || '--'}</td>
                  <td className="text-left px-4 py-3 text-sm">{item.unitCategory}</td>
                  <td className="text-left px-4 py-3 text-sm">{item.defaultUnit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalElements > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Tổng: {data.totalElements} nguyên liệu
        </div>
      )}
    </div>
  );
}
