import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TicketCategory } from '../types';
import { 
  Sparkles, 
  Send, 
  HeartHandshake, 
  UserCheck, 
  LifeBuoy, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';

interface AIChatViewProps {
  onOpenTicketWithContext: (title: string, category: TicketCategory) => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ onOpenTicketWithContext }) => {
  const [activeMode, setActiveMode] = useState<'donor_inquiry' | 'volunteer_support' | 'it_troubleshoot'>('donor_inquiry');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Assalam-o-Alaikum! Welcome to BRAC Bangladesh's AI Support Desk.
I can assist you with:
- **Donor Inquiries**: Tax exemption certificates (NBR SRO & UK Gift Aid), e-receipt verification, and project allocations.
- **Volunteer Support**: Digital onboarding at \`volunteer.brac.net\`, field tablet tools, and regional branch assignments.
- **IT Support**: Microfinance apps, Microsoft 365, Agresso ERP, and VPN setup.

Select a quick topic below or type your question.`,
      timestamp: new Date().toISOString(),
      mode: 'donor_inquiry',
      suggestedAction: undefined,
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      mode: activeMode,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode: activeMode }),
      });
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Assalam-o-Alaikum. Our team is available to assist you.',
        timestamp: new Date().toISOString(),
        mode: activeMode,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Assalam-o-Alaikum. Thank you for your inquiry. For immediate assistance with BRAC donation certificates or volunteer onboarding, our IT Helpdesk engineer is on duty. You can submit an official support ticket for personalized handling.`,
        timestamp: new Date().toISOString(),
        mode: activeMode,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const donorPresets = [
    'How do I claim tax exemption and get my NBR / UK Gift Aid certificate?',
    'Where does my donation go across BRAC programs in Bangladesh?',
    'I made a donation via bKash but did not receive the PDF receipt.',
    'How does BRAC verify corporate CSR funding transparency?',
  ];

  const volunteerPresets = [
    'How do community volunteers register on the digital volunteer portal?',
    'What are the device requirements for BRAC education field volunteers?',
    'My SMS verification code for volunteer.brac.net has not arrived.',
    'Where do I collect my volunteer QR identification badge?',
  ];

  const itPresets = [
    'Samsung Galaxy Tab Active fails to sync microfinance offline loan records.',
    'How do I clear cached SSO credentials for Outlook and Teams 2FA?',
    'BRAC ERP Agresso shows Session Token Mismatch error.',
    'Palo Alto GlobalProtect VPN gateway connection dropping on satellite link.',
  ];

  const currentPresets =
    activeMode === 'donor_inquiry'
      ? donorPresets
      : activeMode === 'volunteer_support'
      ? volunteerPresets
      : itPresets;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with BRAC Field Context */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Digital Support Assistant</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 font-normal lowercase">multilingual EN &amp; BN support</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                BRAC Donor Inquiries &amp; Automated Volunteer Support
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Trained on official BRAC Bangladesh guidelines: obtain instant answers for international and local donation receipts, tax deduction rules, and volunteer field onboarding.
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <button
                onClick={() => setActiveMode('donor_inquiry')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMode === 'donor_inquiry'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Donor Inquiries &amp; Tax Receipts</span>
              </button>

              <button
                onClick={() => setActiveMode('volunteer_support')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMode === 'volunteer_support'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Volunteer Onboarding &amp; Tools</span>
              </button>

              <button
                onClick={() => setActiveMode('it_troubleshoot')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMode === 'it_troubleshoot'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>IT Engineer Assistant</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-[160px] lg:min-h-full">
            <img
              src="/src/assets/images/brac_field_program_1793943722630.jpg"
              alt="BRAC Bangladesh Field Staff and Community Volunteers"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-white dark:lg:to-slate-900" />
            <div className="absolute bottom-3 left-4 right-4 text-white text-xs lg:hidden">
              BRAC Field Outreach &amp; Volunteer Brigade
            </div>
          </div>

        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[580px] overflow-hidden">
        
        {/* Chat Stream Viewport */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-800 text-white dark:bg-slate-700'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {isUser ? 'You' : 'B'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-750 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line prose-sm">{msg.content}</div>

                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>BRAC Verified AI Assistant</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            onOpenTicketWithContext(
                              'Technical assistance requested from AI consultation',
                              'donor_volunteer_tech'
                            )
                          }
                          className="hover:text-rose-600 dark:hover:text-rose-400 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Log Ticket</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                B
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>Generating verified response from BRAC knowledge engine...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {currentPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap shrink-0 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Bottom Input Field */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                activeMode === 'donor_inquiry'
                  ? 'Ask about tax deduction, donation receipts, payment methods...'
                  : activeMode === 'volunteer_support'
                  ? 'Ask about volunteer registration, field tablets, branch support...'
                  : 'Ask about BRAC IT systems, Outlook, Agresso, VPN...'
              }
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
