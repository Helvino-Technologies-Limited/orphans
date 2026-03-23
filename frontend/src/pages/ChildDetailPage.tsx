import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, BookOpen, Activity, Syringe, Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Modal from '../components/ui/Modal';
import { formatDate, getAge, statusColor } from '../utils/helpers';

const tabs = ['Overview', 'Health', 'Education', 'Activities', 'Vaccinations'];

const ChildDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('Overview');
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showVaxModal, setShowVaxModal] = useState(false);
  const [healthForm, setHealthForm] = useState({ record_type: 'checkup', description: '', diagnosis: '', treatment: '', doctor_name: '', visit_date: new Date().toISOString().split('T')[0], medications: '' });
  const [actForm, setActForm] = useState({ activity_type: 'meal', description: '', activity_date: new Date().toISOString().split('T')[0] });
  const [vaxForm, setVaxForm] = useState({ vaccine_name: '', date_given: '', next_due: '', given_by: '' });

  const { data: child, isLoading } = useQuery({
    queryKey: ['child', id],
    queryFn: () => api.get(`/children/${id}`).then(r => r.data),
  });

  const healthMutation = useMutation({
    mutationFn: (d: any) => api.post('/health', { ...d, child_id: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['child', id] }); toast.success('Health record added!'); setShowHealthModal(false); },
    onError: () => toast.error('Failed to add health record'),
  });

  const actMutation = useMutation({
    mutationFn: (d: any) => api.post('/activities', { ...d, child_id: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['child', id] }); toast.success('Activity logged!'); setShowActivityModal(false); },
    onError: () => toast.error('Failed to log activity'),
  });

  const vaxMutation = useMutation({
    mutationFn: (d: any) => api.post('/health/vaccination', { ...d, child_id: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['child', id] }); toast.success('Vaccination recorded!'); setShowVaxModal(false); },
    onError: () => toast.error('Failed to record vaccination'),
  });

  if (isLoading) return <div className="space-y-4"><div className="skeleton h-48 rounded-xl" /><div className="skeleton h-96 rounded-xl" /></div>;
  if (!child) return <div className="card text-center py-12 text-gray-500">Child not found</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/children')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-display font-bold text-xl text-gray-900">Child Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow">
            {child.full_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">{child.full_name}</h2>
                <p className="text-sm text-gray-500 font-mono">{child.child_no}</p>
              </div>
              <span className={`badge ${statusColor(child.status)}`}>{child.status}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                ['Gender', child.gender],
                ['Age', getAge(child.dob, child.estimated_age)],
                ['Admitted', formatDate(child.admission_date)],
                ['Guardian', child.guardian_name || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {child.background && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Background</p>
            <p className="text-sm text-gray-700">{child.background}</p>
          </div>
        )}
        {child.special_needs && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm font-medium text-amber-800">⚠ Special Needs: {child.special_needs}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" />Recent Health</h3>
            {(child.health_records || []).slice(0, 3).map((h: any) => (
              <div key={h.id} className="py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900">{h.record_type} — {h.diagnosis || h.description}</p>
                <p className="text-xs text-gray-400">{formatDate(h.visit_date)} · Dr. {h.doctor_name || 'N/A'}</p>
              </div>
            ))}
            {(!child.health_records?.length) && <p className="text-sm text-gray-400">No health records yet</p>}
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" />Recent Activities</h3>
            {(child.activities || []).slice(0, 5).map((a: any) => (
              <div key={a.id} className="py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900">{a.activity_type}</p>
                <p className="text-xs text-gray-500">{a.description?.slice(0, 60)}</p>
                <p className="text-xs text-gray-400">{formatDate(a.activity_date)}</p>
              </div>
            ))}
            {(!child.activities?.length) && <p className="text-sm text-gray-400">No activities yet</p>}
          </div>
        </div>
      )}

      {tab === 'Health' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Health Records</h3>
            <button onClick={() => setShowHealthModal(true)} className="btn-primary flex items-center gap-1.5 text-xs py-2"><Plus className="w-3.5 h-3.5" />Add Record</button>
          </div>
          {(child.health_records || []).map((h: any) => (
            <div key={h.id} className="p-4 bg-gray-50 rounded-xl mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="badge bg-blue-100 text-blue-700 capitalize">{h.record_type}</span>
                  <p className="font-semibold text-gray-900 mt-1">{h.diagnosis || h.description}</p>
                  {h.treatment && <p className="text-sm text-gray-600 mt-0.5">Treatment: {h.treatment}</p>}
                  {h.medications && <p className="text-sm text-gray-600">Medications: {h.medications}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-700">{formatDate(h.visit_date)}</p>
                  {h.doctor_name && <p className="text-xs text-gray-400">Dr. {h.doctor_name}</p>}
                  {h.next_visit && <p className="text-xs text-primary-600">Next: {formatDate(h.next_visit)}</p>}
                </div>
              </div>
            </div>
          ))}
          {!child.health_records?.length && <p className="text-gray-400 text-sm text-center py-8">No health records</p>}
        </div>
      )}

      {tab === 'Activities' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Activities Log</h3>
            <button onClick={() => setShowActivityModal(true)} className="btn-primary flex items-center gap-1.5 text-xs py-2"><Plus className="w-3.5 h-3.5" />Log Activity</button>
          </div>
          {(child.activities || []).map((a: any) => (
            <div key={a.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 capitalize">{a.activity_type}</p>
                <p className="text-sm text-gray-600">{a.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.activity_date)} · {a.recorded_by_name}</p>
              </div>
            </div>
          ))}
          {!child.activities?.length && <p className="text-gray-400 text-sm text-center py-8">No activities logged</p>}
        </div>
      )}

      {tab === 'Vaccinations' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Vaccination Records</h3>
            <button onClick={() => setShowVaxModal(true)} className="btn-primary flex items-center gap-1.5 text-xs py-2"><Plus className="w-3.5 h-3.5" />Add Vaccine</button>
          </div>
          {(child.vaccinations || []).map((v: any) => (
            <div key={v.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-xl mb-2 border border-green-100">
              <Syringe className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{v.vaccine_name}</p>
                <p className="text-xs text-gray-500">Given: {formatDate(v.date_given)} · By {v.given_by || 'N/A'}</p>
              </div>
              {v.next_due && <div className="text-right"><p className="text-xs text-primary-600 font-medium">Next: {formatDate(v.next_due)}</p></div>}
            </div>
          ))}
          {!child.vaccinations?.length && <p className="text-gray-400 text-sm text-center py-8">No vaccinations recorded</p>}
        </div>
      )}

      {tab === 'Education' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-500" />Education Records</h3>
          {(child.education_records || []).map((e: any) => (
            <div key={e.id} className="p-4 bg-purple-50 rounded-xl mb-3 border border-purple-100">
              <p className="font-semibold text-gray-900">{e.school_name}</p>
              <p className="text-sm text-gray-600">Grade {e.grade} · {e.academic_year}</p>
              {e.attendance_percentage && <p className="text-sm text-gray-500">Attendance: {e.attendance_percentage}%</p>}
            </div>
          ))}
          {!child.education_records?.length && <p className="text-gray-400 text-sm text-center py-8">No education records</p>}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} title="Add Health Record">
        <form onSubmit={e => { e.preventDefault(); healthMutation.mutate(healthForm); }} className="space-y-3">
          <div>
            <label className="label">Record Type</label>
            <select className="input" value={healthForm.record_type} onChange={e => setHealthForm(p => ({ ...p, record_type: e.target.value }))}>
              {['checkup', 'illness', 'injury', 'clinic_visit', 'emergency'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={healthForm.description} onChange={e => setHealthForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Diagnosis</label><input className="input" value={healthForm.diagnosis} onChange={e => setHealthForm(p => ({ ...p, diagnosis: e.target.value }))} /></div>
            <div><label className="label">Treatment</label><input className="input" value={healthForm.treatment} onChange={e => setHealthForm(p => ({ ...p, treatment: e.target.value }))} /></div>
            <div><label className="label">Doctor</label><input className="input" value={healthForm.doctor_name} onChange={e => setHealthForm(p => ({ ...p, doctor_name: e.target.value }))} /></div>
            <div><label className="label">Visit Date</label><input type="date" className="input" value={healthForm.visit_date} onChange={e => setHealthForm(p => ({ ...p, visit_date: e.target.value }))} /></div>
            <div className="col-span-2"><label className="label">Medications</label><input className="input" value={healthForm.medications} onChange={e => setHealthForm(p => ({ ...p, medications: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowHealthModal(false)}>Cancel</button>
            <button type="submit" disabled={healthMutation.isPending} className="btn-primary flex-1">Save Record</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="Log Activity">
        <form onSubmit={e => { e.preventDefault(); actMutation.mutate(actForm); }} className="space-y-3">
          <div>
            <label className="label">Activity Type</label>
            <select className="input" value={actForm.activity_type} onChange={e => setActForm(p => ({ ...p, activity_type: e.target.value }))}>
              {['meal', 'education', 'play', 'counseling', 'medical', 'chores', 'recreation', 'other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input" rows={3} required value={actForm.description} onChange={e => setActForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={actForm.activity_date} onChange={e => setActForm(p => ({ ...p, activity_date: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowActivityModal(false)}>Cancel</button>
            <button type="submit" disabled={actMutation.isPending} className="btn-primary flex-1">Log Activity</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showVaxModal} onClose={() => setShowVaxModal(false)} title="Record Vaccination">
        <form onSubmit={e => { e.preventDefault(); vaxMutation.mutate(vaxForm); }} className="space-y-3">
          <div><label className="label">Vaccine Name *</label><input className="input" required value={vaxForm.vaccine_name} onChange={e => setVaxForm(p => ({ ...p, vaccine_name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Date Given</label><input type="date" className="input" value={vaxForm.date_given} onChange={e => setVaxForm(p => ({ ...p, date_given: e.target.value }))} /></div>
            <div><label className="label">Next Due</label><input type="date" className="input" value={vaxForm.next_due} onChange={e => setVaxForm(p => ({ ...p, next_due: e.target.value }))} /></div>
            <div className="col-span-2"><label className="label">Given By</label><input className="input" value={vaxForm.given_by} onChange={e => setVaxForm(p => ({ ...p, given_by: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowVaxModal(false)}>Cancel</button>
            <button type="submit" disabled={vaxMutation.isPending} className="btn-primary flex-1">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChildDetailPage;
