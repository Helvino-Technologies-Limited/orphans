import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, severityColor, statusColor, timeAgo } from '../utils/helpers';
import type { Incident } from '../types';

const IncidentsPage: React.FC = () => {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', incident_type: 'general', severity: 'low', child_id: '' });

  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: () => api.get('/incidents').then(r => r.data),
  });

  const { data: children } = useQuery({
    queryKey: ['children-list'],
    queryFn: () => api.get('/children', { params: { status: 'active', limit: 200 } }).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/incidents', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Incident reported!'); setShowModal(false); },
    onError: () => toast.error('Failed to report incident'),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/incidents/${id}/resolve`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Incident resolved!'); },
    onError: () => toast.error('Failed to resolve'),
  });

  const open = incidents.filter(i => i.status === 'open');
  const resolved = incidents.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-5">
      <PageHeader
        title="Incidents"
        subtitle={`${open.length} open · ${resolved.length} resolved`}
        action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Report Incident</button>}
      />

      {isLoading ? <div className="skeleton h-64 rounded-xl" /> : incidents.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No incidents" description="All clear! Report any incident immediately." action={<button className="btn-primary" onClick={() => setShowModal(true)}>Report Incident</button>} />
      ) : (
        <div className="space-y-3">
          {incidents.map(inc => (
            <div key={inc.id} className={`card border-l-4 ${inc.status === 'open' ? 'border-l-red-400' : 'border-l-green-400'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-gray-900">{inc.title}</h3>
                      <span className={`badge ${severityColor(inc.severity)}`}>{inc.severity}</span>
                      <span className={`badge ${statusColor(inc.status)}`}>{inc.status}</span>
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(inc.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5">{inc.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {inc.child_name && <span>Child: <span className="font-medium text-gray-600">{inc.child_name}</span></span>}
                    {inc.reported_by_name && <span>By: <span className="font-medium">{inc.reported_by_name}</span></span>}
                    <span>{formatDate(inc.created_at)}</span>
                  </div>
                </div>
                {inc.status === 'open' && (
                  <button onClick={() => resolveMutation.mutate(inc.id)} disabled={resolveMutation.isPending} className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report Incident">
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-3">
          <div><label className="label">Title *</label><input className="input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.incident_type} onChange={e => setForm(p => ({ ...p, incident_type: e.target.value }))}>
                {['general', 'medical', 'behavioral', 'safety', 'security', 'abuse', 'missing'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                {['low', 'medium', 'high', 'critical'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Involved Child (Optional)</label>
            <select className="input" value={form.child_id} onChange={e => setForm(p => ({ ...p, child_id: e.target.value }))}>
              <option value="">None / General Incident</option>
              {(children?.children || []).map((c: any) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div><label className="label">Description *</label><textarea className="input" rows={4} required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-danger flex-1">{mutation.isPending ? 'Reporting...' : 'Report Incident'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncidentsPage;
