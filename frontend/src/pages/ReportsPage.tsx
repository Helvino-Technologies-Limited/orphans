import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, DollarSign, Shield } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import { formatDate, formatKES } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('financial');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: financial, refetch: refetchFin } = useQuery({
    queryKey: ['report-financial', from, to],
    queryFn: () => api.get('/reports/financial', { params: { from, to } }).then(r => r.data),
    enabled: tab === 'financial',
  });

  const { data: childrenReport } = useQuery({
    queryKey: ['report-children'],
    queryFn: () => api.get('/reports/children').then(r => r.data),
    enabled: tab === 'children',
  });

  const { data: audit } = useQuery({
    queryKey: ['report-audit'],
    queryFn: () => api.get('/reports/audit').then(r => r.data),
    enabled: tab === 'audit' && isAdmin,
  });

  const barData = {
    labels: ['Donations', 'Expenses'],
    datasets: [{
      data: [financial?.total_donations || 0, financial?.total_expenses || 0],
      backgroundColor: ['rgba(49,130,246,0.8)', 'rgba(239,68,68,0.8)'],
      borderRadius: 8,
    }],
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Reports & Analytics" subtitle="Financial, child welfare & audit reports" />

      {/* Tab nav */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {[['financial', 'Financial'], ['children', 'Children'], ...(isAdmin ? [['audit', 'Audit Log']] : [])].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === v ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'financial' && (
        <div className="space-y-4">
          {/* Date filter */}
          <div className="flex gap-3 flex-wrap items-end">
            <div><label className="label">From</label><input type="date" className="input w-auto" value={from} onChange={e => setFrom(e.target.value)} /></div>
            <div><label className="label">To</label><input type="date" className="input w-auto" value={to} onChange={e => setTo(e.target.value)} /></div>
          </div>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card"><p className="text-xs text-gray-500">Total Donations</p><p className="text-2xl font-display font-bold text-green-600 mt-1">{formatKES(financial?.total_donations)}</p></div>
            <div className="card"><p className="text-xs text-gray-500">Total Expenses</p><p className="text-2xl font-display font-bold text-red-600 mt-1">{formatKES(financial?.total_expenses)}</p></div>
            <div className="card"><p className="text-xs text-gray-500">Net Balance</p><p className={`text-2xl font-display font-bold mt-1 ${(financial?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatKES(financial?.balance)}</p></div>
          </div>
          <div className="card max-w-md">
            <h3 className="font-semibold mb-3">Financial Overview</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          {/* Donations table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold">Donations ({financial?.donations?.length || 0})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="table-header"><th className="text-left px-4 py-3">Donor</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Amount</th><th className="text-left px-4 py-3">Date</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(financial?.donations || []).slice(0, 20).map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{d.donor_name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500 capitalize">{d.donation_type}</td>
                      <td className="px-4 py-2.5 text-sm font-bold text-gray-900">{formatKES(d.amount)}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{formatDate(d.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'children' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold">Children Report ({(childrenReport || []).length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="table-header"><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">ID</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Admitted</th><th className="text-left px-4 py-3">Health Visits</th><th className="text-left px-4 py-3">Activities</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(childrenReport || []).map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{c.full_name}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{c.child_no}</td>
                    <td className="px-4 py-2.5"><span className={`badge capitalize ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span></td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{formatDate(c.admission_date)}</td>
                    <td className="px-4 py-2.5 text-sm text-center text-gray-700">{c.health_visits}</td>
                    <td className="px-4 py-2.5 text-sm text-center text-gray-700">{c.total_activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'audit' && isAdmin && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold">Audit Log (Last 100 actions)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="table-header"><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Action</th><th className="text-left px-4 py-3">Entity</th><th className="text-left px-4 py-3">Time</th><th className="text-left px-4 py-3">IP</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(audit || []).map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{log.user_name}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-primary-600">{log.action}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{log.entity_type}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{formatDate(log.created_at)}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
