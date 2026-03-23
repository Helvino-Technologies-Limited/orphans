import React from 'react';

interface PageHeaderProps { title: string; subtitle?: string; action?: React.ReactNode; }

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="font-display font-bold text-gray-900 text-2xl leading-tight">{title}</h1>
      {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
