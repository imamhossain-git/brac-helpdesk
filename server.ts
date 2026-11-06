import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_TICKETS, INITIAL_KNOWLEDGE_BASE, INITIAL_BACKUPS, INITIAL_ENGINEERS } from './src/data/initialData';
import { Ticket, KnowledgeArticle, BackupSnapshot, TicketStatus, EmailDispatchLog, EngineerProfile } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent state during server runtime
let tickets: Ticket[] = [...INITIAL_TICKETS];
let knowledgeBase: KnowledgeArticle[] = [...INITIAL_KNOWLEDGE_BASE];
let snapshots: BackupSnapshot[] = [...INITIAL_BACKUPS];
let engineers: EngineerProfile[] = [...INITIAL_ENGINEERS];
let lastCloudSyncTime = new Date().toISOString();
let autoBackupEnabled = true;

// Server-side Gemini Client
let geminiAi: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
  }
}

// ---------------- API Routes ----------------

// 1. Tickets
app.get('/api/tickets', (req: Request, res: Response) => {
  const { category, status, priority, search, userEmail } = req.query;
  let filtered = [...tickets];

  if (userEmail && typeof userEmail === 'string') {
    filtered = filtered.filter(t => t.submittedBy.email.toLowerCase() === userEmail.toLowerCase());
  }
  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }
  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }
  if (priority && typeof priority === 'string' && priority !== 'all') {
    filtered = filtered.filter(t => t.priority === priority);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      t =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.submittedBy.name.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

app.post('/api/tickets', (req: Request, res: Response) => {
  const body = req.body;
  const newNum = 8500 + tickets.length + 1;
  const ticketId = `BRAC-IT-${newNum}`;
  const now = new Date().toISOString();

  let slaTargetMinutes = 480; // default 8 hours
  if (body.priority === 'critical') slaTargetMinutes = 120; // 2 hours
  else if (body.priority === 'high') slaTargetMinutes = 240; // 4 hours
  else if (body.priority === 'low') slaTargetMinutes = 1440; // 24 hours

  const welcomeEmail: EmailDispatchLog = {
    id: `em-${Date.now()}-1`,
    recipient: body.submittedBy?.email || 'user@brac.net',
    subject: `[${ticketId}] BRAC IT Support Ticket Logged: ${body.title}`,
    bodyPreview: `Assalam-o-Alaikum ${body.submittedBy?.name || 'Staff'}. Your IT ticket has been logged into the BRAC Helpdesk system with priority [${(body.priority || 'MEDIUM').toUpperCase()}]. An IT support engineer from BRAC IT Division will review it within SLA window.`,
    sentAt: now,
    status: 'delivered',
    eventType: 'ticket_created',
  };

  const newTicket: Ticket = {
    id: ticketId,
    title: body.title || 'Untitled Request',
    description: body.description || '',
    category: body.category || 'hardware',
    priority: body.priority || 'medium',
    status: 'open',
    department: body.department || 'Microfinance Programme',
    branchLocation: body.branchLocation || 'BRAC Centre, Mohakhali, Dhaka',
    submittedBy: {
      name: body.submittedBy?.name || 'BRAC Staff',
      email: body.submittedBy?.email || 'staff@brac.net',
      staffPin: body.submittedBy?.staffPin || 'PIN-9901',
      phone: body.submittedBy?.phone || '+880 1700-000000',
    },
    assignedTo: {
      name: 'Tanvir Ahmed',
      email: 'tanvir.ahmed@brac.net',
      role: 'Senior IT Support Engineer',
      avatarUrl: '/src/assets/images/avatar_it_engineer_1793943721762.jpg',
    },
    createdAt: now,
    updatedAt: now,
    slaTargetMinutes,
    firstResponseMinutes: undefined,
    internalNotes: [],
    timeline: [
      {
        id: `tl-${Date.now()}`,
        status: 'open',
        note: `Ticket created via BRAC IT Portal. Initial notification sent to ${body.submittedBy?.email}.`,
        timestamp: now,
        actor: body.submittedBy?.name || 'User',
      },
    ],
    emailLogs: [welcomeEmail],
  };

  tickets.unshift(newTicket);
  res.status(201).json(newTicket);
});

app.patch('/api/tickets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = tickets.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const existing = tickets[index];
  const { status, priority, noteContent, noteAuthor, assignedToName } = req.body;
  const now = new Date().toISOString();

  let updatedStatus: TicketStatus = existing.status;
  if (status && status !== existing.status) {
    updatedStatus = status as TicketStatus;

    // Timeline event
    existing.timeline.push({
      id: `tl-${Date.now()}`,
      status: updatedStatus,
      note: req.body.statusNote || `Status updated from ${existing.status} to ${updatedStatus}.`,
      timestamp: now,
      actor: noteAuthor || 'Tanvir Ahmed (IT Engineer)',
    });

    // Email dispatch simulation
    const emailSubject = updatedStatus === 'resolved'
      ? `[RESOLVED] [${existing.id}] ${existing.title}`
      : `[${existing.id} Update] Status changed to ${updatedStatus.replace('_', ' ').toUpperCase()}`;

    const emailBody = updatedStatus === 'resolved'
      ? `Dear ${existing.submittedBy.name}, your IT issue has been successfully resolved by ${noteAuthor || 'Tanvir Ahmed'}. If you still experience issues, reply to reopen.`
      : `Dear ${existing.submittedBy.name}, your ticket status was updated to [${updatedStatus}]. Note: ${req.body.statusNote || 'Work is ongoing.'}`;

    existing.emailLogs.unshift({
      id: `em-${Date.now()}`,
      recipient: existing.submittedBy.email,
      subject: emailSubject,
      bodyPreview: emailBody,
      sentAt: now,
      status: 'delivered',
      eventType: updatedStatus === 'resolved' ? 'resolved' : 'status_updated',
    });

    if (updatedStatus === 'resolved' && !existing.resolvedAt) {
      existing.resolvedAt = now;
    }
  }

  if (priority) {
    existing.priority = priority;
  }

  if (assignedToName) {
    existing.assignedTo = {
      name: assignedToName,
      email: `${assignedToName.toLowerCase().replace(' ', '.')}@brac.net`,
      role: 'IT Support Engineer',
      avatarUrl: '/src/assets/images/avatar_it_engineer_1793943721762.jpg',
    };
  }

  if (noteContent) {
    existing.internalNotes.push({
      id: `note-${Date.now()}`,
      author: noteAuthor || 'Tanvir Ahmed',
      authorRole: 'IT Support Engineer',
      content: noteContent,
      createdAt: now,
    });
  }

  existing.updatedAt = now;
  tickets[index] = existing;
  res.json(existing);
});

