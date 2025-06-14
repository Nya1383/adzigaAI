import { NextApiRequest, NextApiResponse } from 'next';
import { auth, db } from '../../lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test Firebase Auth configuration
    const authConfig = {
      apiKey: auth.app.options.apiKey,
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId,
    };

    // Test Firestore configuration
    const firestoreConfig = {
      projectId: db.app.options.projectId,
      appId: db.app.options.appId,
    };

    // Check if we can access Firebase services
    const testResult = {
      timestamp: new Date().toISOString(),
      firebase: {
        auth: {
          configured: !!auth,
          config: authConfig,
          currentUser: auth.currentUser?.uid || null,
        },
        firestore: {
          configured: !!db,
          config: firestoreConfig,
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        useEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
      },
    };

    res.status(200).json({
      success: true,
      message: 'Firebase configuration test successful',
      data: testResult,
    });

  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({
      success: false,
      message: 'Firebase configuration test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 