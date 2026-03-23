import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, timeAgo } from '../utils/helpers';

const ActivitiesPage: React.FC = () => {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ child_id: '', activity_type: 'meal', description: '', activity_date: new Date().toISOString().split('T')[0] });

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities').then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: children } = useQuery({
    queryKey: ['children-list'],
    queryFn: () => api.get('/children', { params: { status: 'active', limit: 200 } }).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/activities', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Activity logged!'); setShowModal(false); },
    onError: () => toast.error('Failed to log activity'),
  });

  const typeColor = (t: string) => {
    const m: Record<string, string> = { meal: 'bg-amber-100 text-amber-700', education: 'bg-blue-100 text-blue-700', play: 'bg-green-100 text-green-700', counseling: 'bg-purple-100 text-purple-700', medical: 'bg-red-100 text-red-700', chores: 'bg-gray-100 text-gray-700' };
    return m[t] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Daily Activities"
        subtitle="Track meals, education & welfare"
        action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Log Activity</button>}
      />

      {isLoading ? <div className="skeleton h-64 rounded-xl" /> : activities.length === 0 ? (
        <EmptyState icon={Activity} title="No activities logged" description="Start logging daily activities for children." action={<button className="btn-primary" onClick={() => setShowModal(true)}>Log First Activity</button>} />
      ) : (
        <div className="space-y-3">
          {activities.map((a: any) => (
            <div key={a.id} className="card flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{a.child_name}</p>
                    <span className={`badge ${typeColor(a.activity_type)} capitalize mt-0.5`}>{a.activity_type}</span>
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo(a.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5">{a.description}</p>
                {a.recorded_by_name && <p className="text-xs text-gray-400 mt-1">by {a.recorded_by_name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Daily Activity">
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-3">
          <div>
            <label className="label">Child *</label>
            <select className="input" required value={form.child_id} onChange={e => setForm(p => ({ ...p, child_id: e.target.value }))}>
              <option value="">Select a child...</option>
              {(children?.children || []).map((c: any) => <option key={c.id} value={c.id}>{c.full_name} ({c.child_no})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Activity Type</label>
              <select className="input" value={form.activity_type} onChange={e => setForm(p => ({ ...p, activity_type: e.target.value }))}>
                {['meal', 'education', 'play', 'counseling', 'medical', 'chores', 'recreation', 'other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.activity_date} onChange={e => setForm(p => ({ ...p, activity_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input" rows={3} required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the activity..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Logging...' : 'Log Activity'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ActivitiesPage;
