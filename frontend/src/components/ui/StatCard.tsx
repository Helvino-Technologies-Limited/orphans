import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  subtitle?: string;
  trend?: { value: number; label: string };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, subtitle, trend }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-display font-bold text-gray-900 mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      {trend && (
        <p className={`text-xs font-medium mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  </div>
);

export default StatCard;
