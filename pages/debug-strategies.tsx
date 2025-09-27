import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { ClientService, SimpleStrategyService } from '../services/firestore';
import { cleanMarkdownPreview } from '../utils';

export default function DebugStrategies() {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<any>(null);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const loadClientAndStrategies = async () => {
    if (!user) {
      addLog('❌ No user logged in');
      return;
    }

    try {
      addLog('🔍 Loading client data...');
      const clientResult = await ClientService.getClientByUid(user.uid);
      
      if (clientResult.success) {
        setClientData(clientResult.data);
        addLog(`✅ Client loaded: ${clientResult.data?.id}`);
        
        addLog('🔍 Loading strategies...');
        const strategiesResult = await SimpleStrategyService.getStrategiesByClient(clientResult.data!.id);
        
        if (strategiesResult.success) {
          setStrategies(strategiesResult.data || []);
          addLog(`✅ Strategies loaded: ${strategiesResult.data?.length || 0} found`);
        } else {
          addLog(`❌ Failed to load strategies: ${strategiesResult.error}`);
        }
      } else {
        addLog(`❌ Failed to load client: ${clientResult.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const createTestStrategy = async () => {
    if (!clientData) {
      addLog('❌ No client data available');
      return;
    }

    try {
      addLog('💾 Creating test strategy...');
      const result = await SimpleStrategyService.createStrategy({
        clientId: clientData.id,
        content: `Test strategy created at ${new Date().toISOString()}\n\n## Target Audience\n- Young professionals\n- Age 25-35\n\n## Platforms\n- Facebook\n- Instagram\n\n## Budget Allocation\n- 60% Facebook\n- 40% Instagram`,
        status: 'pending',
        metadata: { test: true }
      });

      if (result.success) {
        addLog(`✅ Test strategy created with ID: ${result.data.id}`);
        loadClientAndStrategies(); // Reload to see the new strategy
      } else {
        addLog(`❌ Failed to create test strategy: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Error creating test strategy: ${error}`);
    }
  };

  useEffect(() => {
    if (user) {
      loadClientAndStrategies();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Strategy Debug Page</h1>
        
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <p><strong>User ID:</strong> {user?.uid || 'Not logged in'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Client ID:</strong> {clientData?.id || 'Not loaded'}</p>
          <p><strong>Business Name:</strong> {clientData?.businessInfo?.businessName || 'N/A'}</p>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={loadClientAndStrategies}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Reload Data
            </button>
            <button
              onClick={createTestStrategy}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!clientData}
            >
              ➕ Create Test Strategy
            </button>
            <button
              onClick={() => setLogs([])}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              🗑️ Clear Logs
            </button>
          </div>
        </div>

        {/* Strategies */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Strategies ({strategies.length})</h2>
          {strategies.length === 0 ? (
            <p className="text-gray-500">No strategies found</p>
          ) : (
            <div className="space-y-4">
              {strategies.map((strategy, index) => (
                <div key={strategy.id} className="border p-4 rounded">
                  <h3 className="font-semibold">Strategy {index + 1}</h3>
                  <p><strong>ID:</strong> {strategy.id}</p>
                  <p><strong>Status:</strong> {strategy.status}</p>
                  <p><strong>Created:</strong> {strategy.createdAt?.seconds ? 
                    new Date(strategy.createdAt.seconds * 1000).toLocaleString() : 
                    'Unknown'}</p>
                  <p><strong>Content Preview:</strong> {cleanMarkdownPreview(strategy.content, 100)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Logs */}
        <div className="bg-black text-green-400 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 