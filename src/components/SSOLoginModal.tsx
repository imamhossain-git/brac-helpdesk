import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { DEMO_USERS } from '../data/initialData';
import { X, Lock, ShieldCheck, UserCheck, Wrench, ShieldAlert, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';

interface SSOLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
  reasonMessage?: string;
}

export const SSOLoginModal: React.FC<SSOLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  reasonMessage = 'Please authenticate via Single Sign-On to access Tickets and Service Tracking.',
}) => {
  const [googleRole, setGoogleRole] = useState<UserRole>('engineer');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('imamhossain5843@gmail.com');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Google SSO Handler
  const handleGoogleSSO = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const emailToUse = customGoogleEmail.trim() || 'imamhossain5843@gmail.com';
      const nameParts = emailToUse.split('@')[0].split(/[._-]/);
      const formattedName = nameParts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');

      const googleUser: AuthUser = {
        id: `usr-google-${Date.now()}`,
        name: formattedName || 'Imam Hossain',
        email: emailToUse,
        staffPin: 'G-SSO-8842',
        role: googleRole,
        department: googleRole === 'admin' 
          ? 'Information Technology Leadership' 
          : googleRole === 'engineer' 
          ? 'Information Technology Division' 
          : 'Microfinance & Field Operations',
        branchLocation: 'BRAC Centre, Mohakhali, Dhaka',
        avatarUrl: '/src/assets/images/avatar_it_engineer_1793943721762.jpg',
        authProvider: 'google',
      };

      onLogin(googleUser);
      onClose();
    }, 350);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your BRAC staff email address');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isAdm = email.toLowerCase().includes('admin');
      const isEng = email.toLowerCase().includes('engineer') || email.toLowerCase().includes('tanvir') || email.toLowerCase().includes('imam');
      
      const role = isAdm ? 'admin' : isEng ? 'engineer' : 'user';
      const user: AuthUser = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email.includes('@') ? email : `${email}@brac.net`,
        staffPin: `PIN-${Math.floor(10000 + Math.random() * 90000)}`,
        role,
        department: isAdm ? 'IT Administration' : isEng ? 'IT Support Operations' : 'Microfinance Programme',
        branchLocation: 'BRAC Centre, Mohakhali, Dhaka',
        authProvider: 'brac_sso',
      };
      onLogin(user);
      onClose();
    }, 400);
  };

  const handleQuickLogin = (userKey: keyof typeof DEMO_USERS) => {
    const selected = DEMO_USERS[userKey];
    onLogin({ ...selected, authProvider: 'brac_sso' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              B
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                BRAC Single Sign-On (SSO) Gateway
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Google SSO &amp; Microsoft 365 Enterprise Identity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason banner */}
        <div className="px-6 py-2.5 bg-rose-50/70 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{reasonMessage}</span>
        </div>

        <div className="p-6 space-y-6">
          
          {/* PRIMARY: Google SSO One-Click Section */}
          <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Fast Google SSO Login</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                OAuth 2.0 Verified
              </span>
            </div>

            {/* Official Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSSO}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-600 shadow-sm transition-all flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm group hover:border-slate-400"
            >
              {/* Google 4-Color SVG Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>

              <span>
                {loading ? 'Authenticating with Google...' : 'Sign in with Google'}
              </span>

              <span className="font-mono text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 hidden sm:inline">
                ({customGoogleEmail})
              </span>
            </button>

            {/* Google Role Selector */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Google SSO Staff Role:
              </span>
              <div className="flex items-center gap-1">
                {(['engineer', 'admin', 'user'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setGoogleRole(r)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                      googleRole === r
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r === 'engineer' ? 'IT Engineer' : r === 'admin' ? 'Admin (/admin)' : 'Field Staff'}
                  </button>
                ))}
              </div>
            </div>

            {/* Option to change Google account email */}
            <div className="pt-1">
              {showCustomGoogleInput ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={e => setCustomGoogleEmail(e.target.value)}
                    placeholder="Enter Google Workspace or Gmail"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(false)}
                    className="px-2.5 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="text-[11px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 underline"
                >
                  Change Google Account Email
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Or sign in with BRAC Staff SSO
            </span>
          </div>

          {/* Quick SSO Profiles */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Preset BRAC Identity Personas
            </div>

            <div className="space-y-2">
              
              {/* IT Support Engineer */}
              <button
                type="button"
                onClick={() => handleQuickLogin('engineer')}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600">
                      Tanvir Ahmed (Senior IT Support Engineer)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      tanvir.ahmed@brac.net · Mohakhali Dhaka HQ
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* IT Administrator */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                      Kazi Shamsul Alam (IT Administrator)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      kazi.shamsul@brac.net · Access to 23 Engineers Roster (/admin)
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Field Staff */}
              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                      Rahima Khatun (Microfinance Field Officer)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      rahima.khatun@brac.net · Bogura Sadar Branch
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>
          </div>

          {/* Manual Email & Password */}
          <form onSubmit={handleManualLogin} className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  BRAC Staff Email / PIN
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staff@brac.net"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Passcode
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {error && <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In with Staff Credentials'}</span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google SSO &amp; Microsoft SSO Active</span>
          </div>
          <span>Security: TLS 1.3</span>
        </div>

      </div>
    </div>
  );
};
