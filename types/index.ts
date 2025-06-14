import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// User Types
export interface AdzigaUser extends User {
  role: 'client' | 'admin';
  isAdmin?: boolean;
}

// Business/Client Types
export interface BusinessInfo {
  businessName: string;
  businessType: string;
  industry: string;
  city: string;
  budget: number;
  preferredPlatforms: Platform[];
  marketingGoal: MarketingGoal;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
}

export interface Client {
  id: string;
  uid: string;
  businessInfo: BusinessInfo;
  status: ClientStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted: boolean;
  currentCampaigns?: string[];
  totalSpent?: number;
  lastActive?: Timestamp;
}

export type ClientStatus = 'pending' | 'approved' | 'active' | 'paused' | 'completed';

// Platform Types
export type Platform = 'meta' | 'google' | 'whatsapp' | 'instagram' | 'facebook';

export type MarketingGoal = 
  | 'brand_awareness'
  | 'traffic'
  | 'engagement'
  | 'leads'
  | 'conversions'
  | 'sales'
  | 'app_installs'
  | 'video_views';

// AI Strategy Types
export interface AIStrategy {
  id: string;
  clientId: string;
  platforms: PlatformStrategy[];
  budgetAllocation: BudgetAllocation;
  targetAudience: TargetAudience;
  adContent: AdContent[];
  timeline: CampaignTimeline;
  kpis: string[];
  status: StrategyStatus;
  confidence: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
}

export interface PlatformStrategy {
  platform: Platform;
  objective: string;
  budgetPercentage: number;
  duration: number;
  targeting: PlatformTargeting;
  creative: CreativeRequirements;
}

export interface BudgetAllocation {
  totalBudget: number;
  platforms: {
    [key in Platform]?: {
      amount: number;
      percentage: number;
      dailyBudget: number;
    };
  };
  contingency: number;
}

export interface TargetAudience {
  demographics: {
    ageRange: [number, number];
    gender: 'all' | 'male' | 'female';
    interests: string[];
    behaviors: string[];
  };
  location: {
    cities: string[];
    radius: number;
    excludedAreas?: string[];
  };
  customAudiences?: string[];
}

export interface AdContent {
  platform: Platform;
  type: 'image' | 'video' | 'carousel' | 'story' | 'text';
  headline: string;
  description: string;
  callToAction: string;
  visuals?: {
    images?: string[];
    videos?: string[];
    dimensions: string;
  };
  copy: {
    primary: string;
    secondary?: string;
    hashtags?: string[];
  };
}

export interface CampaignTimeline {
  startDate: Timestamp;
  endDate: Timestamp;
  milestones: Milestone[];
  reviewPoints: Timestamp[];
}

export interface Milestone {
  date: Timestamp;
  description: string;
  completed: boolean;
}

export type StrategyStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled';

// Campaign Types
export interface Campaign {
  id: string;
  clientId: string;
  strategyId: string;
  platform: Platform;
  campaignId: string; // Platform-specific campaign ID
  name: string;
  objective: string;
  status: CampaignStatus;
  budget: {
    total: number;
    daily: number;
    spent: number;
    remaining: number;
  };
  targeting: PlatformTargeting;
  adSets: AdSet[];
  metrics: CampaignMetrics;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CampaignStatus = 
  | 'draft'
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error';

export interface AdSet {
  id: string;
  name: string;
  targeting: PlatformTargeting;
  budget: number;
  ads: Ad[];
  metrics: AdSetMetrics;
}

export interface Ad {
  id: string;
  name: string;
  creative: AdCreative;
  metrics: AdMetrics;
  status: string;
}

export interface AdCreative {
  headline: string;
  text: string;
  description?: string;
  callToAction: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
}

// Platform-specific targeting
export interface PlatformTargeting {
  locations: string[];
  ageMin: number;
  ageMax: number;
  genders: string[];
  interests: string[];
  behaviors: string[];
  customAudiences?: string[];
  excludedAudiences?: string[];
}

export interface CreativeRequirements {
  formats: string[];
  dimensions: string[];
  duration?: number;
  fileSize?: number;
  aspectRatio?: string;
}

// Metrics Types
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  conversionRate: number;
  reach: number;
  frequency: number;
  spend: number;
  roas: number;
  lastUpdated: Timestamp;
}

export interface AdSetMetrics extends CampaignMetrics {
  qualityScore?: number;
  relevanceScore?: number;
}

export interface AdMetrics extends CampaignMetrics {
  videoViews?: number;
  videoWatchTime?: number;
  engagement?: number;
  shares?: number;
  comments?: number;
  likes?: number;
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: AdminPermission[];
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export type AdminPermission = 
  | 'view_clients'
  | 'approve_strategies'
  | 'manage_campaigns'
  | 'view_analytics'
  | 'manage_users'
  | 'system_settings';

// Report Types
export interface WeeklyReport {
  id: string;
  clientId: string;
  weekStart: Timestamp;
  weekEnd: Timestamp;
  campaigns: CampaignSummary[];
  totalMetrics: ReportMetrics;
  insights: string[];
  recommendations: string[];
  createdAt: Timestamp;
  sent: boolean;
  sentAt?: Timestamp;
}

export interface CampaignSummary {
  campaignId: string;
  name: string;
  platform: Platform;
  metrics: CampaignMetrics;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  notes?: string;
}

export interface ReportMetrics {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  averageCPC: number;
  totalConversions: number;
  overallROAS: number;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Meta Ads API Types
export interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  account_status: number;
  amount_spent: string;
  balance: string;
}

export interface MetaCampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget_rebalance_flag: boolean;
  lifetime_budget?: string;
  daily_budget?: string;
  start_time?: string;
  stop_time?: string;
}

// WhatsApp API Types
export interface WhatsAppTemplate {
  name: string;
  language: string;
  status: string;
  category: string;
  components: WhatsAppComponent[];
}

export interface WhatsAppComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  parameters?: WhatsAppParameter[];
  buttons?: WhatsAppButton[];
}

export interface WhatsAppParameter {
  type: 'text' | 'image' | 'document';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename: string };
}

export interface WhatsAppButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

// Form Types
export interface OnboardingFormData {
  businessName: string;
  businessType: string;
  industry: string;
  city: string;
  budget: number;
  preferredPlatforms: Platform[];
  marketingGoal: MarketingGoal;
  description?: string;
  website?: string;
  phone?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

// Utility Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  status?: string[];
  platform?: Platform[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  budget?: {
    min: number;
    max: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  averageROAS: number;
  pendingApprovals: number;
}

export interface ClientDashboardData {
  client: Client;
  activeCampaigns: Campaign[];
  metrics: ReportMetrics;
  recentReports: WeeklyReport[];
  upcomingMilestones: Milestone[];
} 