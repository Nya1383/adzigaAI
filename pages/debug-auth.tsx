import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function DebugAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [authState, setAuthState] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('🔧 Debug page loaded');
    addLog(`🌐 Firebase Auth Domain: ${auth.app.options.authDomain}`);
    addLog(`🔑 Firebase Project ID: ${auth.app.options.projectId}`);
    addLog(`📱 Firebase App ID: ${auth.app.options.appId}`);
    
    // Monitor auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        addLog(`✅ User authenticated: ${user.email}`);
        setAuthState({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        });
      } else {
        addLog('❌ No user authenticated');
        setAuthState(null);
      }
    });

    return unsubscribe;
  }, []);

  const testLogin = async () => {
    setLoading(true);
    addLog(`🔐 Attempting login with: ${email}`);
    
    try {
      addLog('📡 Sending request to Firebase Auth...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      addLog(`✅ Login successful! User: ${userCredential.user.email}`);
    } catch (error: any) {
      addLog(`❌ Login failed: ${error.code} - ${error.message}`);
      
      // Additional debugging info
      if (error.code === 'auth/network-request-failed') {
        addLog('🔍 Network request failed - possible causes:');
        addLog('  • Internet connectivity issues');
        addLog('  • Firewall blocking Firebase domains');
        addLog('  • DNS resolution problems');
        addLog('  • Browser blocking third-party requests');
        addLog('  • Firebase emulator misconfiguration');
      }
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    addLog(`📝 Attempting signup with: ${email}`);
    
    try {
      addLog('📡 Sending signup request to Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      addLog(`✅ Signup successful! User: ${userCredential.user.email}`);
    } catch (error: any) {
      addLog(`❌ Signup failed: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testNetworkConnectivity = async () => {
    addLog('🌐 Testing network connectivity...');
    
    try {
      // Test Firebase Auth REST API directly
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + auth.app.options.apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123',
          returnSecureToken: true
        })
      });
      
      if (response.ok) {
        addLog('✅ Firebase Auth API is reachable');
      } else {
        addLog(`⚠️ Firebase Auth API responded with status: ${response.status}`);
      }
    } catch (error: any) {
      addLog(`❌ Network connectivity test failed: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Auth Debug</h1>
        
        {/* Auth State */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authState, null, 2) || 'No user authenticated'}
          </pre>
        </div>

        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={testSignup}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </button>
            
            <button
              onClick={testNetworkConnectivity}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-400"
            >
              Test Network
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 mr-4">← Back to Home</a>
          <a href="/login" className="text-blue-600 hover:text-blue-800">Go to Login Page</a>
        </div>
      </div>
    </div>
  );
} 