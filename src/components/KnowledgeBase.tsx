import React, { useState } from 'react';
import { KnowledgeArticle, TicketCategory, Ticket } from '../types';
import { 
  Search, 
  BookOpen, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  Copy, 
  ArrowRight,
  Sparkles,
  Building2,
  FileQuestion,
  HelpCircle,
  Plus,
  Inbox,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';

interface KnowledgeBaseProps {
  articles: KnowledgeArticle[];
  onVoteHelpful: (articleId: string, helpful: boolean) => Promise<void>;
  onCreateTicketFromArticle: (article: KnowledgeArticle) => void;
  onOpenNewTicket: () => void;
  onNavigateToTickets: () => void;
  tickets: Ticket[];
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  articles,
  onVoteHelpful,
  onCreateTicketFromArticle,
  onOpenNewTicket,
  onNavigateToTickets,
  tickets,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(articles[0]?.id || null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  // Embedded AI Instant Assistant for Landing Page
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const filtered = articles.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleVote = async (id: string, helpful: boolean) => {
    if (votedMap[id] !== undefined) return;
    setVotedMap(prev => ({ ...prev, [id]: helpful }));
    await onVoteHelpful(id, helpful);
  };

  const handleAskAi = async (queryText?: string) => {
    const q = queryText || aiInput;
    if (!q.trim() || aiLoading) return;
    setAiLoading(true);
    setShowAiHelper(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, mode: 'it_troubleshoot' }),
      });
      const data = await res.json();
      setAiResponse(data.reply || 'Our IT engineering desk is available to assist.');
    } catch (err) {
      setAiResponse('Assalam-o-Alaikum. If you require immediate assistance, please log a support ticket.');
    } finally {
      setAiLoading(false);
    }
  };

  const activeTicketCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;

  return (
    <div className="space-y-8">
      
      {/* Landing Page Hero: BRAC IT Knowledge & Support Portal */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          <div className="lg:col-span-8 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>BRAC Bangladesh · IT Support Portal &amp; Knowledge Base</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                How can our IT team help you today?
              </h1>
              
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Search verified step-by-step solutions for BRAC systems, microfinance field tablet apps, ERP Agresso, Office 365, VPN access, and donor receipts.
              </p>

              {/* Big Search Input */}
              <div className="relative mt-6 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search technical guides: e.g. Outlook SSO loop, tablet sync timeout, Agresso token, VPN..."
                  className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                />
              </div>

              {/* Popular quick searches */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Popular:</span>
                <button
                  onClick={() => setSearch('tablet sync')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2"
                >
                  Microfinance Tablet Sync
                </button>
                <span>·</span>
                <button
                  onClick={() => setSearch('Outlook SSO')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2"
                >
                  Outlook 2FA Reset
                </button>
                <span>·</span>
                <button
                  onClick={() => setSearch('GlobalProtect')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2"
                >
                  GlobalProtect VPN
                </button>
                <span>·</span>
                <button
                  onClick={() => setSearch('donor receipt')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2"
                >
                  Donor Tax Receipts
                </button>
              </div>
            </div>

            {/* Quick Action Navigation CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onOpenNewTicket}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Submit IT Support Ticket</span>
              </button>

              <button
                onClick={onNavigateToTickets}
                className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Inbox className="w-4 h-4 text-slate-500" />
                <span>Track Tickets &amp; Queue ({activeTicketCount} active)</span>
              </button>

              <button
                onClick={() => {
                  setShowAiHelper(true);
                  if (!aiResponse) handleAskAi('What are the most common self-service fixes for BRAC field staff?');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl transition-colors"
              >
                <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>AI Instant Troubleshooting</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-[220px] lg:min-h-full">
            <img
              src="/src/assets/images/brac_dhaka_headquarters_1793943722761.jpg"
              alt="BRAC Centre Mohakhali Dhaka Headquarters"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-white dark:lg:to-slate-900" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs lg:hidden">
              BRAC Centre · 75 Mohakhali, Dhaka 1212
            </div>
          </div>

        </div>
      </div>

      {/* Embedded AI Troubleshooter Assistant Drawer (if opened) */}
      {showAiHelper && (
        <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                AI
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  BRAC IT Knowledge AI Assistant
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instant answer engine for technical troubleshooting, donor inquiries &amp; volunteer tools
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAiHelper(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Response Display */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line shadow-sm min-h-[70px]">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>Consulting BRAC IT knowledge base and generating solution...</span>
              </div>
            ) : (
              aiResponse || 'Ask any technical or support question above.'
            )}
          </div>

          {/* Quick AI query input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskAi()}
              placeholder="Ask AI: e.g. How to fix Samsung Tab sync failure in field branch?"
              className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              onClick={() => handleAskAi()}
              disabled={aiLoading || !aiInput.trim()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: 'All Articles' },
            { id: 'field_tablet', label: 'Field Tablets & Microfinance' },
            { id: 'm365_email', label: 'Outlook, Teams & SSO' },
            { id: 'vpn_remote', label: 'GlobalProtect VPN' },
            { id: 'donor_volunteer_tech', label: 'Donor & Volunteer Tech' },
            { id: 'erp_agresso', label: 'BRAC ERP Agresso' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
          Showing {filtered.length} guides
        </span>
      </div>

      {/* Article List & Accordion */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <FileQuestion className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No matching knowledge base article found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Can't find a solution for your technical problem? Submit a support ticket and our engineering team will assist.
            </p>
            <button
              onClick={onOpenNewTicket}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
            >
              Submit IT Support Ticket
            </button>
          </div>
        ) : (
          filtered.map(article => {
            const isExpanded = expandedArticleId === article.id;
            const hasVoted = votedMap[article.id] !== undefined;

            return (
              <div
                key={article.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all"
              >
                {/* Article Header Row */}
                <div
                  onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        {article.category.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Target: {article.departmentScope}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.readTimeMinutes} min read</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {article.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'Read Guide'}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Expanded Article Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs sm:text-sm">
                    
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {article.content}
                    </p>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Resolution Protocol:
                      </h3>
                      <ol className="space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300 pl-1">
                        {article.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Quick Fix Command Block (if any) */}
                    {article.quickFixCommand && (
                      <div className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-xl flex items-center justify-between gap-3 font-mono text-xs">
                        <code className="truncate">{article.quickFixCommand}</code>
                        <button
                          onClick={() => handleCopy(article.quickFixCommand!)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-[11px] text-white shrink-0 transition-colors"
                        >
                          {copiedCmd === article.quickFixCommand ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[11px] text-slate-400 font-medium">Keywords:</span>
                      {article.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Feedback & Ticket CTA Bar */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      
                      {/* Was this helpful */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Did this solve your issue?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            disabled={hasVoted}
                            onClick={() => handleVote(article.id, true)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              votedMap[article.id] === true
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Yes ({article.helpfulCount})</span>
                          </button>

                          <button
                            disabled={hasVoted}
                            onClick={() => handleVote(article.id, false)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              votedMap[article.id] === false
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>No</span>
                          </button>
                        </div>
                      </div>

                      {/* Prefill Ticket CTA */}
                      <button
                        onClick={() => onCreateTicketFromArticle(article)}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline flex items-center gap-1"
                      >
                        <span>Still having problems? Submit Ticket with this issue</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Assistance Banner */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Need hands-on technical assistance from a BRAC Engineer?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit a ticket to receive automated email updates and SLA resolution from our on-call IT division.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateToTickets}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors"
          >
            Track Existing Tickets
          </button>
          <button
            onClick={onOpenNewTicket}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
          >
            Submit New Ticket
          </button>
        </div>
      </div>

    </div>
  );
};
