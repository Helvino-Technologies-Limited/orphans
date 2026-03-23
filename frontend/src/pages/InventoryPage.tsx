import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import type { InventoryItem } from '../types';

const InventoryPage: React.FC = () => {
  const qc = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockModal, setStockModal] = useState<{ item: InventoryItem | null; open: boolean }>({ item: null, open: false });
  const [addForm, setAddForm] = useState({ item_name: '', category: 'Food', quantity: '', unit: '', minimum_stock: '' });
  const [stockForm, setStockForm] = useState({ transaction_type: 'add', quantity: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory').then(r => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (d: typeof addForm) => api.post('/inventory', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item added!'); setShowAddModal(false); },
    onError: () => toast.error('Failed to add item'),
  });

  const stockMutation = useMutation({
    mutationFn: (d: { id: string; data: typeof stockForm }) => api.put(`/inventory/${d.id}/stock`, d.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Stock updated!'); setStockModal({ item: null, open: false }); },
    onError: () => toast.error('Failed to update stock'),
  });

  const items: InventoryItem[] = data?.items || [];
  const lowStock: InventoryItem[] = data?.low_stock || [];

  const categoryColor = (c: string) => {
    const m: Record<string, string> = { Food: 'bg-amber-100 text-amber-700', Medicine: 'bg-red-100 text-red-700', Clothing: 'bg-purple-100 text-purple-700', Supplies: 'bg-blue-100 text-blue-700' };
    return m[c] || 'bg-gray-100 text-gray-600';
  };

  const stockLevel = (item: InventoryItem) => {
    const ratio = item.quantity / item.minimum_stock;
    if (ratio <= 1) return 'bg-red-500';
    if (ratio <= 2) return 'bg-orange-400';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
        subtitle={`${items.length} items tracked${lowStock.length > 0 ? ` · ⚠ ${lowStock.length} low stock` : ''}`}
        action={<button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Item</button>}
      />

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-orange-800 text-sm">Low Stock Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(item => (
              <span key={item.id} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                {item.item_name}: {item.quantity} {item.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Package} title="No inventory items" description="Start tracking supplies." action={<button className="btn-primary" onClick={() => setShowAddModal(true)}>Add First Item</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="card hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-gray-900">{item.item_name}</h3>
                  <span className={`badge ${categoryColor(item.category)} mt-1`}>{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-2xl text-gray-900">{item.quantity}</p>
                  <p className="text-xs text-gray-400">{item.unit}</p>
                </div>
              </div>
              {/* Stock bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div className={`h-1.5 rounded-full transition-all ${stockLevel(item)}`} style={{ width: `${Math.min((item.quantity / (item.minimum_stock * 3)) * 100, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Min: {item.minimum_stock} {item.unit}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setStockModal({ item, open: true }); setStockForm({ transaction_type: 'add', quantity: '', notes: '' }); }} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium py-1 px-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5" /> Add
                  </button>
                  <button onClick={() => { setStockModal({ item, open: true }); setStockForm({ transaction_type: 'use', quantity: '', notes: '' }); }} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium py-1 px-2 bg-red-50 rounded-lg">
                    <TrendingDown className="w-3.5 h-3.5" /> Use
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        <form onSubmit={e => { e.preventDefault(); addMutation.mutate(addForm); }} className="space-y-3">
          <div><label className="label">Item Name *</label><input className="input" required value={addForm.item_name} onChange={e => setAddForm(p => ({ ...p, item_name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={addForm.category} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}>
                {['Food', 'Medicine', 'Clothing', 'Supplies', 'Education', 'Hygiene', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Unit</label><input className="input" placeholder="kg, litres, pieces..." value={addForm.unit} onChange={e => setAddForm(p => ({ ...p, unit: e.target.value }))} /></div>
            <div><label className="label">Initial Quantity *</label><input type="number" className="input" required value={addForm.quantity} onChange={e => setAddForm(p => ({ ...p, quantity: e.target.value }))} /></div>
            <div><label className="label">Minimum Stock</label><input type="number" className="input" value={addForm.minimum_stock} onChange={e => setAddForm(p => ({ ...p, minimum_stock: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" disabled={addMutation.isPending} className="btn-primary flex-1">{addMutation.isPending ? 'Adding...' : 'Add Item'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={stockModal.open} onClose={() => setStockModal({ item: null, open: false })} title={`Update Stock — ${stockModal.item?.item_name}`} size="sm">
        <form onSubmit={e => { e.preventDefault(); if (stockModal.item) stockMutation.mutate({ id: stockModal.item.id, data: stockForm }); }} className="space-y-3">
          <div>
            <label className="label">Transaction Type</label>
            <div className="flex gap-3">
              {[['add', 'Restock ↑'], ['use', 'Used/Consumed ↓']].map(([v, l]) => (
                <label key={v} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${stockForm.transaction_type === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                  <input type="radio" className="sr-only" name="type" value={v} checked={stockForm.transaction_type === v} onChange={() => setStockForm(p => ({ ...p, transaction_type: v }))} />
                  <span className="text-sm font-medium">{l}</span>
                </label>
              ))}
            </div>
          </div>
          <div><label className="label">Quantity *</label><input type="number" className="input" required value={stockForm.quantity} onChange={e => setStockForm(p => ({ ...p, quantity: e.target.value }))} /></div>
          <div><label className="label">Notes</label><input className="input" value={stockForm.notes} onChange={e => setStockForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setStockModal({ item: null, open: false })}>Cancel</button>
            <button type="submit" disabled={stockMutation.isPending} className="btn-primary flex-1">Update Stock</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
