import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { StatsCard } from '../components/StatsCard';

interface Stats {
  totalRecipes: number;
  pendingRecipes: number;
  totalIngredients: number;
  totalUsers: number;
}

async function fetchStats(): Promise<Stats> {
  const res = await axios.get('/api/v1/admin/stats');
  return res.data;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng công thức"
          value={isLoading ? '...' : stats?.totalRecipes ?? '--'}
          icon="📖"
        />
        <StatsCard
          title="Chờ duyệt"
          value={isLoading ? '...' : stats?.pendingRecipes ?? '--'}
          subtitle="Cần xử lý"
          icon="⏳"
        />
        <StatsCard
          title="Nguyên liệu"
          value={isLoading ? '...' : stats?.totalIngredients ?? '--'}
          icon="🥬"
        />
        <StatsCard
          title="Người dùng"
          value={isLoading ? '...' : stats?.totalUsers ?? '--'}
          icon="👥"
        />
      </div>
    </div>
  );
}
