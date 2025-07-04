import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Client, 
  BusinessInfo, 
  AIStrategy, 
  Campaign, 
  WeeklyReport, 
  AdminUser,
  DashboardStats,
  ClientDashboardData,
  PaginationOptions,
  FilterOptions,
  APIResponse
} from '../types';

// Client Operations
export class ClientService {
  private static collection = 'clients';

  static async createClient(uid: string, businessInfo: BusinessInfo): Promise<APIResponse<Client>> {
    try {
      const clientData: Omit<Client, 'id'> = {
        uid,
        businessInfo,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        onboardingCompleted: true,
        currentCampaigns: [],
        totalSpent: 0
      };

      const docRef = await addDoc(collection(db, this.collection), clientData);
      const newClient = { ...clientData, id: docRef.id } as Client;

      return { success: true, data: newClient };
    } catch (error: any) {
      console.error('Error creating client:', error);
      return { success: false, error: error.message };
    }
  }

  static async getClient(clientId: string): Promise<APIResponse<Client>> {
    try {
      const docRef = doc(db, this.collection, clientId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Client not found' };
      }

      const client = { id: docSnap.id, ...docSnap.data() } as Client;
      return { success: true, data: client };
    } catch (error: any) {
      console.error('Error getting client:', error);
      return { success: false, error: error.message };
    }
  }