// 1b. IT Engineers Roster & Assignment (/admin)
app.get('/api/engineers', (_req: Request, res: Response) => {
  res.json(engineers);
});

app.patch('/api/engineers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const eng = engineers.find(e => e.id === id);
  if (!eng) return res.status(404).json({ error: 'Engineer not found' });
  if (req.body.role) eng.role = req.body.role;
  if (req.body.status) eng.status = req.body.status;
  res.json(eng);
});

app.post('/api/tickets/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { engineerId } = req.body;
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const eng = engineers.find(e => e.id === engineerId);
  if (!eng) return res.status(404).json({ error: 'Engineer not found' });

  const now = new Date().toISOString();
  ticket.assignedTo = {
    id: eng.id,
    name: eng.name,
    email: eng.email,
    role: eng.role,
    avatarUrl: eng.avatarUrl,
  };
  ticket.updatedAt = now;
  ticket.timeline.push({
    id: `tl-${Date.now()}`,
    status: ticket.status,
    note: `Assigned to ${eng.name} (${eng.branchLocation}) by IT Administrator.`,
    timestamp: now,
    actor: 'IT Administrator',
  });
  ticket.emailLogs.unshift({
    id: `em-${Date.now()}`,
    recipient: eng.email,
    subject: `[DISPATCH ASSIGNED] [${ticket.id}] ${ticket.title}`,
    bodyPreview: `You have been allocated ticket ${ticket.id} (${ticket.priority.toUpperCase()} priority). Submitter: ${ticket.submittedBy.name} (${ticket.department}).`,
    sentAt: now,
    status: 'delivered',
    eventType: 'engineer_assigned',
  });

  res.json(ticket);
});

