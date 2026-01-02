'use client';

import React, { useMemo } from 'react';
import { useEventStream } from '@/contexts/EventStreamContext';
import { useSystemState } from '@/contexts/SystemStateContext';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface StatCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ElementType;
  color: string;
}

export function OverviewCards() {
  const { events } = useEventStream();
  const { systemState } = useSystemState();

  const stats = useMemo(() => {
    // Calculate stats from events
    const profitEvents = events.filter(e => e.event_type === 'profit.realized');
    const executionEvents = events.filter(e => 
      e.event_type === 'execution.confirmed' || e.event_type === 'execution.reverted'
    );
    const opportunityEvents = events.filter(e => e.event_type === 'opportunity.detected');

    const totalProfit = profitEvents.reduce((sum, e) => sum + (e.payload.net_profit || 0), 0);
    const totalExecutions = executionEvents.length;
    const successfulExecutions = executionEvents.filter(e => e.event_type === 'execution.confirmed').length;
    const totalOpportunities = opportunityEvents.length;

    const profitToday = profitEvents
      .filter(e => {
        const eventDate = new Date(e.timestamp.iso);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      })
      .reduce((sum, e) => sum + (e.payload.net_profit || 0), 0);

    const executionsToday = executionEvents.filter(e => {
      const eventDate = new Date(e.timestamp.iso);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalProfit,
      profitToday,
      totalExecutions,
      successfulExecutions,
      totalOpportunities,
      executionsToday,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
    };
  }, [events]);

  const cards: StatCard[] = [
    {
      title: 'Total P&L',
      value: `$${stats.totalProfit.toFixed(2)}`,
      change: stats.profitToday > 0 ? `+$${stats.profitToday.toFixed(2)} today` : undefined,
      changeType: stats.profitToday > 0 ? 'positive' : undefined,
      icon: CurrencyDollarIcon,
      color: 'text-atom-success'
    },
    {
      title: 'Active Capital',
      value: '$125,000',
      change: '+2.5% this week',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'text-atom-info'
    },
    {
      title: 'Trades Today',
      value: stats.executionsToday.toString(),
      change: `${stats.successfulExecutions} successful`,
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'text-atom-success'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      change: `${stats.totalExecutions} total trades`,
      changeType: stats.successRate > 80 ? 'positive' : 'negative',
      icon: stats.successRate > 80 ? CheckCircleIcon : XCircleIcon,
      color: stats.successRate > 80 ? 'text-atom-success' : 'text-atom-warning'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div key={index} className="card p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-white bg-opacity-10 ${card.color}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-[10px] sm:text-xs font-medium text-gray-400">{card.title}</h3>
              <div className="text-base sm:text-xl md:text-2xl font-bold text-white">{card.value}</div>
              {card.change && (
                <div className={`flex items-center text-[10px] sm:text-xs ${
                  card.changeType === 'positive' ? 'text-atom-success' : 'text-atom-error'
                }`}>
                  {card.changeType === 'positive' ? (
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                  )}
                  <span className="truncate">{card.change}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}