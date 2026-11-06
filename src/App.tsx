import React, { useState, useEffect } from 'react';
import { UserRole, Ticket, KnowledgeArticle, AnalyticsSummary, BackupStatus, TicketCategory, AuthUser, EngineerProfile } from './types';
import { Header } from './components/Header';
import { TicketDashboard } from './components/TicketDashboard';
import { TicketSubmissionModal } from './components/TicketSubmissionModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { KnowledgeBase } from './components/KnowledgeBase';
import { SSOLoginModal } from './components/SSOLoginModal';
import { AdminManagementView } from './components/AdminManagementView';
import { INITIAL_TICKETS, INITIAL_KNOWLEDGE_BASE, INITIAL_BACKUPS, INITIAL_ENGINEERS, DEMO_USERS } from './data/initialData';

export default function App() {
  // Authentication session state: null by default so user sees ONLY the FAQ page when landing!
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'kb' | 'tickets' | 'admin'>('kb');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>(INITIAL_KNOWLEDGE_BASE);
  const [engineers, setEngineers] = useState<EngineerProfile[]>(INITIAL_ENGINEERS);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>({
    lastCloudSync: new Date().toISOString(),
    syncStatus: 'synced',
    dailyBackupSchedule: '02:00 AM BST (Automated Daily)',
    retentionDays: 30,
    cloudRegion: 'Asia-South1 (Dhaka / Mumbai Tier-3 Cloud)',
    snapshots: INITIAL_BACKUPS,
    autoBackupEnabled: true,
  });

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isSSOOpen, setIsSSOOpen] = useState(false);
  const [ssoReason, setSsoReason] = useState('Please authenticate via BRAC SSO to access Tickets and Service Tracking.');
  const [pendingActionAfterSSO, setPendingActionAfterSSO] = useState<'tickets' | 'new_ticket' | 'admin' | null>(null);

  const [prefillTitle, setPrefillTitle] = useState('');
  const [prefillCategory, setPrefillCategory] = useState<TicketCategory>('hardware');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Dark Mode with document.documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check URL path for /admin or #admin
  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setActiveTab('admin');
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial fetch from backend with fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, kbRes, engRes, analyticsRes, backupRes] = await Promise.all([
          fetch('/api/tickets'),
          fetch('/api/knowledge-base'),
          fetch('/api/engineers'),
          fetch('/api/analytics'),
          fetch('/api/backup/status'),
        ]);

        if (ticketsRes.ok) {
          const data = await ticketsRes.json();
          if (Array.isArray(data) && data.length > 0) setTickets(data);
        }
        if (kbRes.ok) {
          const data = await kbRes.json();
          if (Array.isArray(data) && data.length > 0) setKnowledgeBase(data);
        }
        if (engRes.ok) {
          const data = await engRes.json();
          if (Array.isArray(data) && data.length > 0) setEngineers(data);
        }
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
        if (backupRes.ok) {
          const data = await backupRes.json();
          setBackupStatus(data);
        }
      } catch (err) {
        console.warn('Backend API unavailable, using in-memory mock store:', err);
      }
    };

    fetchData();
  }, []);

  // SSO Login / Logout Handlers
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    showToast(`Signed in successfully via BRAC SSO as ${user.name} (${user.role.toUpperCase()})`);

    // Handle any pending action that triggered the login prompt
    if (pendingActionAfterSSO === 'new_ticket') {
      setIsNewTicketOpen(true);
    } else if (pendingActionAfterSSO === 'tickets') {
      setActiveTab('tickets');
    } else if (pendingActionAfterSSO === 'admin' && user.role === 'admin') {
      setActiveTab('admin');
      window.history.replaceState(null, '', '/admin');
    } else if (user.role === 'admin' && activeTab === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('tickets');
    }
    setPendingActionAfterSSO(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('kb');
    window.history.replaceState(null, '', '/');
    showToast('Signed out of BRAC SSO. Returned to Public Knowledge Base & FAQ.');
  };

  const requireAuthForNewTicket = () => {
    if (!currentUser) {
      setSsoReason('Single Sign-On required: Please log in with your BRAC staff credentials to create an IT ticket.');
      setPendingActionAfterSSO('new_ticket');
      setIsSSOOpen(true);
    } else {
      setPrefillTitle('');
      setPrefillCategory('hardware');
      setIsNewTicketOpen(true);
    }
  };

  const requireAuthForTickets = () => {
    if (!currentUser) {
      setSsoReason('Single Sign-On required: Please log in with your BRAC staff credentials to view and track IT support tickets.');
      setPendingActionAfterSSO('tickets');
      setIsSSOOpen(true);
    } else {
      setActiveTab('tickets');
    }
  };

  const handleTabChange = (tab: 'kb' | 'tickets' | 'admin') => {
    if (tab === 'tickets') {
      requireAuthForTickets();
    } else if (tab === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        setSsoReason('Admin authorization required: Please sign in as an IT Administrator to access the 23 Engineers Roster & Allocation Matrix.');
        setPendingActionAfterSSO('admin');
        setIsSSOOpen(true);
      } else {
        setActiveTab('admin');
        window.history.replaceState(null, '', '/admin');
      }
    } else {
      setActiveTab('kb');
      window.history.replaceState(null, '', '/');
    }
  };

  // Ticket Handlers
  const handleCreateTicket = async (ticketData: any): Promise<Ticket | null> => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (res.ok) {
        const newTicket: Ticket = await res.json();
        setTickets(prev => [newTicket, ...prev]);
        showToast(`Ticket ${newTicket.id} created! Automated email notification sent to ${newTicket.submittedBy.email}.`);
        return newTicket;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback
    const newId = `BRAC-IT-${8500 + tickets.length + 1}`;
    const fallbackTicket: Ticket = {
      id: newId,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority,
      status: 'open',
      department: ticketData.department,
      branchLocation: ticketData.branchLocation,
      submittedBy: ticketData.submittedBy,
      assignedTo: {
        id: 'eng-01',
        name: 'Tanvir Ahmed',
        email: 'tanvir.ahmed@brac.net',
        role: 'Senior IT Support Engineer',
        avatarUrl: '/src/assets/images/avatar_it_engineer_1793943721762.jpg',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaTargetMinutes: ticketData.priority === 'critical' ? 120 : 480,
      internalNotes: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'open',
          note: 'Ticket submitted via portal.',
          timestamp: new Date().toISOString(),
          actor: ticketData.submittedBy.name,
        },
      ],
      emailLogs: [
        {
          id: `em-${Date.now()}`,
          recipient: ticketData.submittedBy.email,
          subject: `[${newId}] Ticket Logged: ${ticketData.title}`,
          bodyPreview: `Assalam-o-Alaikum ${ticketData.submittedBy.name}. Your support ticket has been received and queued with BRAC IT Division.`,
          sentAt: new Date().toISOString(),
          status: 'delivered',
          eventType: 'ticket_created',
        },
      ],
    };

    setTickets(prev => [fallbackTicket, ...prev]);
    showToast(`Ticket ${newId} logged with automated email notification!`);
    return fallbackTicket;
  };

  const handleUpdateTicket = async (ticketId: string, updates: any) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated: Ticket = await res.json();
        setTickets(prev => prev.map(t => (t.id === ticketId ? updated : t)));
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(updated);
        }
        showToast(`Ticket ${ticketId} status updated. Automated email notification dispatched!`);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local client fallback
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        const now = new Date().toISOString();
        const updatedStatus = updates.status || t.status;
        const newTimeline = [...t.timeline];
        const newEmailLogs = [...t.emailLogs];

        if (updates.status && updates.status !== t.status) {
          newTimeline.push({
            id: `tl-${Date.now()}`,
            status: updatedStatus,
            note: updates.statusNote || `Status changed to ${updatedStatus}`,
            timestamp: now,
            actor: updates.noteAuthor || currentUser?.name || 'IT Support Engineer',
          });

          newEmailLogs.unshift({
            id: `em-${Date.now()}`,
            recipient: t.submittedBy.email,
            subject: `[${t.id} Update] Status changed to ${updatedStatus.toUpperCase()}`,
            bodyPreview: `Dear ${t.submittedBy.name}, your ticket status was updated to ${updatedStatus}. Note: ${updates.statusNote || 'Work is ongoing.'}`,
            sentAt: now,
            status: 'delivered',
            eventType: updatedStatus === 'resolved' ? 'resolved' : 'status_updated',
          });
        }

        const newInternalNotes = [...t.internalNotes];
        if (updates.noteContent) {
          newInternalNotes.push({
            id: `note-${Date.now()}`,
            author: updates.noteAuthor || currentUser?.name || 'Tanvir Ahmed',
            authorRole: 'IT Support Engineer',
            content: updates.noteContent,
            createdAt: now,
          });
        }

        const updatedObj: Ticket = {
          ...t,
          status: updatedStatus,
          priority: updates.priority || t.priority,
          updatedAt: now,
          resolvedAt: updatedStatus === 'resolved' ? now : t.resolvedAt,
          timeline: newTimeline,
          emailLogs: newEmailLogs,
          internalNotes: newInternalNotes,
        };

        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(updatedObj);
        }
        return updatedObj;
      })
    );

    showToast(`Ticket ${ticketId} updated. Status update email dispatched!`);
  };

  // Admin Engineer Assignment
  const handleAssignEngineer = async (ticketId: string, engineer: EngineerProfile) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineerId: engineer.id }),
      });

      if (res.ok) {
        const updatedTicket: Ticket = await res.json();
        setTickets(prev => prev.map(t => (t.id === ticketId ? updatedTicket : t)));
        showToast(`Ticket ${ticketId} assigned to ${engineer.name}`);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        const now = new Date().toISOString();
        return {
          ...t,
          assignedTo: {
            id: engineer.id,
            name: engineer.name,
            email: engineer.email,
            role: engineer.role,
            avatarUrl: engineer.avatarUrl,
          },
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              status: t.status,
              note: `Assigned to ${engineer.name} (${engineer.branchLocation}) by IT Administrator.`,
              timestamp: now,
              actor: currentUser?.name || 'IT Administrator',
            },
          ],
          emailLogs: [
            {
              id: `em-${Date.now()}`,
              recipient: engineer.email,
              subject: `[DISPATCH ASSIGNED] [${t.id}] ${t.title}`,
              bodyPreview: `You have been allocated ticket ${t.id}. Submitter: ${t.submittedBy.name}.`,
              sentAt: now,
              status: 'delivered',
              eventType: 'engineer_assigned',
            },
            ...t.emailLogs,
          ],
        };
      })
    );

    showToast(`Ticket ${ticketId} assigned to ${engineer.name}`);
  };

  const handleUpdateEngineerRole = async (engineerId: string, newRole: EngineerProfile['role']) => {
    try {
      await fetch(`/api/engineers/${engineerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
    } catch (err) {
      console.error(err);
    }

    setEngineers(prev =>
      prev.map(e => (e.id === engineerId ? { ...e, role: newRole } : e))
    );
    showToast(`Engineer role updated to ${newRole}`);
  };

  const handleToggleEngineerStatus = async (engineerId: string) => {
    const eng = engineers.find(e => e.id === engineerId);
    if (!eng) return;
    const nextStatus = eng.status === 'on_duty' ? 'active' : eng.status === 'active' ? 'on_leave' : 'on_duty';

    try {
      await fetch(`/api/engineers/${engineerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error(err);
    }

    setEngineers(prev =>
      prev.map(e => (e.id === engineerId ? { ...e, status: nextStatus } : e))
    );
  };

  const handleVoteHelpful = async (articleId: string, helpful: boolean) => {
    try {
      await fetch(`/api/knowledge-base/${articleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      });
    } catch (err) {
      console.error(err);
    }

    setKnowledgeBase(prev =>
      prev.map(a => {
        if (a.id !== articleId) return a;
        return {
          ...a,
          helpfulCount: helpful ? a.helpfulCount + 1 : a.helpfulCount,
          unhelpfulCount: !helpful ? a.unhelpfulCount + 1 : a.unhelpfulCount,
        };
      })
    );
  };

  const handleCreateTicketFromKB = (article: KnowledgeArticle) => {
    if (!currentUser) {
      setSsoReason(`Single Sign-On required: Please log in to submit a ticket regarding "${article.title}".`);
      setPrefillTitle(`Issue related to: ${article.title}`);
      setPrefillCategory(article.category);
      setPendingActionAfterSSO('new_ticket');
      setIsSSOOpen(true);
    } else {
      setPrefillTitle(`Issue related to: ${article.title}`);
      setPrefillCategory(article.category);
      setIsNewTicketOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl shadow-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold flex items-center gap-3 border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenNewTicket={requireAuthForNewTicket}
        onOpenSSO={() => {
          setSsoReason('Please authenticate with BRAC SSO to access tickets and management features.');
          setIsSSOOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Knowledge Base Landing Page (Default for all users and visitors) */}
        {activeTab === 'kb' && (
          <KnowledgeBase
            articles={knowledgeBase}
            onVoteHelpful={handleVoteHelpful}
            onCreateTicketFromArticle={handleCreateTicketFromKB}
            onOpenNewTicket={requireAuthForNewTicket}
            onNavigateToTickets={requireAuthForTickets}
            tickets={tickets}
          />
        )}

        {/* Tickets & Tracking View (Requires SSO) */}
        {activeTab === 'tickets' && (
          <TicketDashboard
            tickets={tickets}
            onSelectTicket={setSelectedTicket}
            onOpenNewTicket={requireAuthForNewTicket}
            currentRole={currentUser?.role || 'user'}
            onNavigateToTab={handleTabChange}
          />
        )}

        {/* Admin Console (/admin) - Dedicated 23 Engineers Roster & Ticket Matrix */}
        {activeTab === 'admin' && (
          <AdminManagementView
            currentUser={currentUser}
            tickets={tickets}
            engineers={engineers}
            onAssignEngineer={handleAssignEngineer}
            onUpdateEngineerRole={handleUpdateEngineerRole}
            onToggleEngineerStatus={handleToggleEngineerStatus}
            onSelectTicket={setSelectedTicket}
            onOpenSSO={() => {
              setSsoReason('Admin authorization required: Please authenticate as an IT Administrator to access /admin.');
              setPendingActionAfterSSO('admin');
              setIsSSOOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <SSOLoginModal
        isOpen={isSSOOpen}
        onClose={() => {
          setIsSSOOpen(false);
          setPendingActionAfterSSO(null);
        }}
        onLogin={handleLogin}
        reasonMessage={ssoReason}
      />

      <TicketSubmissionModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSubmit={handleCreateTicket}
        prefilledTitle={prefillTitle}
        prefilledCategory={prefillCategory}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdateTicket={handleUpdateTicket}
        currentRole={currentUser?.role || 'user'}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-[10px]">
              B
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              BRAC Bangladesh Information Technology Division
            </span>
            <span aria-hidden="true">·</span>
            <span>BRAC Centre, 75 Mohakhali, Dhaka 1212</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>IT Helpline: +880 2 2222 81265</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => handleTabChange('admin')}
              className="hover:text-rose-600 dark:hover:text-rose-400 font-medium"
            >
              Admin Portal (/admin)
            </button>
            <span aria-hidden="true">·</span>
            <span>Protected by BRAC SSO Gateway</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