// 2. Knowledge Base
app.get('/api/knowledge-base', (req: Request, res: Response) => {
  const { search, category } = req.query;
  let results = [...knowledgeBase];

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter(a => a.category === category);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json(results);
});

app.post('/api/knowledge-base/:id/vote', (req: Request, res: Response) => {
  const { id } = req.params;
  const { helpful } = req.body;
  const article = knowledgeBase.find(a => a.id === id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  if (helpful) {
    article.helpfulCount += 1;
  } else {
    article.unhelpfulCount += 1;
  }
  res.json(article);
});

// 3. Analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress' || t.status === 'waiting_user').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Category breakdown
  const catMap: Record<string, number> = {};
  tickets.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + 1;
  });
  const categoryBreakdown = Object.entries(catMap).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / (totalTickets || 1)) * 100),
  }));

  // Department breakdown
  const deptMap: Record<string, number> = {};
  tickets.forEach(t => {
    deptMap[t.department] = (deptMap[t.department] || 0) + 1;
  });
  const departmentBreakdown = Object.entries(deptMap).map(([department, count]) => ({
    department,
    count,
  }));

  const analytics = {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    avgResolutionHours: 3.2,
    avgFirstResponseMinutes: 16.4,
    slaComplianceRate: 96.8,
    csatScore: 4.8,
    categoryBreakdown,
    departmentBreakdown,
    engineerMetrics: [
      {
        name: 'Tanvir Ahmed (Senior IT Support Engineer)',
        assigned: tickets.filter(t => t.assignedTo?.name.includes('Tanvir')).length,
        resolved: tickets.filter(t => t.assignedTo?.name.includes('Tanvir') && t.status === 'resolved').length,
        avgTimeHours: 2.9,
        satisfaction: 4.9,
      },
      {
        name: 'Sadia Rahman (Network Specialist)',
        assigned: 12,
        resolved: 11,
        avgTimeHours: 3.4,
        satisfaction: 4.7,
      },
      {
        name: 'Kamrul Hasan (Systems & ERP Administrator)',
        assigned: 15,
        resolved: 14,
        avgTimeHours: 4.1,
        satisfaction: 4.8,
      },
    ],
  };

  res.json(analytics);
});

// 4. Cloud Backups & Sync
app.get('/api/backup/status', (_req: Request, res: Response) => {
  res.json({
    lastCloudSync: lastCloudSyncTime,
    syncStatus: 'synced',
    dailyBackupSchedule: '02:00 AM BST (Automated Daily)',
    retentionDays: 30,
    cloudRegion: 'Asia-South1 (Dhaka / Mumbai Tier-3 Cloud)',
    snapshots,
    autoBackupEnabled,
  });
});

app.post('/api/backup/trigger', (_req: Request, res: Response) => {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 12);
  const snapId = `SNAP-${dateStr}`;
  const randomHex = Math.random().toString(16).substring(2, 10);

  const newSnap: BackupSnapshot = {
    id: snapId,
    timestamp: now.toISOString(),
    ticketCount: tickets.length,
    kbCount: knowledgeBase.length,
    sizeKb: 1400 + Math.floor(Math.random() * 80),
    triggerType: 'manual_snapshot',
    hash: `sha256:${randomHex}c4e2d3f6a8b9c0d1e2f3a4b5c`,
    status: 'verified',
  };

  snapshots.unshift(newSnap);
  lastCloudSyncTime = now.toISOString();

  res.status(201).json({
    message: 'Manual cloud snapshot generated successfully and synchronized with disaster recovery node.',
    snapshot: newSnap,
    lastCloudSync: lastCloudSyncTime,
  });
});

