import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, DollarSign, Package, AlertTriangle, TrendingUp, Activity, UserPlus } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../utils/api';
import StatCard from '../components/ui/StatCard';
import { formatKES, timeAgo } from '../utils/helpers';
import type { DashboardStats } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/dashboard/alerts').then(r => r.data),
    refetchInterval: 60000,
  });

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
    </div>
  );

  const chartData = {
    labels: (stats?.monthly_trend || []).reverse().map(t => {
      const d = new Date(t.month);
      return d.toLocaleString('default', { month: 'short' });
    }),
    datasets: [{
      label: 'Children Admitted',
      data: (stats?.monthly_trend || []).reverse().map(t => t.count),
      borderColor: '#3182f6',
      backgroundColor: 'rgba(49,130,246,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#3182f6',
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Real-time orphanage overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Children" value={stats?.total_children || 0} icon={Users} color="text-primary-600" bgColor="bg-primary-50" subtitle="Currently active" />
        <StatCard title="Staff On Record" value={stats?.total_staff || 0} icon={UserCheck} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="This Month" value={formatKES(stats?.monthly_donations)} icon={DollarSign} color="text-amber-600" bgColor="bg-amber-50" subtitle="Donations received" />
        <StatCard title="New Admissions" value={stats?.new_admissions_this_month || 0} icon={UserPlus} color="text-purple-600" bgColor="bg-purple-50" subtitle="This month" />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(stats?.low_stock_alerts || 0) > 0 && (
          <div className="card border-l-4 border-l-orange-400 bg-orange-50 border-orange-100">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-800 text-sm">{stats?.low_stock_alerts} Low Stock</p>
                <p className="text-xs text-orange-600">Items need restocking</p>
              </div>
            </div>
          </div>
        )}
        {(stats?.open_incidents || 0) > 0 && (
          <div className="card border-l-4 border-l-red-400 bg-red-50 border-red-100">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-semibold text-red-800 text-sm">{stats?.open_incidents} Open Incidents</p>
                <p className="text-xs text-red-600">Require attention</p>
              </div>
            </div>
          </div>
        )}
        {(alerts?.upcoming_vaccinations?.length || 0) > 0 && (
          <div className="card border-l-4 border-l-blue-400 bg-blue-50 border-blue-100">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-semibold text-blue-800 text-sm">{alerts?.upcoming_vaccinations?.length} Vaccinations</p>
                <p className="text-xs text-blue-600">Due in 7 days</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="font-display font-semibold text-gray-900">Admission Trends</h2>
          </div>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h2 className="font-display font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="space-y-3">
            {(stats?.recent_activities || []).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">No recent activities</p>
            )}
            {(stats?.recent_activities || []).slice(0, 7).map(act => (
              <div key={act.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                  {act.child_name?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{act.child_name}</p>
                  <p className="text-xs text-gray-500">{act.activity_type} — {act.description?.slice(0, 50)}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(act.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(alerts?.low_stock?.length || 0) > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" /> Low Stock Alerts
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {alerts.low_stock.map((item: any) => (
              <div key={item.item_name} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="font-semibold text-sm text-orange-900">{item.item_name}</p>
                <p className="text-xs text-orange-600 mt-0.5">{item.quantity} {item.unit} remaining</p>
                <p className="text-xs text-orange-400">Min: {item.minimum_stock}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
