import React, { useState } from 'react';
import { Ticket, EngineerProfile, AuthUser, TicketStatus } from '../types';
import { 
  Users, 
  ShieldAlert, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight, 
  Briefcase,
  Phone,
  Mail,
  Check,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface AdminManagementViewProps {
  currentUser: AuthUser | null;
  tickets: Ticket[];
  engineers: EngineerProfile[];
  onAssignEngineer: (ticketId: string, engineer: EngineerProfile) => Promise<void>;
  onUpdateEngineerRole: (engineerId: string, newRole: EngineerProfile['role']) => void;
  onToggleEngineerStatus: (engineerId: string) => void;
  onSelectTicket: (ticket: Ticket) => void;
  onOpenSSO: () => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentUser,
  tickets,
  engineers,
  onAssignEngineer,
  onUpdateEngineerRole,
  onToggleEngineerStatus,
  onSelectTicket,
  onOpenSSO,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'roster'>('matrix');
  const [engineerSearch, setEngineerSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<Ticket | null>(null);
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Guard: if current user is not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Admin Authorization Required (/admin)
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
          The BRAC IT Engineer Selection &amp; Ticket Allocation Console is restricted to IT Leadership &amp; Administrators.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenSSO}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Authenticate as IT Administrator
          </button>
        </div>
      </div>
    );
  }

  // Filter engineers
  const filteredEngineers = engineers.filter(eng => {
    if (!engineerSearch.trim()) return true;
    const q = engineerSearch.toLowerCase();
    return (
      eng.name.toLowerCase().includes(q) ||
      eng.branchLocation.toLowerCase().includes(q) ||
      eng.specialization.toLowerCase().includes(q) ||
      eng.role.toLowerCase().includes(q)
    );
  });

  // Filter tickets for assignment
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.submittedBy.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const onDutyCount = engineers.filter(e => e.status === 'on_duty').length;
  const unassignedCount = tickets.filter(t => !t.assignedTo || t.assignedTo.name === 'Unassigned').length;

  const handleAssign = async (ticketId: string, eng: EngineerProfile) => {
    setAssigningTicketId(ticketId);
    try {
      await onAssignEngineer(ticketId, eng);
      setActionNotice(`Ticket ${ticketId} successfully assigned to ${eng.name} (${eng.branchLocation})`);
      setTimeout(() => setActionNotice(null), 4000);
      setSelectedTicketForAssign(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningTicketId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Toast */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Console Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>BRAC IT Administration Console (/admin)</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Super Admin: {currentUser.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              IT Support Engineers Roster &amp; Ticket Allocation Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Manage the central team of 23 BRAC IT Support Engineers across Bangladesh. Select and assign engineers to tickets, balance workloads, and promote staff roles.
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSubTab === 'matrix'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ticket Allocation Matrix ({tickets.length})
            </button>
            <button
              onClick={() => setActiveSubTab('roster')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSubTab === 'roster'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              23 IT Engineers Roster ({engineers.length})
            </button>
          </div>
        </div>

        {/* Quick Stat Quad */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500">Total IT Engineers</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              {engineers.length} Engineers
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Full national team</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">On-Duty Now</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {onDutyCount} Active
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Available for dispatch</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Unassigned Backlog</div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
              {unassignedCount} Tickets
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requires engineer assignment</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">In Progress Workload</div>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
              {tickets.filter(t => t.status === 'in_progress').length} Tickets
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Under active diagnostics</div>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: Ticket Allocation Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          
          {/* Matrix Search & Filters */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={ticketSearch}
                onChange={e => setTicketSearch(e.target.value)}
                placeholder="Search ticket to assign engineer (ID, title, branch, staff)..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open (Unassigned)</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_user">Waiting on User</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Allocation Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-28">Ticket ID</th>
                    <th className="py-3 px-4 min-w-[260px]">Subject &amp; Division</th>
                    <th className="py-3 px-4 w-24">Priority</th>
                    <th className="py-3 px-4 w-28">Status</th>
                    <th className="py-3 px-4 min-w-[220px]">Currently Assigned Engineer</th>
                    <th className="py-3 px-4 text-right min-w-[180px]">Admin Assignment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      
                      {/* Ticket ID */}
                      <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {ticket.id}
                      </td>

                      {/* Title & Department */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onSelectTicket(ticket)}
                          className="font-semibold text-slate-900 dark:text-white hover:text-rose-600 cursor-pointer line-clamp-1"
                        >
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {ticket.department} · {ticket.branchLocation}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          ticket.priority === 'critical'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                            : ticket.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Assigned Engineer Display */}
                      <td className="py-3 px-4">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[10px]">
                              {ticket.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {ticket.assignedTo.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {ticket.assignedTo.role}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Unassigned Queue</span>
                          </span>
                        )}
                      </td>

                      {/* Admin Assignment Dropdown / Selector */}
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <select
                            disabled={assigningTicketId === ticket.id}
                            value={ticket.assignedTo?.email || ''}
                            onChange={e => {
                              const selectedEng = engineers.find(eng => eng.email === e.target.value);
                              if (selectedEng) {
                                handleAssign(ticket.id, selectedEng);
                              }
                            }}
                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 max-w-[200px]"
                          >
                            <option value="">Select from 23 Engineers...</option>
                            {engineers.map(eng => (
                              <option key={eng.id} value={eng.email}>
                                {eng.name} ({eng.branchLocation.split(',')[0]} · {eng.status})
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: 23 IT Engineers Roster Management */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          
          {/* Search bar for 23 engineers */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={engineerSearch}
                onChange={e => setEngineerSearch(e.target.value)}
                placeholder="Search across all 23 BRAC IT Engineers by name, location, or specialization..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              Showing {filteredEngineers.length} of 23 National Engineers
            </span>
          </div>

          {/* Engineers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEngineers.map(eng => {
              const activeCount = tickets.filter(t => t.assignedTo?.email === eng.email && t.status !== 'resolved').length;

              return (
                <div
                  key={eng.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {eng.avatarUrl ? (
                        <img
                          src={eng.avatarUrl}
                          alt={eng.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-xs">
                          {eng.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {eng.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {eng.role}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleEngineerStatus(eng.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border transition-colors ${
                        eng.status === 'on_duty'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : eng.status === 'active'
                          ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                      title="Click to toggle On-Duty / Active status"
                    >
                      {eng.status.replace('_', ' ')}
                    </button>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{eng.branchLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{eng.specialization}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{eng.email}</span>
                    </div>
                  </div>

                  {/* Admin controls: Role Selector & Active tickets */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Assigned Load:</span>
                      <span className="ml-1 font-mono font-bold text-xs text-rose-600 dark:text-rose-400 tabular-nums">
                        {activeCount} Tickets
                      </span>
                    </div>

                    <select
                      value={eng.role}
                      onChange={e => onUpdateEngineerRole(eng.id, e.target.value as any)}
                      className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                    >
                      <option value="Senior IT Support Engineer">Senior IT Support Engineer</option>
                      <option value="IT Support Engineer">IT Support Engineer</option>
                      <option value="Lead Systems Specialist">Lead Systems Specialist</option>
                      <option value="Regional Field Engineer">Regional Field Engineer</option>
                    </select>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