  static async getClientByUid(uid: string): Promise<APIResponse<Client>> {
    try {
      const q = query(
        collection(db, this.collection),
        where('uid', '==', uid),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Client not found' };
      }

      const doc = querySnapshot.docs[0];
      const client = { id: doc.id, ...doc.data() } as Client;
      return { success: true, data: client };
    } catch (error: any) {
      console.error('Error getting client by UID:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateClient(clientId: string, updates: Partial<Client>): Promise<APIResponse<void>> {
    try {
      const docRef = doc(db, this.collection, clientId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating client:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAllClients(options?: PaginationOptions & FilterOptions): Promise<APIResponse<Client[]>> {
    try {
      let q = query(collection(db, this.collection));

      // Apply filters
      if (options?.status?.length) {
        q = query(q, where('status', 'in', options.status));
      }

      if (options?.budget) {
        if (options.budget.min) {
          q = query(q, where('businessInfo.budget', '>=', options.budget.min));
        }
        if (options.budget.max) {
          q = query(q, where('businessInfo.budget', '<=', options.budget.max));
        }
      }

      // Apply sorting
      const sortField = options?.sortBy || 'createdAt';
      const sortOrder = options?.sortOrder || 'desc';
      q = query(q, orderBy(sortField, sortOrder));

      // Apply pagination
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const clients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];

      return { success: true, data: clients };
    } catch (error: any) {
      console.error('Error getting all clients:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteClient(clientId: string): Promise<APIResponse<void>> {
    try {
      await deleteDoc(doc(db, this.collection, clientId));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting client:', error);
      return { success: false, error: error.message };
    }
  }
}

// Strategy Operations
export class StrategyService {
  private static collection = 'strategies';

  static async createStrategy(strategy: Omit<AIStrategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<AIStrategy>> {
    try {
      const strategyData = {
        ...strategy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collection), strategyData);
      const newStrategy = { ...strategyData, id: docRef.id } as AIStrategy;

      return { success: true, data: newStrategy };
    } catch (error: any) {
      console.error('Error creating strategy:', error);
      return { success: false, error: error.message };
    }
  }

  static async getStrategy(strategyId: string): Promise<APIResponse<AIStrategy>> {
    try {
      const docRef = doc(db, this.collection, strategyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Strategy not found' };
      }

      const strategy = { id: docSnap.id, ...docSnap.data() } as AIStrategy;
      return { success: true, data: strategy };
    } catch (error: any) {
      console.error('Error getting strategy:', error);
      return { success: false, error: error.message };
    }
  }

  static async getStrategiesByClient(clientId: string): Promise<APIResponse<AIStrategy[]>> {
    try {
      const q = query(
        collection(db, this.collection),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const strategies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIStrategy[];

      return { success: true, data: strategies };
    } catch (error: any) {
      console.error('Error getting strategies by client:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateStrategy(strategyId: string, updates: Partial<AIStrategy>): Promise<APIResponse<void>> {
    try {
      const docRef = doc(db, this.collection, strategyId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating strategy:', error);
      return { success: false, error: error.message };
    }
  }

  static async approveStrategy(strategyId: string, approvedBy: string): Promise<APIResponse<void>> {
    try {
      const docRef = doc(db, this.collection, strategyId);
      await updateDoc(docRef, {
        status: 'approved',
        approvedBy,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error approving strategy:', error);
      return { success: false, error: error.message };
    }
  }

  static async getPendingStrategies(): Promise<APIResponse<AIStrategy[]>> {
    try {
      const q = query(
        collection(db, this.collection),
        where('status', '==', 'pending_approval'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const strategies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIStrategy[];

      return { success: true, data: strategies };
    } catch (error: any) {
      console.error('Error getting pending strategies:', error);
      return { success: false, error: error.message };
    }
  }
}

// Campaign Operations
export class CampaignService {
  private static collection = 'campaigns';

  static async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<Campaign>> {
    try {
      const campaignData = {
        ...campaign,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collection), campaignData);
      const newCampaign = { ...campaignData, id: docRef.id } as Campaign;

      return { success: true, data: newCampaign };
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      return { success: false, error: error.message };
    }
  }

  static async getCampaign(campaignId: string): Promise<APIResponse<Campaign>> {
    try {
      const docRef = doc(db, this.collection, campaignId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Campaign not found' };
      }

      const campaign = { id: docSnap.id, ...docSnap.data() } as Campaign;
      return { success: true, data: campaign };
    } catch (error: any) {
      console.error('Error getting campaign:', error);
      return { success: false, error: error.message };
    }
  }

  static async getCampaignsByClient(clientId: string): Promise<APIResponse<Campaign[]>> {
    try {
      const q = query(
        collection(db, this.collection),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const campaigns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];

      return { success: true, data: campaigns };
    } catch (error: any) {
      console.error('Error getting campaigns by client:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<APIResponse<void>> {
    try {
      const docRef = doc(db, this.collection, campaignId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAllCampaigns(options?: PaginationOptions & FilterOptions): Promise<APIResponse<Campaign[]>> {
    try {
      let q = query(collection(db, this.collection));

      // Apply filters
      if (options?.status?.length) {
        q = query(q, where('status', 'in', options.status));
      }

      if (options?.platform?.length) {
        q = query(q, where('platform', 'in', options.platform));
      }

      // Apply sorting
      const sortField = options?.sortBy || 'createdAt';
      const sortOrder = options?.sortOrder || 'desc';
      q = query(q, orderBy(sortField, sortOrder));

      // Apply pagination
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const campaigns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];

      return { success: true, data: campaigns };
    } catch (error: any) {
      console.error('Error getting all campaigns:', error);
      return { success: false, error: error.message };
    }
  }
}

// Report Operations
export class ReportService {
  private static collection = 'reports';

  static async createWeeklyReport(report: Omit<WeeklyReport, 'id' | 'createdAt'>): Promise<APIResponse<WeeklyReport>> {
    try {
      const reportData = {
        ...report,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collection), reportData);
      const newReport = { ...reportData, id: docRef.id } as WeeklyReport;

      return { success: true, data: newReport };
    } catch (error: any) {
      console.error('Error creating weekly report:', error);
      return { success: false, error: error.message };
    }
  }

  static async getReportsByClient(clientId: string, limitCount = 10): Promise<APIResponse<WeeklyReport[]>> {
    try {
      const q = query(
        collection(db, this.collection),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WeeklyReport[];

      return { success: true, data: reports };
    } catch (error: any) {
      console.error('Error getting reports by client:', error);
      return { success: false, error: error.message };
    }
  }

  static async markReportAsSent(reportId: string): Promise<APIResponse<void>> {
    try {
      const docRef = doc(db, this.collection, reportId);
      await updateDoc(docRef, {
        sent: true,
        sentAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error marking report as sent:', error);
      return { success: false, error: error.message };
    }
  }
}

// Dashboard Operations
export class DashboardService {
  static async getAdminDashboardStats(): Promise<APIResponse<DashboardStats>> {
    try {
      // Get all clients
      const clientsResult = await ClientService.getAllClients();
      if (!clientsResult.success) {
        throw new Error(clientsResult.error);
      }
      const clients = clientsResult.data || [];

      // Get all campaigns
      const campaignsResult = await CampaignService.getAllCampaigns();
      if (!campaignsResult.success) {
        throw new Error(campaignsResult.error);
      }
      const campaigns = campaignsResult.data || [];

      // Get pending strategies
      const pendingStrategiesResult = await StrategyService.getPendingStrategies();
      if (!pendingStrategiesResult.success) {
        throw new Error(pendingStrategiesResult.error);
      }
      const pendingStrategies = pendingStrategiesResult.data || [];

      // Calculate stats
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      const totalCampaigns = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      
      const totalSpend = campaigns.reduce((sum, campaign) => sum + (campaign.budget?.spent || 0), 0);
      const totalRevenue = totalSpend * 0.1; // Assuming 10% commission
      
      const roasValues = campaigns
        .filter(c => c.metrics?.roas && c.metrics.roas > 0)
        .map(c => c.metrics.roas);
      const averageROAS = roasValues.length > 0 
        ? roasValues.reduce((sum, roas) => sum + roas, 0) / roasValues.length 
        : 0;

      const stats: DashboardStats = {
        totalClients,
        activeClients,
        totalCampaigns,
        activeCampaigns,
        totalSpend,
        totalRevenue,
        averageROAS,
        pendingApprovals: pendingStrategies.length
      };

      return { success: true, data: stats };
    } catch (error: any) {
      console.error('Error getting admin dashboard stats:', error);
      return { success: false, error: error.message };
    }
  }

  static async getClientDashboardData(clientId: string): Promise<APIResponse<ClientDashboardData>> {
    try {
      // Get client details
      const clientResult = await ClientService.getClient(clientId);
      if (!clientResult.success) {
        throw new Error(clientResult.error);
      }
      const client = clientResult.data!;

      // Get active campaigns
      const campaignsResult = await CampaignService.getCampaignsByClient(clientId);
      if (!campaignsResult.success) {
        throw new Error(campaignsResult.error);
      }
      const allCampaigns = campaignsResult.data || [];
      const activeCampaigns = allCampaigns.filter(c => c.status === 'active');

      // Get recent reports
      const reportsResult = await ReportService.getReportsByClient(clientId, 5);
      if (!reportsResult.success) {
        throw new Error(reportsResult.error);
      }
      const recentReports = reportsResult.data || [];

      // Calculate metrics
      const totalSpend = allCampaigns.reduce((sum, campaign) => sum + (campaign.budget?.spent || 0), 0);
      const totalImpressions = allCampaigns.reduce((sum, campaign) => sum + (campaign.metrics?.impressions || 0), 0);
      const totalClicks = allCampaigns.reduce((sum, campaign) => sum + (campaign.metrics?.clicks || 0), 0);
      const totalConversions = allCampaigns.reduce((sum, campaign) => sum + (campaign.metrics?.conversions || 0), 0);
      
      const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
      
      const roasValues = allCampaigns
        .filter(c => c.metrics?.roas && c.metrics.roas > 0)
        .map(c => c.metrics.roas);
      const overallROAS = roasValues.length > 0 
        ? roasValues.reduce((sum, roas) => sum + roas, 0) / roasValues.length 
        : 0;

      const metrics = {
        totalSpend,
        totalImpressions,
        totalClicks,
        averageCTR,
        averageCPC,
        totalConversions,
        overallROAS
      };

      // Get upcoming milestones from strategies
      const strategiesResult = await StrategyService.getStrategiesByClient(clientId);
      const strategies = strategiesResult.success ? strategiesResult.data || [] : [];
      const upcomingMilestones = strategies
        .flatMap(s => s.timeline?.milestones || [])
        .filter(m => !m.completed)
        .sort((a, b) => a.date.seconds - b.date.seconds)
        .slice(0, 5);

      const dashboardData: ClientDashboardData = {
        client,
        activeCampaigns,
        metrics,
        recentReports,
        upcomingMilestones
      };

      return { success: true, data: dashboardData };
    } catch (error: any) {
      console.error('Error getting client dashboard data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Real-time subscriptions
export class SubscriptionService {
  static subscribeToClientCampaigns(clientId: string, callback: (campaigns: Campaign[]) => void) {
    const q = query(
      collection(db, 'campaigns'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const campaigns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      callback(campaigns);
    });
  }

  static subscribeToPendingStrategies(callback: (strategies: AIStrategy[]) => void) {
    const q = query(
      collection(db, 'strategies'),
      where('status', '==', 'pending_approval'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const strategies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIStrategy[];
      callback(strategies);
    });
  }
}

// Simple Strategy Storage (for text-based strategies)
export class SimpleStrategyService {
  private static collection = 'simple_strategies';

  static async createStrategy(data: {
    clientId: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    metadata?: any;
  }): Promise<APIResponse<any>> {
    try {
      console.log('💾 Creating strategy with data:', data);
      const strategyData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 Strategy data to save:', strategyData);
      const docRef = await addDoc(collection(db, this.collection), strategyData);
      console.log('✅ Document created with ID:', docRef.id);
      
      const newStrategy = { ...strategyData, id: docRef.id };

      return { success: true, data: newStrategy };
    } catch (error: any) {
      console.error('❌ Error creating simple strategy:', error);
      return { success: false, error: error.message };
    }
  }

  static async getStrategiesByClient(clientId: string): Promise<APIResponse<any[]>> {
    try {
      console.log('🔍 Querying strategies for clientId:', clientId);
      
      // Simple query without ordering (to avoid index requirement)
      const q = query(
        collection(db, this.collection),
        where('clientId', '==', clientId)
      );

      const querySnapshot = await getDocs(q);
      console.log('📊 Query snapshot size:', querySnapshot.size);
      
      const strategies = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Document data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      });

      // Sort in JavaScript instead of Firestore
      strategies.sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      console.log('✅ Retrieved and sorted strategies:', strategies);
      return { success: true, data: strategies };
    } catch (error: any) {
      console.error('❌ Error getting strategies by client:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateStrategyStatus(strategyId: string, status: 'pending' | 'approved' | 'rejected'): Promise<APIResponse<void>> {
    try {
      const docRef = doc(db, this.collection, strategyId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating strategy status:', error);
      return { success: false, error: error.message };
    }
  }
} 