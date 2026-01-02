'use client';

import React, { useState } from 'react';
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
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const mainNavigation = [
  { name: 'Home', href: '/', icon: HomeIcon, mobile: true },
  { name: 'Live', href: '/live', icon: SignalIcon, mobile: true },
  { name: 'Strategies', href: '/strategies', icon: CogIcon, mobile: true },
  { name: 'Safety', href: '/safety', icon: ShieldCheckIcon, mobile: true },
];

const secondaryNavigation = [
  { name: 'Bots', href: '/bots', icon: UserIcon },
  { name: 'Profit', href: '/profit-fees', icon: CurrencyDollarIcon },
  { name: 'Learn', href: '/learn', icon: AcademicCapIcon },
  { name: 'Settings', href: '/settings', icon: AdjustmentsHorizontalIcon },
];

export function SideNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION - Primary */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white border-opacity-10 safe-area-bottom">
        <nav className="flex items-center justify-around h-16 px-2">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                  isActive 
                    ? 'text-atom-highlight' 
                    : 'text-gray-400 active:text-white'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* MOBILE HAMBURGER MENU - Secondary Nav */}
      <div className="md:hidden fixed top-3 right-3 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 glass-dark rounded-lg text-white active:bg-opacity-30 transition-all"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* MOBILE SLIDE-OUT MENU */}
      {mobileMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed top-0 left-0 bottom-0 w-64 glass-dark z-50 flex flex-col animate-slide-in">
            {/* Logo */}
            <div className="p-4 border-b border-white border-opacity-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-atom-highlight rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-white font-bold text-2xl">ATOM</span>
              </div>
            </div>

            {/* Secondary Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                More Options
              </div>
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-atom-highlight bg-opacity-20 text-white' 
                        : 'text-gray-300 active:bg-white active:bg-opacity-10'
                    }`}
                  >
                    <item.icon className="w-6 h-6 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-white border-opacity-10">
              <div className="flex items-center space-x-3 p-2">
                <div className="w-10 h-10 bg-atom-info rounded-full flex items-center justify-center">
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
        </>
      )}

      {/* DESKTOP SIDEBAR - Hidden on mobile */}
      <div className="hidden md:flex glass-dark w-64 h-full flex-col">
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[...mainNavigation, ...secondaryNavigation].map((item) => {
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
    </>
  );
}