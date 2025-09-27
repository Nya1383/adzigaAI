import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/router';
import Loading from '../components/ui/Loading';
import { AdminService } from '../services/firestore';

interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalStrategies: number;
  totalCampaigns: number;
  activeUsers: number;
}

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  isAdmin: boolean;
  createdAt: any;
  lastLogin: any;
}

interface ClientData {
  id: string;
  businessInfo: {
    businessName: string;
    businessType: string;
    industry: string;
    city: string;
    budget: number;
    preferredPlatforms: string[];
    marketingGoal: string;
  };
  uid: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('client-campaigns');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, authLoading, router]);

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      if (user && isAdmin) {
        setLoading(true);
        try {
          // Load dashboard stats
          const statsResult = await AdminService.getDashboardStats();
          if (statsResult.success && statsResult.data) {
            setStats(statsResult.data);
          }

          // Load all users
          const usersResult = await AdminService.getAllUsers();
          if (usersResult.success && usersResult.data) {
            setUsers(usersResult.data);
          }

          // Load all clients
          const clientsResult = await AdminService.getAllClients();
          if (clientsResult.success && clientsResult.data) {
            setClients(clientsResult.data);
          }
        } catch (error) {
          console.error('Error loading admin data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAdminData();
  }, [user, isAdmin]);

  const handleUserClick = async (userId: string) => {
    setModalLoading(true);
    try {
      console.log('Loading user data for:', userId);
      const result = await AdminService.getUserWithClientData(userId);
      console.log('User data result:', result);
      
      if (result.success && result.data) {
        setSelectedUser(result.data);
        setUserModalOpen(true);
      } else {
        console.error('Failed to load user data:', result.error);
        alert('Failed to load user details: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Error loading user details. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (authLoading || loading) return <Loading />;
  if (!user || !isAdmin) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                Admin Access
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.displayName || user.email}
              </div>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    router.push('/');
                  } catch (error) {
                    console.error('Logout error:', error);
                    router.push('/');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-t border-gray-200 pt-2">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'client-campaigns', label: 'Client Campaigns' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Clients</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalClients}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategies</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalStrategies}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaigns</h3>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalCampaigns}</p>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <p className="text-gray-500">Activity feed coming soon...</p>
            </div>
          </div>
        )}

        {/* Client Campaigns Tab */}
        {activeTab === 'client-campaigns' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Client Campaigns</h2>
              <div className="text-sm text-gray-500">
                Total: {clients.length} clients with business profiles
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Industry & Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platforms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {client.businessInfo.businessName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {client.businessInfo.businessName}
                              </div>
                              <div className="text-sm text-gray-500">{client.businessInfo.businessType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.businessInfo.industry}</div>
                          <div className="text-sm text-gray-500">{client.businessInfo.city}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{client.businessInfo.budget.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Monthly</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {client.businessInfo.preferredPlatforms.map((platform) => (
                              <span
                                key={platform}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {platform === 'meta' ? 'Meta' : platform === 'google' ? 'Google' : 'WhatsApp'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserClick(client.uid)}
                            className={`text-indigo-600 hover:text-indigo-900 ${modalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={modalLoading}
                          >
                            {modalLoading ? 'Loading...' : 'View Campaigns'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* User Detail Modal */}
        {userModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Client Campaigns: {selectedUser.client?.businessInfo?.businessName || selectedUser.user.displayName || selectedUser.user.email}
                </h3>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {selectedUser.user.email}</div>
                    <div><strong>Role:</strong> {selectedUser.user.isAdmin ? 'Admin' : 'Client'}</div>
                    <div><strong>Created:</strong> {formatDate(selectedUser.user.createdAt)}</div>
                    <div><strong>Last Login:</strong> {formatDate(selectedUser.user.lastLogin)}</div>
                  </div>
                </div>

                {/* Client Info */}
                {selectedUser.client && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Business Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Business:</strong> {selectedUser.client.businessInfo.businessName}</div>
                      <div><strong>Industry:</strong> {selectedUser.client.businessInfo.industry}</div>
                      <div><strong>Location:</strong> {selectedUser.client.businessInfo.city}</div>
                      <div><strong>Budget:</strong> ₹{selectedUser.client.businessInfo.budget.toLocaleString()}</div>
                      <div><strong>Goal:</strong> {selectedUser.client.businessInfo.marketingGoal}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Strategies and Campaigns */}
              {selectedUser.client && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strategies */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Strategies ({selectedUser.strategies.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedUser.strategies.map((strategy: any) => (
                        <div key={strategy.id} className="p-3 bg-gray-50 rounded border">
                          <div className="text-xs text-gray-500 mb-1">
                            {formatDate(strategy.createdAt)}
                          </div>
                          <div className="text-sm">
                            {strategy.content.substring(0, 100)}...
                          </div>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            strategy.status === 'approved' ? 'bg-green-100 text-green-800' :
                            strategy.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {strategy.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campaigns */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Campaigns ({selectedUser.campaigns.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedUser.campaigns.map((campaign: any) => (
                        <div key={campaign.id} className="p-3 bg-gray-50 rounded border">
                          <div className="text-sm font-medium">{campaign.name}</div>
                          <div className="text-xs text-gray-500 mb-1">
                            Platform: {campaign.platform} • Created: {formatDate(campaign.createdAt)}
                          </div>
                          <div className="text-sm">
                            Budget: ₹{campaign.budget.allocated.toLocaleString()}
                          </div>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            campaign.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
