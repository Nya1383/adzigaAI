import { NextApiRequest, NextApiResponse } from 'next';
import { MasterAgent } from '../../../lib/langchain/agents';

interface StrategyRequest {
  businessType: string;
  targetAudience: string;
  budget: number;
  goals: string[];
  platforms: string[];
  industry?: string;
  location?: string;
  previousStrategies?: string[];
  competitors?: string[];
  seasonality?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      businessType, 
      targetAudience, 
      budget, 
      goals, 
      platforms,
      industry = businessType,
      location = 'Global',
      previousStrategies = [],
      competitors = [],
      seasonality = ''
    }: StrategyRequest = req.body;

    console.log('🤖 Initializing LangChain MasterAgent...');
    
    // Initialize the MasterAgent
    const masterAgent = new MasterAgent();

    // Prepare client data for the agent
    const clientData = {
      businessType,
      industry,
      targetAudience,
      budget,
      goals,
      platforms,
      location,
      previousStrategies,
      competitors,
      seasonality
    };

    console.log('🧠 Generating comprehensive strategy with LangChain...');
    
    // Generate comprehensive strategy using LangChain agents
    const result = await masterAgent.createCompleteStrategy(clientData);

    console.log('✅ Strategy generated successfully');

    res.status(200).json({ 
      success: true, 
      strategy: result.strategy,
      metadata: result.metadata,
      timestamp: new Date().toISOString(),
      version: '2.0-langchain'
    });

  } catch (error) {
    console.error('❌ LangChain Strategy Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate strategy with LangChain',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 