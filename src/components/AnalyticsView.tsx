import React, { useState } from 'react';
import { AnalyticsSummary, Ticket } from '../types';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star, 
  Users, 
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  tickets: Ticket[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, tickets }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const data: AnalyticsSummary = analytics || {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    avgResolutionHours: 3.2,
    avgFirstResponseMinutes: 16.4,
    slaComplianceRate: 96.8,
    csatScore: 4.8,
    categoryBreakdown: [
      { category: 'field_tablet', count: 48, percentage: 32 },
      { category: 'erp_agresso', count: 35, percentage: 24 },
      { category: 'network_wifi', count: 28, percentage: 19 },
      { category: 'm365_email', count: 22, percentage: 15 },
      { category: 'donor_volunteer_tech', count: 15, percentage: 10 },
    ],
    departmentBreakdown: [
      { department: 'Microfinance Programme', count: 52 },
      { department: 'Ultra-Poor Graduation (UPG)', count: 31 },
      { department: 'Education Programme (BEP)', count: 26 },
      { department: 'Humanitarian Crisis Management (HCMP)', count: 20 },
      { department: 'Health, Nutrition & Population', count: 19 },
    ],
    engineerMetrics: [
      {
        name: 'Tanvir Ahmed',
        assigned: 18,
        resolved: 16,
        avgTimeHours: 2.8,
        satisfaction: 4.9,
      },
      {
        name: 'Sadia Rahman',
        assigned: 14,
        resolved: 13,
        avgTimeHours: 3.4,
        satisfaction: 4.7,
      },
      {
        name: 'Kamrul Hasan',
        assigned: 15,
        resolved: 14,
        avgTimeHours: 4.1,
        satisfaction: 4.8,
      },
      {
        name: 'Nasrin Akter',
        assigned: 11,
        resolved: 10,
        avgTimeHours: 3.0,
        satisfaction: 4.85,
      },
    ],
  };

  const handleExportCSV = () => {
    const headers = ['Engineer Name', 'Tickets Assigned', 'Tickets Resolved', 'Avg Resolution (Hours)', 'User CSAT'];
    const rows = data.engineerMetrics.map(e => [
      `"${e.name}"`,
      e.assigned,
      e.resolved,
      e.avgTimeHours,
      e.satisfaction,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BRAC_IT_Productivity_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Analytics Header & Export Action */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Management &amp; Leadership Oversight</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            IT Service SLA &amp; Team Productivity Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Real-time tracking of resolution targets, engineer workloads, and program IT demand across all 64 Bangladesh districts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-2.5 py-1 rounded font-medium ${
                timeRange === 'today' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-2.5 py-1 rounded font-medium ${
                timeRange === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-2.5 py-1 rounded font-medium ${
                timeRange === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              This Month
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Quad Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>SLA Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {data.slaComplianceRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Target SLA: &gt;95.0%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Avg First Response</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {data.avgFirstResponseMinutes}m
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>4.2m faster than last week</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Avg Resolution Time</span>
            <CheckCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {data.avgResolutionHours}h
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Standard benchmark: 4.0h
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Staff CSAT Score</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {data.csatScore} / 5.0
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Based on 320 staff ratings
          </div>
        </div>

      </div>

      {/* Two Column Grid: Systems Breakdown & Program Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-500" />
              <span>Ticket Volume by Technical Category</span>
            </h2>
            <span className="text-xs text-slate-500">Distribution %</span>
          </div>

          <div className="space-y-3">
            {data.categoryBreakdown.map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {item.count} tickets ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 dark:bg-rose-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department / Programme Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Support Demand by BRAC Programme</span>
            </h2>
            <span className="text-xs text-slate-500">Total Volume</span>
          </div>

          <div className="space-y-3">
            {data.departmentBreakdown.map(dept => {
              const maxCount = Math.max(...data.departmentBreakdown.map(d => d.count));
              const pct = Math.round((dept.count / (maxCount || 1)) * 100);

              return (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
                      {dept.department}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {dept.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Engineer Productivity Matrix */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              IT Support Team Performance &amp; Workload Metrics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Individual engineer throughput, average turnaround time, and staff satisfaction ratings.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">Engineer</th>
                <th className="py-3 px-4 text-center">Assigned</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Completion Rate</th>
                <th className="py-3 px-4 text-right">Avg Resolution</th>
                <th className="py-3 px-4 text-right">CSAT Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {data.engineerMetrics.map(eng => {
                const completionRate = Math.round((eng.resolved / (eng.assigned || 1)) * 100);

                return (
                  <tr key={eng.name} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      {eng.name}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-700 dark:text-slate-300">
                      {eng.assigned}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      {eng.resolved}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-700 dark:text-slate-300">
                      {completionRate}%
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {eng.avgTimeHours}h
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-amber-600 dark:text-amber-400 font-bold">
                      ★ {eng.satisfaction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
