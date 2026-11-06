export type UserRole = 'admin' | 'engineer' | 'user' | 'donor_volunteer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  staffPin: string;
  role: UserRole;
  department: string;
  branchLocation: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'brac_sso';
}

export interface EngineerProfile {
  id: string;
  name: string;
  email: string;
  role: 'Senior IT Support Engineer' | 'IT Support Engineer' | 'Lead Systems Specialist' | 'Regional Field Engineer';
  department: string;
  branchLocation: string;
  specialization: string;
  phone: string;
  status: 'active' | 'on_duty' | 'on_leave';
  assignedTicketsCount: number;
  avatarUrl?: string;
}

export type TicketCategory =
  | 'hardware'
  | 'network_wifi'
  | 'erp_agresso'
  | 'm365_email'
  | 'biometric_hr'
  | 'field_tablet'
  | 'vpn_remote'
  | 'donor_volunteer_tech';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';

export interface InternalNote {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface TicketTimelineEntry {
  id: string;
  status: TicketStatus;
  note: string;
  timestamp: string;
  actor: string;
}

export interface EmailDispatchLog {
  id: string;
  recipient: string;
  subject: string;
  bodyPreview: string;
  sentAt: string;
  status: 'delivered' | 'simulated';
  eventType: 'ticket_created' | 'status_updated' | 'resolved' | 'engineer_assigned';
}

export interface Ticket {
  id: string; // e.g. BRAC-IT-8492
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  department: string;
  branchLocation: string;
  submittedBy: {
    name: string;
    email: string;
    staffPin?: string;
    phone: string;
  };
  assignedTo?: {
    id?: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaTargetMinutes: number;
  firstResponseMinutes?: number;
  internalNotes: InternalNote[];
  timeline: TicketTimelineEntry[];
  emailLogs: EmailDispatchLog[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: TicketCategory;
  departmentScope: string;
  excerpt: string;
  content: string;
  steps: string[];
  quickFixCommand?: string;
  helpfulCount: number;
  unhelpfulCount: number;
  tags: string[];
  updatedAt: string;
  readTimeMinutes: number;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  ticketCount: number;
  kbCount: number;
  sizeKb: number;
  triggerType: 'automated_daily' | 'manual_snapshot';
  hash: string;
  status: 'healthy' | 'verified';
}

export interface BackupStatus {
  lastCloudSync: string;
  syncStatus: 'synced' | 'syncing' | 'idle';
  dailyBackupSchedule: string;
  retentionDays: number;
  cloudRegion: string;
  snapshots: BackupSnapshot[];
  autoBackupEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode: 'donor_inquiry' | 'volunteer_support' | 'it_troubleshoot';
  suggestedAction?: {
    label: string;
    actionType: 'create_ticket' | 'open_kb' | 'donate_info';
    payload?: string;
  };
}

export interface AnalyticsSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResolutionHours: number;
  avgFirstResponseMinutes: number;
  slaComplianceRate: number;
  csatScore: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  departmentBreakdown: { department: string; count: number }[];
  engineerMetrics: {
    name: string;
    assigned: number;
    resolved: number;
    avgTimeHours: number;
    satisfaction: number;
  }[];
}
