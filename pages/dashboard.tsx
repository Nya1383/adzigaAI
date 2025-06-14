import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/router';
import Loading from '../components/ui/Loading';
import { ClientService, SimpleStrategyService } from '../services/firestore';
import { Client } from '../types';
import StrategyDisplay from '../components/StrategyDisplay';

interface Strategy {
  id: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load client data when user is available
  useEffect(() => {
    const loadClientData = async () => {
      if (user && !loading) {
        setLoadingClient(true);
        try {
          const result = await ClientService.getClientByUid(user.uid);
          if (result.success) {
            setClientData(result.data!);
            
            // Load existing strategies from Firestore
            try {
              console.log('🔍 Loading strategies for client:', result.data!.id);
              const strategiesResult = await SimpleStrategyService.getStrategiesByClient(result.data!.id);
              console.log('📊 Strategies result:', strategiesResult);
              
              if (strategiesResult.success && strategiesResult.data) {
                console.log('📝 Raw strategies data:', strategiesResult.data);
                const formattedStrategies = strategiesResult.data.map((strategy: any) => {
                  console.log('🔄 Processing strategy:', strategy);
                  
                  // Handle different timestamp formats
                  let timestamp = new Date().toISOString();
                  if (strategy.createdAt) {
                    if (typeof strategy.createdAt.toDate === 'function') {
                      timestamp = strategy.createdAt.toDate().toISOString();
                    } else if (strategy.createdAt.seconds) {
                      timestamp = new Date(strategy.createdAt.seconds * 1000).toISOString();
                    } else if (typeof strategy.createdAt === 'string') {
                      timestamp = strategy.createdAt;
                    }
                  }
                  
                  return {
                    id: strategy.id,
                    content: strategy.content,
                    timestamp: timestamp,
                    status: strategy.status || 'pending'
                  };
                });
                
                console.log('✅ Formatted strategies:', formattedStrategies);
                setStrategies(formattedStrategies);
              } else {
                console.log('❌ No strategies found or error:', strategiesResult.error);
              }
            } catch (error) {
              console.error('❌ Error loading strategies:', error);
            }
          } else {
            // User hasn't completed onboarding, redirect to onboarding
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error loading client data:', error);
        } finally {
          setLoadingClient(false);
        }
      }
    };

    loadClientData();
  }, [user, loading, router]);

  const generateStrategy = async () => {
    if (!clientData) {
      alert('Please complete your business profile first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: clientData.businessInfo.businessName,
          businessType: clientData.businessInfo.businessType,
          industry: clientData.businessInfo.industry,
          city: clientData.businessInfo.city,
          budget: clientData.businessInfo.budget,
          platforms: clientData.businessInfo.preferredPlatforms,
          marketingGoal: clientData.businessInfo.marketingGoal,
          description: clientData.businessInfo.description,
          website: clientData.businessInfo.website,
          phone: clientData.businessInfo.phone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const newStrategy: Strategy = {
          id: Date.now().toString(),
          content: data.strategy,
          timestamp: data.timestamp,
          status: 'pending'
        };
        setStrategies(prev => [newStrategy, ...prev]);
        
        // Save strategy to Firestore
        try {
          console.log('💾 Saving strategy to Firestore for client:', clientData.id);
          const saveResult = await SimpleStrategyService.createStrategy({
            clientId: clientData.id,
            content: data.strategy,
            status: 'pending',
            metadata: data.metadata || {}
          });
          console.log('✅ Strategy save result:', saveResult);
          
          if (saveResult.success) {
            console.log('✅ Strategy saved to Firestore successfully');
            // Update the strategy ID with the Firestore document ID
            setStrategies(prev => prev.map(strategy => 
              strategy.id === newStrategy.id 
                ? { ...strategy, id: saveResult.data.id }
                : strategy
            ));
          } else {
            console.error('❌ Failed to save strategy:', saveResult.error);
          }
        } catch (error) {
          console.error('❌ Error saving strategy to Firestore:', error);
        }
        
        console.log('Strategy generated and saved:', data.strategy);
        
        // Log LangChain metadata if available
        if (data.metadata) {
          console.log('🤖 LangChain Strategy Metadata:', data.metadata);
        }
      }
    } catch (error) {
      console.error('Error generating strategy:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || loadingClient) return <Loading />;
  if (!user) return <Loading />;
  if (!clientData) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Adziga AI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {clientData.businessInfo.businessName}</span>
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
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'profile', 'strategies', 'campaigns', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Campaigns</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Strategies</h3>
                <p className="text-3xl font-bold text-green-600">{strategies.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Budget</h3>
                <p className="text-3xl font-bold text-purple-600">₹{clientData.businessInfo.budget}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Platforms</h3>
                <p className="text-3xl font-bold text-yellow-600">{clientData.businessInfo.preferredPlatforms.length}</p>
              </div>
            </div>

            {/* Quick Business Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Business:</span>
                  <span className="ml-2 text-gray-600">{clientData.businessInfo.businessName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Industry:</span>
                  <span className="ml-2 text-gray-600">{clientData.businessInfo.industry}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-gray-600">{clientData.businessInfo.city}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Goal:</span>
                  <span className="ml-2 text-gray-600">{clientData.businessInfo.marketingGoal}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
              <button
                onClick={() => router.push('/onboarding')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Business Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Business Name</label>
                    <p className="text-gray-600">{clientData.businessInfo.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Business Type</label>
                    <p className="text-gray-600">{clientData.businessInfo.businessType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Industry</label>
                    <p className="text-gray-600">{clientData.businessInfo.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-600">{clientData.businessInfo.city}</p>
                  </div>
                  {clientData.businessInfo.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      <p className="text-gray-600">
                        <a href={clientData.businessInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {clientData.businessInfo.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {clientData.businessInfo.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-600">{clientData.businessInfo.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Campaign Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Monthly Budget</label>
                    <p className="text-gray-600">₹{clientData.businessInfo.budget}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Marketing Goal</label>
                    <p className="text-gray-600">{clientData.businessInfo.marketingGoal}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preferred Platforms</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {clientData.businessInfo.preferredPlatforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {platform === 'meta' ? 'Meta (Facebook & Instagram)' : 
                           platform === 'google' ? 'Google Ads' : 
                           'WhatsApp Business'}
                        </span>
                      ))}
                    </div>
                  </div>
                  {clientData.businessInfo.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-600 text-sm">{clientData.businessInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === 'strategies' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI-Generated Strategies</h2>
              <button
                onClick={generateStrategy}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate New Strategy'
                )}
              </button>
            </div>

            <div className="space-y-6">
              {strategies.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Strategies Yet</h3>
                  <p className="text-gray-500 mb-4">Generate your first AI-powered marketing strategy to get started!</p>
                  <button
                    onClick={generateStrategy}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    {isGenerating ? 'Generating...' : '✨ Generate My First Strategy'}
                  </button>
                </div>
              ) : (
                strategies.map((strategy) => (
                  <StrategyDisplay
                    key={strategy.id}
                    content={strategy.content}
                    timestamp={strategy.timestamp}
                    status={strategy.status}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Management</h2>
            <p className="text-gray-500">Campaign execution features coming soon...</p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Analytics</h2>
            <p className="text-gray-500">Analytics dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
} 