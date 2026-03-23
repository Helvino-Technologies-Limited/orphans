import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, formatKES } from '../utils/helpers';
import type { Donation } from '../types';

const DonationsPage: React.FC = () => {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donor_name: '', donor_email: '', donor_phone: '', amount: '', donation_type: 'cash', item_description: '', payment_method: 'cash', mpesa_ref: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['donations'],
    queryFn: () => api.get('/donations').then(r => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['donations-summary'],
    queryFn: () => api.get('/donations/summary').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/donations', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['donations'] }); qc.invalidateQueries({ queryKey: ['donations-summary'] }); toast.success('Donation recorded! 🎉'); setShowModal(false); },
    onError: () => toast.error('Failed to record donation'),
  });

  const donations: Donation[] = data?.donations || [];
  const totalCash = donations.filter(d => d.donation_type !== 'in-kind').reduce((s, d) => s + (d.amount || 0), 0);

  const typeColor = (t: string) => {
    const m: Record<string, string> = { cash: 'bg-green-100 text-green-700', mpesa: 'bg-blue-100 text-blue-700', 'in-kind': 'bg-purple-100 text-purple-700', bank: 'bg-amber-100 text-amber-700' };
    return m[t] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Donations"
        subtitle="Track all contributions"
        action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Record Donation</button>}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><p className="text-xs text-gray-500">Total (This Month)</p><p className="text-xl font-display font-bold text-gray-900 mt-1">{formatKES(parseFloat(data?.summary?.total || 0))}</p></div>
        <div className="card"><p className="text-xs text-gray-500">Donations Count</p><p className="text-xl font-display font-bold text-gray-900 mt-1">{data?.summary?.count || 0}</p></div>
        <div className="card col-span-2"><p className="text-xs text-gray-500 mb-2">By Type</p>
          <div className="flex gap-2 flex-wrap">
            {(summary?.by_type || []).map((t: any) => (
              <span key={t.donation_type} className={`badge ${typeColor(t.donation_type)} capitalize`}>{t.donation_type}: {t.count}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Donations Table */}
      {isLoading ? <div className="skeleton h-64 rounded-xl" /> : donations.length === 0 ? (
        <EmptyState icon={DollarSign} title="No donations yet" description="Record the first donation to get started." action={<button className="btn-primary" onClick={() => setShowModal(true)}>Record Donation</button>} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-3">Donor</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Receipt</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{d.donor_name}</p>
                      {d.donor_phone && <p className="text-xs text-gray-400">{d.donor_phone}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className={`badge ${typeColor(d.donation_type)} capitalize`}>{d.donation_type}</span></td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 text-sm">{d.donation_type === 'in-kind' ? <span className="text-purple-600">In-Kind</span> : formatKES(d.amount)}</p>
                      {d.item_description && <p className="text-xs text-gray-400 truncate max-w-24">{d.item_description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="font-mono text-xs text-gray-500">{d.receipt_no}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatDate(d.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Donation" size="md">
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-3">
          <div><label className="label">Donor Name *</label><input className="input" required value={form.donor_name} onChange={e => setForm(p => ({ ...p, donor_name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Phone</label><input className="input" value={form.donor_phone} onChange={e => setForm(p => ({ ...p, donor_phone: e.target.value }))} /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.donor_email} onChange={e => setForm(p => ({ ...p, donor_email: e.target.value }))} /></div>
            <div>
              <label className="label">Donation Type *</label>
              <select className="input" value={form.donation_type} onChange={e => setForm(p => ({ ...p, donation_type: e.target.value }))}>
                <option value="cash">Cash</option><option value="mpesa">M-Pesa</option><option value="bank">Bank Transfer</option><option value="in-kind">In-Kind</option>
              </select>
            </div>
            {form.donation_type !== 'in-kind' ? (
              <div><label className="label">Amount (KES)</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
            ) : (
              <div><label className="label">Item Description</label><input className="input" value={form.item_description} onChange={e => setForm(p => ({ ...p, item_description: e.target.value }))} /></div>
            )}
            {form.donation_type === 'mpesa' && (
              <div className="col-span-2"><label className="label">M-Pesa Reference</label><input className="input" value={form.mpesa_ref} onChange={e => setForm(p => ({ ...p, mpesa_ref: e.target.value }))} /></div>
            )}
          </div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">{mutation.isPending ? 'Saving...' : 'Record Donation'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonationsPage;
