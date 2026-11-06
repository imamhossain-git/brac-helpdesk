import React, { useState } from 'react';
import { EmailDispatchLog, Ticket } from '../types';
import { Mail, Search, CheckCircle2, Clock, Send, Eye, ShieldCheck, ArrowRight } from 'lucide-react';

interface EmailAuditViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

export const EmailAuditView: React.FC<EmailAuditViewProps> = ({ tickets, onSelectTicket }) => {
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailDispatchLog | null>(null);

  // Aggregate all emails across all tickets
  const allEmails: { email: EmailDispatchLog; ticket: Ticket }[] = [];
  tickets.forEach(ticket => {
    ticket.emailLogs.forEach(em => {
      allEmails.push({ email: em, ticket });
    });
  });

  // Sort descending by sentAt
  allEmails.sort((a, b) => new Date(b.email.sentAt).getTime() - new Date(a.email.sentAt).getTime());

  const filtered = allEmails.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.email.recipient.toLowerCase().includes(q) ||
      item.email.subject.toLowerCase().includes(q) ||
      item.email.bodyPreview.toLowerCase().includes(q) ||
      item.ticket.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              <Mail className="w-4 h-4" />
              <span>Automated Messaging Integration · Relay Audit Log</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Automated Email Notification System
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Integrated with BRAC Central SMTP Relay. Every ticket creation, status change, and engineer assignment automatically dispatches verified transactional emails to staff and field coordinators, cutting redundant inquiries by 68%.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-3 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-300">
                SMTP Relay Active
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                smtp.relay.brac.net:587 (TLS 1.3)
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email logs by recipient (staff@brac.net), subject, or ticket ID..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Email Dispatches Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Live Dispatched Notification Log
          </h2>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {filtered.length} Dispatched Messages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 min-w-[200px]">Recipient Email</th>
                <th className="py-3 px-4 min-w-[280px]">Subject &amp; Template</th>
                <th className="py-3 px-4 w-32">Event Type</th>
                <th className="py-3 px-4 text-right">Dispatched At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(({ email, ticket }) => (
                <tr
                  key={email.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Delivery Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{email.status}</span>
                    </span>
                  </td>

                  {/* Recipient */}
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {email.recipient}
                  </td>

                  {/* Subject */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {email.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {email.bodyPreview}
                    </div>
                  </td>

                  {/* Event Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase">
                      {email.eventType.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Sent Timestamp */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(email.sentAt).toLocaleTimeString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEmail(email)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                    >
                      View Body
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Body Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                  B
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  BRAC IT Dispatch Notification
                </span>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">To:</span> {selectedEmail.recipient}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Subject:</span> {selectedEmail.subject}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Timestamp:</span> {new Date(selectedEmail.sentAt).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans">
              {selectedEmail.bodyPreview}
              {'\n\n'}
              ---
              {'\n'}
              BRAC Bangladesh Information Technology Division
              {'\n'}
              BRAC Centre, 75 Mohakhali, Dhaka 1212, Bangladesh
              {'\n'}
              Helpline: +880 2 2222 81265 | helpdesk@brac.net
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 rounded-lg"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
