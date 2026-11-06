import React, { useState } from 'react';
import { TicketCategory, TicketPriority, Ticket } from '../types';
import { X, Send, AlertTriangle, Paperclip, CheckCircle2, Mail, Info } from 'lucide-react';

interface TicketSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: any) => Promise<Ticket | null>;
  prefilledTitle?: string;
  prefilledCategory?: TicketCategory;
}

export const TicketSubmissionModal: React.FC<TicketSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefilledTitle = '',
  prefilledCategory = 'hardware',
}) => {
  const [title, setTitle] = useState(prefilledTitle);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(prefilledCategory);
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [department, setDepartment] = useState('Microfinance Programme');
  const [branchLocation, setBranchLocation] = useState('BRAC Centre, Mohakhali, Dhaka');
  const [staffName, setStaffName] = useState('Kamal Haque');
  const [staffEmail, setStaffEmail] = useState('kamal.haque@brac.net');
  const [staffPin, setStaffPin] = useState('PIN-88421');
  const [phone, setPhone] = useState('+880 1711-998822');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        category,
        priority,
        department,
        branchLocation,
        submittedBy: {
          name: staffName,
          email: staffEmail,
          staffPin,
          phone,
        },
      });
      onClose();
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateAttachment = () => {
    setAttachmentName('error_screenshot_diagnostic.png (1.2 MB)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Submit New IT Support Ticket
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              BRAC Bangladesh Information Technology Division · Automated Ticket Routing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Summary / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Microfinance tablet sync failure during group loan collection"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Grid: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                System / Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="field_tablet">Field Tablet & Offline Microfinance App</option>
                <option value="erp_agresso">BRAC ERP Agresso (Unit4)</option>
                <option value="m365_email">Microsoft 365 (Outlook, Teams, SSO 2FA)</option>
                <option value="network_wifi">Branch Network, Wi-Fi & Satellite Gateway</option>
                <option value="biometric_hr">Biometric Attendance Terminal & HRIS</option>
                <option value="vpn_remote">GlobalProtect VPN & Remote Intranet</option>
                <option value="hardware">Laptop, Desktop & Regional Printer</option>
                <option value="donor_volunteer_tech">Donor E-Receipts & Volunteer Portal Tech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Urgency & Priority *
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="low">Low (Standard Request · 24h SLA)</option>
                <option value="medium">Medium (Standard Incident · 8h SLA)</option>
                <option value="high">High (Branch Operations Impact · 4h SLA)</option>
                <option value="critical">Critical (Emergency / Program Outage · 2h SLA)</option>
              </select>
            </div>
          </div>

          {/* Grid: Programme & Branch Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                BRAC Programme / Division *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Microfinance Programme">Microfinance Programme</option>
                <option value="Ultra-Poor Graduation (UPG)">Ultra-Poor Graduation (UPG)</option>
                <option value="Education Programme (BEP)">Education Programme (BEP)</option>
                <option value="Health, Nutrition & Population (HNPP)">Health, Nutrition & Population (HNPP)</option>
                <option value="Humanitarian Crisis Management (HCMP)">Humanitarian Crisis Management (HCMP)</option>
                <option value="BRAC Enterprises & Aarong">BRAC Enterprises & Aarong</option>
                <option value="Human Resources & Administration">Human Resources & Administration</option>
                <option value="Resource Mobilization & Donors">Resource Mobilization & Donors</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch / Facility Location *
              </label>
              <input
                type="text"
                required
                value={branchLocation}
                onChange={e => setBranchLocation(e.target.value)}
                placeholder="e.g. Bogura Sadar Branch or BRAC Centre Level 8"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Staff Contact Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Staff Contact & Notification Recipient
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Automated status emails sent to this address
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  placeholder="Staff Name"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                  placeholder="Staff Official Email (@brac.net)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={staffPin}
                  onChange={e => setStaffPin(e.target.value)}
                  placeholder="Staff PIN / Volunteer ID"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone / WhatsApp Contact"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description & Steps to Reproduce *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please describe what occurred, any error messages displayed, and what steps you tried..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Attachment Simulator */}
          <div className="flex items-center justify-between pt-1">
            {attachmentName ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Attached: {attachmentName}</span>
                <button
                  type="button"
                  onClick={() => setAttachmentName(null)}
                  className="text-slate-400 hover:text-slate-600 ml-1 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateAttachment}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach Screenshot / Diagnostic Log</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{showEmailPreview ? 'Hide Email Preview' : 'Preview Auto-Notification'}</span>
            </button>
          </div>

          {/* Email Notification Integration Preview */}
          {showEmailPreview && (
            <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs space-y-1.5">
              <div className="font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Automated Email Notification System Integration</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">To:</span> {staffEmail || 'staff@brac.net'}
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Subject:</span> [BRAC-IT-XXXX] BRAC IT Support Ticket Logged: {title || '(Title)'}
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-[11px] bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                Assalam-o-Alaikum {staffName}. Your IT ticket has been logged into the BRAC Helpdesk system with priority [{(priority || 'medium').toUpperCase()}]. An IT support engineer from BRAC IT Division will review it within the SLA window.
              </div>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispatching...' : 'Submit IT Ticket'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
