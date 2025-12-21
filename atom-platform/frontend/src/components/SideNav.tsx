'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  SignalIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Live Activity', href: '/live', icon: SignalIcon },
  { name: 'Strategies', href: '/strategies', icon: CogIcon },
  { name: 'Bots', href: '/bots', icon: UserIcon },
  { name: 'Profit & Fees', href: '/profit', icon: CurrencyDollarIcon },
  { name: 'Safety', href: '/safety', icon: ShieldCheckIcon },
  { name: 'Learn', href: '/learn', icon: AcademicCapIcon },
  { name: 'Settings', href: '/settings', icon: AdjustmentsHorizontalIcon },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <div className="glass-dark w-64 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white border-opacity-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-atom-highlight rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-white font-bold text-xl">ATOM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white border-opacity-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-atom-info rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Demo User
            </p>
            <p className="text-xs text-gray-400 truncate">
              user@atom.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}