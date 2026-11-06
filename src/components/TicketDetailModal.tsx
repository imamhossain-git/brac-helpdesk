import React, { useState } from 'react';
import { Ticket, TicketStatus, UserRole } from '../types';
import { 
  X, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle, 
  Send, 
  MessageSquare, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket: (ticketId: string, updates: any) => Promise<void>;
  currentRole: UserRole;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateTicket,
  currentRole,
}) => {
  const [newNote, setNewNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);
  const [updating, setUpdating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'notes' | 'emails'>('timeline');

  if (!isOpen || !ticket) return null;

  const isEngineerOrAdmin = currentRole === 'engineer' || currentRole === 'admin';

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setUpdating(true);
    try {
      await onUpdateTicket(ticket.id, {
        status: newStatus,
        statusNote: statusNote || `Status updated to ${newStatus.replace('_', ' ').toUpperCase()} by IT Support Engineer Tanvir Ahmed`,
        noteAuthor: 'Tanvir Ahmed',
      });
      setSelectedStatus(null);
      setStatusNote('');
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setUpdating(true);
    try {
      await onUpdateTicket(ticket.id, {
        noteContent: newNote,
        noteAuthor: isEngineerOrAdmin ? 'Tanvir Ahmed (IT Engineer)' : ticket.submittedBy.name,
      });
      setNewNote('');
    } catch (err) {
      console.error('Add note failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40';
      case 'high':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800';
      case 'in_progress':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800';
      case 'waiting_user':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800';
      default:
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
              {ticket.id}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
              {ticket.priority} priority
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Title & Department Information */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {ticket.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">{ticket.department}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.branchLocation}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Logged {new Date(ticket.createdAt).toLocaleString()}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">SLA Target: {ticket.slaTargetMinutes}m</span>
            </div>
          </div>

          {/* Issue Description Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Reported Issue Description</span>
            </h2>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {ticket.description}
            </p>
          </div>

          {/* Quick Context Grid: Submitter & Assigned Engineer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Submitter Info */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Submitted By</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {ticket.submittedBy.name}
              </div>
              <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{ticket.submittedBy.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{ticket.submittedBy.phone}</span>
                </div>
                {ticket.submittedBy.staffPin && (
                  <div className="font-mono text-[11px] text-slate-500">
                    PIN: {ticket.submittedBy.staffPin}
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Support Engineer */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Assigned IT Support Engineer</span>
              </div>
              <div className="flex items-center gap-3">
                {ticket.assignedTo?.avatarUrl ? (
                  <img
                    src={ticket.assignedTo.avatarUrl}
                    alt={ticket.assignedTo.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                    TA
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {ticket.assignedTo?.name || 'Unassigned'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {ticket.assignedTo?.role || 'IT Support Queue'}
                  </div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400">
                    {ticket.assignedTo?.email || 'helpdesk@brac.net'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* IT Engineer Workflow Controls (Role Based) */}
          {isEngineerOrAdmin && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-rose-500" />
                  <span>Update Ticket Status & Trigger Automated Email Dispatch</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Engineer Mode Active
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {(['open', 'in_progress', 'waiting_user', 'resolved', 'closed'] as TicketStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    disabled={updating || ticket.status === st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      ticket.status === st
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600 ring-offset-2 dark:ring-offset-slate-900'
                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Optional status remarks note */}
              <div className="pt-2">
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="Optional resolution note or update reason (included in automated email notification)..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Sub-tabs: Timeline vs Internal Notes vs Automated Email Logs */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveSubTab('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubTab === 'timeline'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Audit Timeline ({ticket.timeline.length})
              </button>

              <button
                onClick={() => setActiveSubTab('notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubTab === 'notes'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Internal Engineer Notes ({ticket.internalNotes.length})
              </button>

              <button
                onClick={() => setActiveSubTab('emails')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSubTab === 'emails'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Automated Email Dispatches ({ticket.emailLogs.length})</span>
              </button>
            </div>

            {/* Tab 1: Timeline */}
            {activeSubTab === 'timeline' && (
              <div className="mt-4 space-y-3 pl-2">
                {ticket.timeline.map((entry, idx) => (
                  <div key={entry.id || idx} className="relative flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {entry.actor}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        {entry.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Internal Notes */}
            {activeSubTab === 'notes' && (
              <div className="mt-4 space-y-4">
                <div className="space-y-3">
                  {ticket.internalNotes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      No internal engineer notes logged yet.
                    </div>
                  ) : (
                    ticket.internalNotes.map(n => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {n.author} ({n.authorRole})
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {n.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new note form */}
                <form onSubmit={handleAddInternalNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Log technical diagnostic steps, root cause analysis, or follow-up note..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updating || !newNote.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Engineer Note</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: Automated Email Notification Log */}
            {activeSubTab === 'emails' && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-rose-500" />
                    <span>Real-Time Integration with BRAC Central Email Relay</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Relay Operational
                  </span>
                </div>

                {ticket.emailLogs.map(em => (
                  <div
                    key={em.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {em.status}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          To: {em.recipient}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {new Date(em.sentAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {em.subject}
                    </div>

                    <div className="text-slate-600 dark:text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-750">
                      {em.bodyPreview}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Last modified: {new Date(ticket.updatedAt).toLocaleTimeString()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
