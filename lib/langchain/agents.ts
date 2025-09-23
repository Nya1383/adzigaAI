import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

// Initialize the LLM
const createLLM = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    temperature: 0.7,
    maxTokens: 2000,
  });
};

// Strategy Agent - Creates comprehensive marketing strategies
export class StrategyAgent {
  private llm: ChatGroq;
  private promptTemplate: PromptTemplate;

  constructor() {
    this.llm = createLLM();
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are a Senior Marketing Strategist at Adziga AI, an expert in digital advertising with 10+ years of experience.

CLIENT PROFILE:
- Business: {businessType}
- Industry: {industry}
- Target Audience: {targetAudience}
- Monthly Budget: {budget}
- Primary Goals: {goals}
- Preferred Platforms: {platforms}
- Location: {location}

{contextualInfo}

TASK: Create a comprehensive, data-driven advertising strategy that maximizes ROI and achieves the client's goals.

Structure your response as follows:

## 🎯 STRATEGIC OVERVIEW
- Market positioning analysis
- Competitive landscape insights
- Unique value proposition recommendations

## 📊 AUDIENCE ANALYSIS
- Detailed target audience breakdown
- Behavioral insights and preferences
- Optimal messaging approaches

## 📱 PLATFORM-SPECIFIC STRATEGY
{platformStrategies}

## 💰 BUDGET ALLOCATION PLAN
- Recommended spend distribution across platforms
- Testing vs scaling budget allocation
- Performance-based reallocation strategy

## 📝 CREATIVE & MESSAGING FRAMEWORK
- Core messaging pillars
- Platform-specific creative adaptations
- A/B testing recommendations

## 📅 IMPLEMENTATION TIMELINE
- Week 1-2: Setup and launch
- Week 3-4: Initial optimization
- Month 2+: Scaling and expansion

## 📈 KPIs & SUCCESS METRICS
- Primary success indicators
- Secondary performance metrics
- Reporting and optimization schedule

## 🚀 IMMEDIATE ACTION ITEMS
- Priority setup tasks
- Quick wins to implement first
- Long-term optimization opportunities

Make recommendations specific, actionable, and backed by industry best practices.
    `);
  }

  async generateStrategy(clientData: any): Promise<string> {
    const platformStrategies = this.generatePlatformStrategies(clientData.platforms);
    const contextualInfo = this.buildContextualInfo(clientData);

    const chain = RunnableSequence.from([
      this.promptTemplate,
      this.llm,
      new StringOutputParser(),
    ]);

    return await chain.invoke({
      ...clientData,
      platformStrategies,
      contextualInfo,
    });
  }

  private generatePlatformStrategies(platforms: string[]): string {
    const strategies = platforms.map(platform => {
      switch (platform.toLowerCase()) {
        case 'meta':
        case 'facebook':
        case 'instagram':
          return `### Meta (Facebook & Instagram)
- Audience targeting: Lookalike audiences, interest-based targeting
- Creative formats: Video ads, carousel ads, story ads
- Optimization: Conversion campaigns, retargeting funnels`;
        
        case 'google':
          return `### Google Ads
- Search campaigns: High-intent keyword targeting
- Display network: Brand awareness and retargeting
- YouTube ads: Video marketing for engagement`;
        
        case 'whatsapp':
          return `### WhatsApp Business
- Direct messaging campaigns
- Customer service automation
- Lead nurturing sequences`;
        
        default:
          return `### ${platform}
- Platform-specific best practices
- Audience targeting recommendations
- Creative optimization strategies`;
      }
    }).join('\n\n');

    return strategies;
  }

  private buildContextualInfo(clientData: any): string {
    let context = '';
    
    if (clientData.previousStrategies?.length > 0) {
      context += `PREVIOUS CAMPAIGN INSIGHTS:\n${clientData.previousStrategies.join('\n')}\n\n`;
    }
    
    if (clientData.competitors?.length > 0) {
      context += `COMPETITIVE LANDSCAPE:\n${clientData.competitors.join(', ')}\n\n`;
    }
    
    if (clientData.seasonality) {
      context += `SEASONAL CONSIDERATIONS:\n${clientData.seasonality}\n\n`;
    }

    return context;
  }
}

// Master Agent Orchestrator - Coordinates all agents
export class MasterAgent {
  private strategyAgent: StrategyAgent;

  constructor() {
    this.strategyAgent = new StrategyAgent();
  }

  async createCompleteStrategy(clientData: any): Promise<{
    strategy: string;
    metadata: any;
  }> {
    // Generate comprehensive strategy
    const strategy = await this.strategyAgent.generateStrategy(clientData);

    const metadata = {
      businessType: clientData.businessType,
      targetAudience: clientData.targetAudience,
      budget: clientData.budget,
      goals: clientData.goals,
      platforms: clientData.platforms,
      generatedAt: new Date().toISOString(),
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      version: '2.0-langchain-agents',
      agentType: 'MasterAgent'
    };

    return {
      strategy,
      metadata,
    };
  }
} 