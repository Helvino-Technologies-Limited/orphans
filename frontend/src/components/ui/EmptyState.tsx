import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode; }

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="font-display font-semibold text-gray-900 text-lg">{title}</h3>
    {description && <p className="text-gray-500 text-sm mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