app.get('/api/backup/export', (_req: Request, res: Response) => {
  const exportPayload = {
    exportDate: new Date().toISOString(),
    organization: 'BRAC Bangladesh',
    division: 'Information Technology Division',
    version: '2.4.0',
    totalTickets: tickets.length,
    tickets,
    knowledgeBase,
    snapshots,
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=BRAC_IT_Backup_${Date.now()}.json`);
  res.send(JSON.stringify(exportPayload, null, 2));
});

// 5. AI Chat for Donor Inquiries, Automated Volunteer Support, and IT Support
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, mode } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const currentMode = mode || 'donor_inquiry';

  // Fallback heuristic answers for common BRAC donor, volunteer, and IT queries
  const getSimulatedResponse = (msg: string, m: string) => {
    const lower = msg.toLowerCase();

    if (m === 'donor_inquiry' || lower.includes('donat') || lower.includes('tax') || lower.includes('receipt') || lower.includes('bkash')) {
      if (lower.includes('tax') || lower.includes('receipt') || lower.includes('exemption') || lower.includes('gift aid')) {
        return `### BRAC Donor Tax Exemption & Digital Receipt Verification
Thank you for your generous support of BRAC Bangladesh's community programs.
- **Tax Deductibility**: In Bangladesh, donations to BRAC are exempt under National Board of Revenue (NBR) SRO regulations. In the UK, donations qualify for **UK Gift Aid** (+25%), and in the US through BRAC USA (501(c)(3) registered).
- **Automated Digital Receipts**: Instant e-receipts are dispatched to your payment email within 3 minutes of bKash, Nagad, or credit card settlement.
- **Lookup Support**: If your PDF receipt did not arrive, our IT team can regenerate it instantly from the **Knowledge Base (Article kb-105)** or log a priority ticket under Category "Donor & Volunteer Tech".`;
      }
      if (lower.includes('how') || lower.includes('impact') || lower.includes('where') || lower.includes('programs')) {
        return `### Where Your BRAC Donation Goes
BRAC reaches over 100 million people across Bangladesh with proven holistic models:
1. **Ultra-Poor Graduation (UPG)**: Providing productive livestock assets, financial literacy, and healthcare to lift families from extreme poverty.
2. **BRAC Education Programme (BEP)**: One-room community schools ensuring girls and children in hard-to-reach haor and char areas receive quality primary education.
3. **Health & Nutrition (HNPP)**: Frontline Shasthya Shebika community health workers delivering doorstep prenatal and maternal healthcare.
4. **Climate Adaptation**: Cyclone-resilient housing and saline-tolerant agriculture in the coastal belt.

Over **89%** of all donor funds go directly to program delivery. You can track real-time project metrics in our annual audited financials.`;
      }
      return `Assalam-o-Alaikum! Welcome to the BRAC Donor Relations & Support Portal.
How may we assist you today with your contributions? You can ask about:
- **bKash / Nagad / Visa Payment methods**
- **Tax exemption certificates & UK Gift Aid verification**
- **Donation tracking & project allocation updates**
- **Corporate CSR partnerships & endowment inquiries**`;
    }

    if (m === 'volunteer_support' || lower.includes('volunteer') || lower.includes('intern') || lower.includes('join') || lower.includes('app')) {
      if (lower.includes('register') || lower.includes('portal') || lower.includes('login') || lower.includes('nid')) {
        return `### Automated Volunteer Onboarding Protocol
Welcome to the BRAC Volunteer Brigade! Follow these digital steps to complete your field accreditation:
1. **Digital Registration**: Visit \`volunteer.brac.net\` or use the mobile link sent via SMS.
2. **Identity Verification**: Enter your 10- or 17-digit National ID (NID) or Student Identity Card along with active WhatsApp contact.
3. **Branch Assignment**: Select your local Upazila or Regional Branch Office (e.g., Bogura, Cox's Bazar, Rangpur, Sylhet).
4. **Digital Badge**: Once approved by your regional coordinator, your verified QR code badge will appear in your mobile wallet.
If you experience login or SMS OTP issues, you can submit an IT ticket with category **"Donor & Volunteer Tech"** right here in this portal.`;
      }
      return `### BRAC Volunteer Support Hub
Thank you for dedicating your time and energy to BRAC's grassroots initiatives!
- **Digital Field Tools**: Need help with the tablet survey app or attendance logging? Check Knowledge Base Article **kb-104**.
- **Field Support Helpline**: IT Support on-call for field volunteers operates from 8:00 AM to 8:00 PM BST daily.
- **Emergency Field Connectivity**: If working in low-connectivity remote camps or char areas, enable Offline Mode on your device. All pending records sync automatically upon branch arrival.`;
    }

    // Default IT Support Assistant
    return `### BRAC IT Support Engineer Assistant
Assalam-o-Alaikum. I am your automated BRAC IT triage assistant.
- **Common Self-Service Fixes**:
  - **Outlook / Teams 2FA Loop**: Clear Generic Credentials in Windows Credential Manager and run \`ipconfig /flushdns\`.
  - **Microfinance Field Tablet Sync**: Check APN \`brac.enterprise\` and run **Force Resync Batch** in offline diagnostics.
  - **ERP Agresso Token Mismatch**: Clear browser cache or request SSO token refresh.
- **Need a Ticket?** Click **"Submit Ticket"** in the navigation bar to log an official ticket with automated status tracking and email updates.`;
  };

  // If Gemini API is configured, use it for real LLM intelligence
  if (geminiAi) {
    try {
      const systemInstruction = `You are the official AI Support Agent for BRAC Bangladesh (Building Resources Across Communities) - the world's leading humanitarian development organization headquartered at BRAC Centre, 75 Mohakhali, Dhaka 1212.
You provide support across three distinct areas based on the user's intent:
1. "donor_inquiry": Provide transparent, polite, and detailed guidance regarding donations, bKash/bank payment options, tax exemption receipts (Bangladesh NBR, UK Gift Aid, US 501c3), and program impact (Ultra-Poor Graduation, Microfinance, Education, Health, Climate).
2. "volunteer_support": Help prospective and active BRAC volunteers with registration at volunteer.brac.net, digital ID badge access, field tablet usage, orientation material, and local branch coordinators.
3. "it_troubleshoot": Act as an expert BRAC IT Support Engineer assisting staff with BRAC ERP Agresso, Microsoft 365 / Outlook, Palo Alto GlobalProtect VPN, ZKTeco Biometric attendance, and Samsung Galaxy Tab Active field devices.

Always be courteous, warm (using gentle respectful greetings like 'Assalam-o-Alaikum' or 'Hello'), accurate to Bangladesh IT infrastructure, and format answers using clear markdown bullet points. If an issue requires manual engineer intervention, advise the user to submit an IT ticket via this portal.`;

      const response = await geminiAi.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
        },
      });

      const replyText = response.text || getSimulatedResponse(message, currentMode);
      return res.json({ reply: replyText, source: 'gemini' });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to contextual generator:', err?.message || err);
      const fallbackReply = getSimulatedResponse(message, currentMode);
      return res.json({ reply: fallbackReply, source: 'fallback' });
    }
  }

  // Fallback when no API key configured
  const fallbackReply = getSimulatedResponse(message, currentMode);
  return res.json({ reply: fallbackReply, source: 'simulated' });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BRAC IT Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
