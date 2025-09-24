import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/router';
import Loading from '../components/ui/Loading';
import { ClientService, SimpleStrategyService, SimpleCampaignService } from '../services/firestore';
import { Client } from '../types';
import StrategyDisplay from '../components/StrategyDisplay';
import ChatBot from '../components/ChatBot';

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
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State for desktop user dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  // State for chatbot
  const [chatBotOpen, setChatBotOpen] = useState(false);
  // State for campaigns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('header')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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

            // Load existing campaigns from Firestore
            try {
              console.log('🔍 Loading campaigns for client:', result.data!.id);
              const campaignsResult = await SimpleCampaignService.getCampaignsByClient(result.data!.id);
              console.log('📊 Campaigns result:', campaignsResult);
              
              if (campaignsResult.success && campaignsResult.data) {
                console.log('📝 Raw campaigns data:', campaignsResult.data);
                setCampaigns(campaignsResult.data);
              } else {
                console.log('❌ No campaigns found or error:', campaignsResult.error);
              }
            } catch (error) {
              console.error('❌ Error loading campaigns:', error);
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

  const handleChatBotStrategy = async (strategyData: any) => {
    const newStrategy: Strategy = {
      id: Date.now().toString(),
      content: strategyData.content,
      timestamp: strategyData.timestamp,
      status: 'pending'
    };
    setStrategies(prev => [newStrategy, ...prev]);
    
    // Save strategy to Firestore
    try {
      console.log('💾 Saving chatbot strategy to Firestore for client:', clientData?.id);
      const saveResult = await SimpleStrategyService.createStrategy({
        clientId: clientData!.id,
        content: strategyData.content,
        status: 'pending',
        metadata: {
          ...strategyData.metadata,
          customPrompt: strategyData.customPrompt,
          source: 'chatbot'
        }
      });
      console.log('✅ Chatbot strategy save result:', saveResult);
      
      if (saveResult.success) {
        console.log('✅ Chatbot strategy saved to Firestore successfully');
        // Update the strategy ID with the Firestore document ID
        setStrategies(prev => prev.map(strategy => 
          strategy.id === newStrategy.id 
            ? { ...strategy, id: saveResult.data.id }
            : strategy
        ));
      } else {
        console.error('❌ Failed to save chatbot strategy:', saveResult.error);
      }
    } catch (error) {
      console.error('❌ Error saving chatbot strategy to Firestore:', error);
    }
  };

  const handleLaunchCampaign = async (budgetAllocation: any, strategyContent?: string) => {
    console.log('🚀 Launching campaign with budget allocation:', budgetAllocation);
    
    // Calculate actual amounts based on client budget
    const totalBudget = clientData?.businessInfo.budget || 50000;
    const enabledPlatforms = Object.keys(budgetAllocation).filter(
      key => key !== 'total' && budgetAllocation[key].enabled
    );
    
    const strategyId = `strategy_${Date.now()}`;
    const strategyPreview = strategyContent ? strategyContent.substring(0, 200) + '...' : '';
    
    const newCampaigns = enabledPlatforms.map((platform) => ({
      id: `campaign_${platform}_${Date.now()}`,
      clientId: clientData!.id,
      platform,
      name: `${clientData?.businessInfo.businessName} - ${platform.charAt(0).toUpperCase() + platform.slice(1)} Campaign`,
      status: 'draft',
      budget: {
        allocated: Math.round((budgetAllocation[platform].percentage / 100) * totalBudget),
        spent: 0,
        remaining: Math.round((budgetAllocation[platform].percentage / 100) * totalBudget)
      },
      enabled: budgetAllocation[platform].enabled,
      createdAt: new Date().toISOString(),
      strategyBased: true,
      strategyId,
      strategyPreview
    }));

    // Save campaigns to Firestore first
    try {
      console.log('💾 Saving campaigns to Firestore for client:', clientData?.id);
      const saveResult = await SimpleCampaignService.createCampaigns(newCampaigns);
      console.log('✅ Campaigns save result:', saveResult);
      
      if (saveResult.success && saveResult.data) {
        console.log('✅ Campaigns saved to Firestore successfully');
        // Use the campaigns with Firestore IDs
        setCampaigns(prev => [...(saveResult.data || []), ...prev]);
      } else {
        console.error('❌ Failed to save campaigns:', saveResult.error);
        // Still add to state even if Firestore fails
        setCampaigns(prev => [...newCampaigns, ...prev]);
      }
    } catch (error) {
      console.error('❌ Error saving campaigns to Firestore:', error);
      // Still add to state even if Firestore fails
      setCampaigns(prev => [...newCampaigns, ...prev]);
    }
    
    // Switch to campaigns tab to show the created campaigns
    setActiveTab('campaigns');
    
    console.log('✅ Campaigns created:', newCampaigns);
  };

  if (loading || loadingClient) return <Loading />;
  if (!user) return <Loading />;
  if (!clientData) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Bar with Logo and User Menu */}
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Adziga AI</h1>
            
            {/* Desktop User Menu */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {clientData.businessInfo.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{clientData.businessInfo.businessName}</div>
                    <div className="text-xs text-gray-500">Welcome back</div>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{clientData.businessInfo.businessName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('strategies');
                          setUserDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        My Strategies
                      </button>
                      
                      <div className="border-t border-gray-100">
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            try {
                              await logout();
                              router.push('/');
                            } catch (error) {
                              console.error('Logout error:', error);
                              router.push('/');
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          
          {/* Mobile Menu */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              {['overview', 'profile', 'strategies', 'campaigns', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200 mt-2">
                <div className="flex items-center px-4">
                  <div className="text-sm text-gray-500">Welcome, {clientData.businessInfo.businessName}</div>
                </div>
                <div className="mt-3 px-2 space-y-1">
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
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-800 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:block border-t border-gray-200 pt-2">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'profile', 'strategies', 'campaigns', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize ${
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 mt-20 sm:mt-28">

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
              <div className="flex space-x-3">
                <button
                  onClick={() => setChatBotOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Customize Strategy</span>
                </button>
                <button
                  onClick={generateStrategy}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate New Strategy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {strategies.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Strategies Yet</h3>
                  <p className="text-gray-500 mb-6">Generate your first AI-powered marketing strategy to get started!</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setChatBotOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>💬 Tell AI What You Want</span>
                    </button>
                    <button
                      onClick={generateStrategy}
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{isGenerating ? 'Generating...' : '✨ Generate Standard Strategy'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                strategies.map((strategy) => (
                  <StrategyDisplay
                    key={strategy.id}
                    content={strategy.content}
                    timestamp={strategy.timestamp}
                    status={strategy.status}
                    onLaunchCampaign={handleLaunchCampaign}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Campaign Management</h2>
              <div className="text-sm text-gray-500">
                Total Budget: ₹{clientData.businessInfo.budget.toLocaleString()}
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
                <p className="text-gray-500 mb-4">
                  Create campaigns by launching them from your AI-generated strategies in the Strategies tab.
                </p>
                <button
                  onClick={() => setActiveTab('strategies')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Go to Strategies
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group campaigns by strategy */}
                {Object.entries(
                  campaigns.reduce((acc, campaign) => {
                    const strategyId = campaign.strategyId || 'unknown';
                    if (!acc[strategyId]) {
                      acc[strategyId] = [];
                    }
                    acc[strategyId].push(campaign);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([strategyId, strategyCampaigns], index) => {
                  const campaignList = strategyCampaigns as any[];
                  const totalBudget = campaignList.reduce((sum: number, c: any) => sum + c.budget.allocated, 0);
                  const activeCampaigns = campaignList.filter((c: any) => c.enabled).length;
                  const isExpanded = expandedStrategy === strategyId;
                  
                  return (
                    <div key={strategyId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Strategy Overview Card */}
                      <div 
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedStrategy(isExpanded ? null : strategyId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Strategy #{index + 1}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {campaignList.length} campaign{campaignList.length !== 1 ? 's' : ''} • 
                                {activeCampaigns} active • 
                                Created {new Date(campaignList[0].createdAt).toLocaleDateString()}
                              </p>
                              {campaignList[0].strategyPreview && (
                                <p className="text-xs text-gray-400 mt-1 max-w-md truncate">
                                  {campaignList[0].strategyPreview}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            {/* Platform Icons */}
                            <div className="flex space-x-2">
                              {campaignList.map((campaign: any) => (
                                <div
                                  key={campaign.id}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                    campaign.platform === 'meta' ? 'bg-blue-100 text-blue-600' :
                                    campaign.platform === 'google' ? 'bg-red-100 text-red-600' :
                                    'bg-green-100 text-green-600'
                                  } ${campaign.enabled ? '' : 'opacity-50'}`}
                                  title={`${campaign.platform} - ${campaign.enabled ? 'Active' : 'Inactive'}`}
                                >
                                  {campaign.platform === 'meta' ? '📘' :
                                   campaign.platform === 'google' ? '🔍' : '💬'}
                                </div>
                              ))}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ₹{totalBudget.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Total Budget</div>
                            </div>
                            
                            <div className="text-gray-400">
                              <svg 
                                className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Campaign Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-6 space-y-4">
                            {campaignList.map((campaign: any) => (
                              <div key={campaign.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      campaign.platform === 'meta' ? 'bg-blue-100 text-blue-600' :
                                      campaign.platform === 'google' ? 'bg-red-100 text-red-600' :
                                      'bg-green-100 text-green-600'
                                    }`}>
                                      {campaign.platform === 'meta' ? '📘' :
                                       campaign.platform === 'google' ? '🔍' : '💬'}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                                      <p className="text-sm text-gray-500">
                                        {campaign.platform === 'meta' ? 'Meta (Facebook & Instagram)' :
                                         campaign.platform === 'google' ? 'Google Ads' :
                                         'WhatsApp Business'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-gray-900">
                                        ₹{campaign.budget.allocated.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500">Allocated</div>
                                    </div>
                                    
                                    {/* Campaign Toggle */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={campaign.enabled}
                                          onChange={async (e) => {
                                          const newEnabled = e.target.checked;
                                          const newStatus = newEnabled ? 'active' : 'paused';
                                          
                                          // Update local state immediately
                                          setCampaigns(prev => prev.map(c => 
                                            c.id === campaign.id 
                                              ? { ...c, enabled: newEnabled, status: newStatus }
                                              : c
                                          ));

                                          // Update in Firestore
                                          try {
                                            const updateResult = await SimpleCampaignService.updateCampaign(campaign.id, {
                                              enabled: newEnabled,
                                              status: newStatus
                                            });
                                            
                                            if (updateResult.success) {
                                              console.log('✅ Campaign updated in Firestore');
                                            } else {
                                              console.error('❌ Failed to update campaign:', updateResult.error);
                                            }
                                          } catch (error) {
                                            console.error('❌ Error updating campaign:', error);
                                          }
                                        }}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Status</div>
                                    <div className={`text-sm font-medium ${
                                      campaign.status === 'active' ? 'text-green-600' :
                                      campaign.status === 'paused' ? 'text-yellow-600' :
                                      'text-gray-600'
                                    }`}>
                                      {campaign.status === 'active' ? '🟢 Active' :
                                       campaign.status === 'paused' ? '🟡 Paused' :
                                       '⚪ Draft'}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Spent</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      ₹{campaign.budget.spent.toLocaleString()}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Remaining</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      ₹{campaign.budget.remaining.toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Launch Campaign */}
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-green-700">
                                      🚀 {campaign.status === 'active' ? 'Campaign is running' : 'Ready to launch campaign'}
                                    </div>
                                    <button 
                                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                        campaign.status === 'active' 
                                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      }`}
                                    >
                                      {campaign.status === 'active' ? 'Pause' : 'Launch'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Analytics</h2>
            <p className="text-gray-500">Analytics dashboard coming soon...</p>
          </div>
        )}
      </main>

      {/* ChatBot Component */}
      {clientData && (
        <ChatBot
          isOpen={chatBotOpen}
          onClose={() => setChatBotOpen(false)}
          clientData={clientData}
          onStrategyGenerated={handleChatBotStrategy}
        />
      )}
    </div>
  );
} 