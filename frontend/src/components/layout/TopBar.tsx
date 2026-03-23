import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

interface TopBarProps { onMenuClick: () => void; }

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { data } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/dashboard/alerts').then(r => r.data),
    refetchInterval: 60000,
  });

  const alertCount = (data?.low_stock?.length || 0) + (data?.open_incidents?.length || 0);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
      <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary-500" placeholder="Search children, staff..." />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
