import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Package, MoreHorizontal } from 'lucide-react';

const MobileBottomNav: React.FC = () => (
  <nav className="mobile-bottom-nav md:hidden">
    <div className="flex items-center justify-around h-14">
      {[
        { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { path: '/children', icon: Users, label: 'Children' },
        { path: '/donations', icon: DollarSign, label: 'Donations' },
        { path: '/inventory', icon: Package, label: 'Inventory' },
        { path: '/settings', icon: MoreHorizontal, label: 'More' },
      ].map(({ path, icon: Icon, label }) => (
        <NavLink key={path} to={path} className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500'}`
        }>
          <Icon style={{ width: 22, height: 22 }} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export default MobileBottomNav;
