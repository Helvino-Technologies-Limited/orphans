import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, getAge, getInitials, statusColor } from '../utils/helpers';
import type { Child } from '../types';

const ChildrenPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: '', gender: 'Male', dob: '', estimated_age: '', background: '', guardian_name: '', guardian_contact: '', guardian_relationship: '', special_needs: '', admission_date: new Date().toISOString().split('T')[0] });

  const { data, isLoading } = useQuery({
    queryKey: ['children', search, status],
    queryFn: () => api.get('/children', { params: { search, status, limit: 50 } }).then(r => r.data),
    staleTime: 30000,
  });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/children', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['children'] });
      toast.success('Child registered successfully!');
      setShowModal(false);
      setForm({ full_name: '', gender: 'Male', dob: '', estimated_age: '', background: '', guardian_name: '', guardian_contact: '', guardian_relationship: '', special_needs: '', admission_date: new Date().toISOString().split('T')[0] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to register child'),
  });

  const children: Child[] = data?.children || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Children"
        subtitle={`${data?.total || 0} registered`}
        action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Register Child</button>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="exited">Exited</option>
          <option value="transferred">Transferred</option>
        </select>
      </div>

      {/* Children Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
      ) : children.length === 0 ? (
        <EmptyState icon={Users} title="No children found" description="Start by registering a child to the system." action={<button className="btn-primary" onClick={() => setShowModal(true)}>Register First Child</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map(child => (
            <div key={child.id} onClick={() => navigate(`/children/${child.id}`)} className="card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                  {child.photo_url ? <img src={child.photo_url} alt={child.full_name} className="w-12 h-12 rounded-xl object-cover" /> : getInitials(child.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{child.full_name}</h3>
                    <span className={`badge ${statusColor(child.status)} flex-shrink-0`}>{child.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{child.child_no}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{child.gender}</span>
                    <span>•</span>
                    <span>{getAge(child.dob, child.estimated_age)}</span>
                    <span>•</span>
                    <span>{formatDate(child.admission_date)}</span>
                  </div>
                  {child.special_needs && (
                    <p className="text-xs text-amber-600 mt-1 truncate">⚠ {child.special_needs}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Child" size="lg">
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select className="input" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
            </div>
            <div>
              <label className="label">Estimated Age (if DOB unknown)</label>
              <input type="number" className="input" value={form.estimated_age} onChange={e => setForm(p => ({ ...p, estimated_age: e.target.value }))} />
            </div>
            <div>
              <label className="label">Admission Date *</label>
              <input type="date" className="input" required value={form.admission_date} onChange={e => setForm(p => ({ ...p, admission_date: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Background / History</label>
              <textarea className="input" rows={3} value={form.background} onChange={e => setForm(p => ({ ...p, background: e.target.value }))} />
            </div>
            <div>
              <label className="label">Guardian Name</label>
              <input className="input" value={form.guardian_name} onChange={e => setForm(p => ({ ...p, guardian_name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Guardian Contact</label>
              <input className="input" value={form.guardian_contact} onChange={e => setForm(p => ({ ...p, guardian_contact: e.target.value }))} />
            </div>
            <div>
              <label className="label">Relationship</label>
              <input className="input" value={form.guardian_relationship} onChange={e => setForm(p => ({ ...p, guardian_relationship: e.target.value }))} />
            </div>
            <div>
              <label className="label">Special Needs</label>
              <input className="input" value={form.special_needs} onChange={e => setForm(p => ({ ...p, special_needs: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? 'Registering...' : 'Register Child'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChildrenPage;
