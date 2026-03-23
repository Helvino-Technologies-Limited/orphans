import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings, Lock, Info, Phone, Mail, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const passMutation = useMutation({
    mutationFn: (d: { currentPassword: string; newPassword: string }) => api.put('/auth/password', d),
    onSuccess: () => { toast.success('Password changed successfully!'); setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change password'),
  });

  const handlePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match!');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    passMutation.mutate({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="Settings" subtitle="Account and system configuration" />

      {/* Profile */}
      <div className="card">
        <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-primary-600" />Profile</h2>
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">{user?.name?.[0]}</div>
          <div>
            <h3 className="font-display font-bold text-gray-900 text-lg">{user?.name}</h3>
            <p className="text-gray-500 text-sm capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 text-gray-600"><Mail className="w-4 h-4 text-gray-400" />{user?.email}</div>
          {user?.phone && <div className="flex items-center gap-3 text-gray-600"><Phone className="w-4 h-4 text-gray-400" />{user?.phone}</div>}
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-primary-600" />Change Password</h2>
        <form onSubmit={handlePassSubmit} className="space-y-3">
          <div><label className="label">Current Password</label><input type="password" className="input" required value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
          <div><label className="label">New Password</label><input type="password" className="input" required value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
          <div><label className="label">Confirm New Password</label><input type="password" className="input" required value={passForm.confirmPassword} onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} /></div>
          <button type="submit" disabled={passMutation.isPending} className="btn-primary">{passMutation.isPending ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>

      {/* System Info */}
      <div className="card">
        <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary-600" />System Information</h2>
        <div className="space-y-3 text-sm">
          {[
            ['System', 'Orphanage Management & Monitoring System (OMMS)'],
            ['Version', '1.0.0'],
            ['Developer', 'Helvino Technologies Limited'],
            ['Email', 'helvinotechltd@gmail.com'],
            ['Contact', '0110421320'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900 text-right">{value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 py-2">
            <span className="text-gray-500">Website</span>
            <a href="https://helvino.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-medium flex items-center gap-1"><Globe className="w-3.5 h-3.5" />helvino.org</a>
          </div>
        </div>
      </div>

      <button onClick={logout} className="btn-danger w-full">Sign Out</button>
    </div>
  );
};

export default SettingsPage;
