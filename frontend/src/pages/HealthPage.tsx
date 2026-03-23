import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Stethoscope, Syringe } from 'lucide-react';
import api from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import { formatDate } from '../utils/helpers';

const HealthPage: React.FC = () => {
  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/dashboard/alerts').then(r => r.data),
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Health Management" subtitle="Medical records, vaccinations & alerts" />

      {/* Upcoming vaccinations */}
      <div className="card">
        <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Syringe className="w-5 h-5 text-blue-500" /> Upcoming Vaccinations (Next 7 Days)
        </h2>
        {(alerts?.upcoming_vaccinations || []).length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No vaccinations due in the next 7 days 🎉</p>
        ) : (
          <div className="space-y-3">
            {alerts.upcoming_vaccinations.map((v: any) => (
              <div key={v.id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Syringe className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{v.full_name}</p>
                  <p className="text-xs text-gray-500">{v.vaccine_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-700">{formatDate(v.next_due)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-red-500" /> Health Overview
        </h2>
        <p className="text-gray-500 text-sm">Visit individual child profiles to view and manage detailed health records. Navigate to <span className="text-primary-600 font-medium">Children → Select a child → Health tab</span> to add medical records.</p>
      </div>
    </div>
  );
};

export default HealthPage;
