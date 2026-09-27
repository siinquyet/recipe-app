import { useState } from 'react';
import { apiClient } from '../api/client';

interface FoodCheckPair {
  a: string;
  b: string;
  level: 'CONFLICT' | 'HARMONIOUS' | 'NEUTRAL';
  note: string | null;
  source: string | null;
}

interface FoodCheckResult {
  items: string[];
  pairs: FoodCheckPair[];
  summary: { conflicts: number; harmonious: number; neutrals: number };
}

const LEVEL_META: Record<FoodCheckPair['level'], { label: string; badge: string; dot: string }> = {
  CONFLICT: { label: 'Kỵ / Độc', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  HARMONIOUS: { label: 'Hợp', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  NEUTRAL: { label: 'Trung tính', badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

export default function FoodCheckPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<FoodCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheck() {
    const items = input
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (items.length < 2) {
      setError('Cần ít nhất 2 món để kiểm tra tương tác.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/food-compatibility/check', { items });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không kiểm tra được, vui lòng thử lại.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setInput('');
    setResult(null);
    setError('');
  }

  // Ưu tiên hiện cảnh báo KỴ lên trước, rồi HỢP, rồi TRUNG TÍNH
  const sortedPairs = [...(result?.pairs ?? [])].sort((a, b) => {
    const order = { CONFLICT: 0, HARMONIOUS: 1, NEUTRAL: 2 };
    return order[a.level] - order[b.level];
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">AI Duyệt Món — Kiểm tra tương tác</h2>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhập danh sách món / nguyên liệu (mỗi dòng 1 món)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder={'Ví dụ:\nTôm\nNước cam\nThịt bò\nHành tây'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra tương tác'}
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Xóa
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Kết quả dựa trên bảng rule tương tác thực phẩm (kèm nguồn tham khảo) — mức{' '}
          <span className="text-red-600 font-medium">Kỵ/Độc</span> ưu tiên cảnh báo trước.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{result.summary.conflicts}</div>
              <div className="text-sm text-gray-500">Kỵ / Độc</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{result.summary.harmonious}</div>
              <div className="text-sm text-gray-500">Hợp</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{result.summary.neutrals}</div>
              <div className="text-sm text-gray-500">Trung tính</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Món A</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Món B</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Mức</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedPairs.map((pair, i) => {
                  const meta = LEVEL_META[pair.level];
                  return (
                    <tr key={`${pair.a}-${pair.b}-${i}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{pair.a}</td>
                      <td className="px-4 py-3 text-sm font-medium">{pair.b}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${meta.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {pair.note ?? '--'}
                        {pair.source && (
                          <div className="text-xs text-gray-400 mt-0.5">Nguồn: {pair.source}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}