import React, { useState } from 'react';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, UserRole } from '../types';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Inbox, 
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowUpDown,
  Building2
} from 'lucide-react';

interface TicketDashboardProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onOpenNewTicket: () => void;
  currentRole: UserRole;
  onNavigateToTab: (tab: 'kb' | 'tickets') => void;
}

export const TicketDashboard: React.FC<TicketDashboardProps> = ({
  tickets,
  onSelectTicket,
  onOpenNewTicket,
  currentRole,
  onNavigateToTab,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.branchLocation.toLowerCase().includes(q) ||
        t.submittedBy.name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // KPI calculations
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const criticalCount = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'critical':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      case 'high':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'in_progress':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      case 'waiting_user':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      default:
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Strip: BRAC IT Service Operations */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>BRAC Bangladesh · Information Technology Division</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 dark:text-slate-400 lowercase font-normal">Headquarters: Mohakhali, Dhaka</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                IT Service Portal &amp; Ticket Tracking Center
              </h1>
              
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Centralized helpdesk supporting 100,000+ BRAC field workers, microfinance credit officers, clinic staff, volunteers, and international donors. Automated status updates, email dispatch tracking, and SLA escalation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={onOpenNewTicket}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Submit New Support Request
              </button>

              <button
                onClick={() => onNavigateToTab('kb')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Browse Knowledge Base &amp; FAQ
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-[180px] lg:min-h-full">
            <img
              src="/src/assets/images/brac_dhaka_headquarters_1793943722761.jpg"
              alt="BRAC Centre Mohakhali Dhaka Headquarters"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-white dark:lg:to-slate-900" />
            <div className="absolute bottom-3 left-4 right-4 text-white text-xs lg:hidden">
              BRAC Centre, 75 Mohakhali, Dhaka 1212
            </div>
          </div>

        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Open Queue
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {openCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Awaiting triage or assignment
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            In Progress
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400 font-mono tabular-nums">
            {inProgressCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Actively being worked by IT engineers
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>Critical SLA</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {criticalCount}
          </div>
          <div className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-400/80">
            Urgent field / branch escalations
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Resolved Tickets
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {resolvedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            96.8% SLA compliance rate
          </div>
        </div>

      </div>

      {/* Filter Toolbar & Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Ticket ID (BRAC-IT-XXXX), staff name, branch, keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Interactive Status Tab Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'open'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Open ({openCount})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'in_progress'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'resolved'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

        </div>

        {/* Secondary Category & Priority Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs"
            >
              <option value="all">All Systems</option>
              <option value="field_tablet">Field Tablet & Offline App</option>
              <option value="erp_agresso">BRAC ERP Agresso</option>
              <option value="m365_email">Microsoft 365 & Teams</option>
              <option value="network_wifi">Branch Network & VSAT</option>
              <option value="biometric_hr">Biometric Attendance</option>
              <option value="vpn_remote">GlobalProtect VPN</option>
              <option value="donor_volunteer_tech">Donor & Volunteer Tech</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical (2h SLA)</option>
              <option value="high">High (4h SLA)</option>
              <option value="medium">Medium (8h SLA)</option>
              <option value="low">Low (24h SLA)</option>
            </select>
          </div>

          {(statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setSearch('');
              }}
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium ml-auto"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* High Density Ticket Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No tickets found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No support tickets match the current search filters. You can submit a new ticket or reset your filters.
            </p>
            <button
              onClick={onOpenNewTicket}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
            >
              Create New Ticket
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-28 whitespace-nowrap">Ticket ID</th>
                  <th className="py-3 px-4 min-w-[280px]">Subject &amp; Issue Details</th>
                  <th className="py-3 px-4 w-28">Status</th>
                  <th className="py-3 px-4 w-24">Priority</th>
                  <th className="py-3 px-4 min-w-[160px]">Branch / Division</th>
                  <th className="py-3 px-4 min-w-[140px]">Submitter</th>
                  <th className="py-3 px-4 w-28 text-right">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Ticket ID */}
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
                      {ticket.id}
                    </td>

                    {/* Title & Category Snippet */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                        {ticket.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{ticket.category.replace('_', ' ').toUpperCase()}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-xs">{ticket.description}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>

                    {/* Branch & Division */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {ticket.department}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{ticket.branchLocation}</span>
                      </div>
                    </td>

                    {/* Submitter */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {ticket.submittedBy.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {ticket.submittedBy.email}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
