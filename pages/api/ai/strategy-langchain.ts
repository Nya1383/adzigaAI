import { NextApiRequest, NextApiResponse } from 'next';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

interface StrategyRequest {
  businessType: string;
  targetAudience: string;
  budget: number;
  goals: string[];
  platforms: string[];
  previousStrategies?: string[];
  clientPreferences?: Record<string, any>;
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
      previousStrategies = [],
      clientPreferences = {}
    }: StrategyRequest = req.body;

    // Initialize LangChain components
    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || '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',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Create dynamic prompt template
    const strategyPrompt = PromptTemplate.fromTemplate(`
You are an expert marketing strategist for Adziga AI, specializing in digital advertising campaigns.

CLIENT INFORMATION:
- Business Type: {businessType}
- Target Audience: {targetAudience}
- Budget: ${budget}
- Goals: {goals}
- Platforms: {platforms}

{previousContext}

{preferences}

TASK: Create a comprehensive, actionable advertising strategy that includes:

1. 🎯 STRATEGIC OVERVIEW
   - Market analysis and positioning
   - Competitive advantages to highlight
   - Key value propositions

2. 📱 PLATFORM-SPECIFIC RECOMMENDATIONS
   - Detailed tactics for each selected platform
   - Content types and formats
   - Targeting parameters

3. 💰 BUDGET ALLOCATION
   - Recommended spend distribution
   - exact amount of money in numbers to be shown for each platform 
   - Testing budget allocation
   - Scaling recommendations

4. 📝 KEY MESSAGING THEMES
   - Primary messaging pillars
   - Platform-specific adaptations
   - Call-to-action recommendations

5. 📅 CAMPAIGN TIMELINE
   - Launch sequence
   - Optimization milestones
   - Performance review schedule

6. 📊 SUCCESS METRICS & KPIs
   - Primary success indicators
   - Secondary metrics to track
   - Reporting recommendations

7. 🚀 NEXT STEPS
   - Immediate action items
   - Campaign setup checklist
   - Optimization opportunities

Make the strategy specific, actionable, and tailored to their business needs. Use data-driven insights and industry best practices.
    `);

    // Create context from previous strategies
    const previousContext = previousStrategies.length > 0 
      ? `PREVIOUS STRATEGIES CONTEXT:\nThe client has used these strategies before:\n${previousStrategies.join('\n\n')}\n\nBuild upon successful elements and avoid repeating unsuccessful approaches.\n`
      : '';

    // Create preferences context
    const preferences = Object.keys(clientPreferences).length > 0
      ? `CLIENT PREFERENCES:\n${Object.entries(clientPreferences).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n`
      : '';

    // Create the chain
    const chain = RunnableSequence.from([
      strategyPrompt,
      llm,
      new StringOutputParser(),
    ]);

    // Execute the chain
    const strategy = await chain.invoke({
      businessType,
      targetAudience,
      goals: goals.join(', '),
      platforms: platforms.join(', '),
      previousContext,
      preferences,
    });

    // Parse and structure the response
    const structuredStrategy = {
      rawStrategy: strategy,
      metadata: {
        businessType,
        targetAudience,
        budget,
        goals,
        platforms,
        generatedAt: new Date().toISOString(),
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        version: '2.0-langchain'
      }
    };

    res.status(200).json({ 
      success: true, 
      strategy: structuredStrategy,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('LangChain Strategy Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate strategy with LangChain',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
