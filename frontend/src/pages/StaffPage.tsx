import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCheck, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, getInitials } from '../utils/helpers';
import type { Staff } from '../types';

const StaffPage: React.FC = () => {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'caregiver', phone: '', email: '', id_number: '', employment_date: '', shift: 'Day', password: '' });

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: () => api.get('/staff').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/staff', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff member added!'); setShowModal(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add staff'),
  });

  const roleColor = (role: string) => {
    const map: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', caregiver: 'bg-blue-100 text-blue-700', nurse: 'bg-red-100 text-red-700', teacher: 'bg-green-100 text-green-700', cook: 'bg-amber-100 text-amber-700', security: 'bg-gray-100 text-gray-700' };
    return map[role.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff Management"
        subtitle={`${staff.length} team members`}
        action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Staff</button>}
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
      ) : staff.length === 0 ? (
        <EmptyState icon={UserCheck} title="No staff members" description="Add staff to manage the orphanage." action={<button className="btn-primary" onClick={() => setShowModal(true)}>Add First Staff</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(s => (
            <div key={s.id} className="card hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {getInitials(s.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-gray-900 truncate">{s.name}</h3>
                  <span className={`badge ${roleColor(s.role)} capitalize mt-0.5`}>{s.role}</span>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${s.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="mt-3 space-y-1.5">
                {s.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5" />{s.phone}</div>}
                {s.email && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5" /><span className="truncate">{s.email}</span></div>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>Shift: <span className="font-medium text-gray-600">{s.shift || 'N/A'}</span></span>
                <span>Since {formatDate(s.employment_date || s.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Staff Member" size="md">
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-3">
          <div><label className="label">Full Name *</label><input className="input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {['admin', 'manager', 'caregiver', 'nurse', 'teacher', 'cook', 'security', 'volunteer'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Shift</label>
              <select className="input" value={form.shift} onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}>
                {['Day', 'Night', 'Morning', 'Evening', 'Full-time'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><label className="label">ID Number</label><input className="input" value={form.id_number} onChange={e => setForm(p => ({ ...p, id_number: e.target.value }))} /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className="label">Employment Date</label><input type="date" className="input" value={form.employment_date} onChange={e => setForm(p => ({ ...p, employment_date: e.target.value }))} /></div>
            {form.email && <div className="col-span-2"><label className="label">System Password (optional)</label><input type="password" className="input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Create login password" /></div>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Adding...' : 'Add Staff'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffPage;
