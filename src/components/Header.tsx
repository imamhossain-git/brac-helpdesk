import React, { useState } from 'react';
import { UserRole, AuthUser } from '../types';
import { 
  Sun, 
  Moon, 
  Plus, 
  UserCheck, 
  ShieldAlert, 
  Wrench, 
  HeartHandshake, 
  ChevronDown,
  BookOpen,
  Inbox,
  Lock,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';

interface HeaderProps {
  currentUser: AuthUser | null;
  activeTab: 'kb' | 'tickets' | 'admin';
  onTabChange: (tab: 'kb' | 'tickets' | 'admin') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewTicket: () => void;
  onOpenSSO: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  darkMode,
  onToggleDarkMode,
  onOpenNewTicket,
  onOpenSSO,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'IT Administrator',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        };
      case 'engineer':
        return {
          label: 'IT Support Engineer',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          icon: <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
        };
      case 'donor_volunteer':
        return {
          label: 'Donor / Volunteer',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          icon: <HeartHandshake className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        };
      default:
        return {
          label: 'Field Staff / End User',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        };
    }
  };

  const roleInfo = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            B
          </div>
          <button 
            onClick={() => onTabChange('kb')}
            className="text-left group cursor-pointer focus:outline-none"
            title="BRAC IT Helpdesk FAQ Landing Page"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
              BRAC IT Helpdesk
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => onTabChange('kb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'kb'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base &amp; FAQ</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                onOpenSSO();
              } else {
                onTabChange('tickets');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'tickets'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Tickets &amp; Tracking</span>
            {!currentUser && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
          </button>

          {/* Admin Page Tab - Visible when logged in as admin */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Admin Console (/admin)</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Auth State, Dark Mode, New Ticket) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Unauthenticated: Show Sign In with Google / SSO button */}
          {!currentUser ? (
            <button
              onClick={onOpenSSO}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In (Google / SSO)</span>
            </button>
          ) : (
            /* Authenticated User Menu */
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.name[0]}
                  </div>
                )}
                <span className="hidden sm:inline font-semibold truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 z-40">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.email}
                      </div>
                      {roleInfo && (
                        <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${roleInfo.color}`}>
                          {roleInfo.icon}
                          <span>{roleInfo.label}</span>
                        </div>
                      )}
                      {currentUser.authProvider === 'google' && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span>Google SSO Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Switch role persona shortcut */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenSSO();
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Switch SSO Persona</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onTabChange('admin');
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 font-medium"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Open Admin Console (/admin)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out (SSO)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Ticket</span>
          </button>

        </div>

      </div>
    </header>
  );
};
