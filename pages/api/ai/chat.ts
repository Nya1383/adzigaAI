import { NextApiRequest, NextApiResponse } from 'next';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

interface ChatRequest {
  userPrompt: string;
  businessName: string;
  businessType: string;
  industry: string;
  city: string;
  budget: number;
  platforms: string[];
  marketingGoal: string;
  description?: string;
  website?: string;
  phone?: string;
  conversationHistory?: Array<{
    type: 'user' | 'bot';
    content: string;
  }>;
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
      userPrompt,
      businessName,
      businessType,
      industry,
      city,
      budget,
      platforms,
      marketingGoal,
      description,
      website,
      phone,
      conversationHistory = []
    }: ChatRequest = req.body;

    console.log('🤖 Processing chat request with user prompt:', userPrompt);

    // Initialize LangChain components
    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || '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',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Create conversation context from history
    const conversationContext = conversationHistory.length > 0 
      ? `\nCONVERSATION HISTORY:\n${conversationHistory.map(msg => 
          `${msg.type.toUpperCase()}: ${msg.content}`
        ).join('\n')}\n`
      : '';

    // Create dynamic prompt template for chat-based strategy generation
    const chatPrompt = PromptTemplate.fromTemplate(`
You are an expert marketing strategist at Adziga AI, specializing in creating personalized advertising strategies through conversational AI.

CLIENT BUSINESS PROFILE:
- Business Name: {businessName}
- Business Type: {businessType}
- Industry: {industry}
- Location: {city}
- Monthly Budget: ₹{budget}
- Marketing Goal: {marketingGoal}
- Preferred Platforms: {platforms}
{businessDetails}

{conversationContext}

USER'S SPECIFIC REQUEST:
"{userPrompt}"

TASK: Based on the user's specific request and business profile, create a highly customized marketing strategy that addresses their exact requirements. 

Key Instructions:
1. CAREFULLY analyze what the user is asking for or wants to avoid
2. If they mention specific platforms to focus on or avoid, respect that completely
3. If they mention budget constraints, work within those limits
4. If they specify target audiences, tailor the strategy accordingly
5. If they want to focus on specific aspects (brand awareness vs sales), prioritize accordingly

Create a comprehensive strategy that includes:

## 🎯 STRATEGIC OVERVIEW
- How this strategy addresses the user's specific request
- Market positioning based on their requirements
- Key focus areas as requested

## 📊 CUSTOMIZED AUDIENCE TARGETING
- Target audience refined based on user's specifications
- Demographic and psychographic insights
- Platform-specific audience recommendations

## 📱 PLATFORM STRATEGY (Based on User Preferences)
{platformStrategy}

## 💰 BUDGET ALLOCATION PLAN
- Customized budget distribution respecting user preferences
- Testing vs scaling allocation
- Platform-specific budget recommendations

## 📝 MESSAGING & CREATIVE STRATEGY
- Core messaging that aligns with user's vision
- Creative themes and content recommendations
- Platform-optimized creative formats

## 📅 IMPLEMENTATION ROADMAP
- Phase-wise implementation plan
- Key milestones and optimization points
- Timeline for testing and scaling

## 📈 SUCCESS METRICS & KPIs
- Primary metrics based on user's goals
- Platform-specific performance indicators
- Optimization benchmarks

## 🚀 IMMEDIATE NEXT STEPS
- Priority actions to get started
- Setup requirements and recommendations
- Quick wins to implement first

Make sure this strategy directly addresses the user's request: "{userPrompt}"
Be specific, actionable, and show how each recommendation fulfills their requirements.
    `);

    // Generate platform strategy based on user preferences and available platforms
    const generatePlatformStrategy = (userPrompt: string, platforms: string[]) => {
      // Analyze user prompt for platform preferences
      const promptLower = userPrompt.toLowerCase();
      let focusPlatforms = platforms;
      let avoidPlatforms: string[] = [];

      // Check for platform exclusions
      if (promptLower.includes('no google') || promptLower.includes('avoid google') || promptLower.includes('not google')) {
        avoidPlatforms.push('google');
        focusPlatforms = focusPlatforms.filter(p => p !== 'google');
      }
      if (promptLower.includes('no meta') || promptLower.includes('avoid meta') || promptLower.includes('no facebook')) {
        avoidPlatforms.push('meta');
        focusPlatforms = focusPlatforms.filter(p => p !== 'meta');
      }
      if (promptLower.includes('no whatsapp') || promptLower.includes('avoid whatsapp')) {
        avoidPlatforms.push('whatsapp');
        focusPlatforms = focusPlatforms.filter(p => p !== 'whatsapp');
      }

      // Check for platform focus
      if (promptLower.includes('focus on meta') || promptLower.includes('more meta') || promptLower.includes('mainly facebook')) {
        focusPlatforms = ['meta'];
      }
      if (promptLower.includes('focus on google') || promptLower.includes('more google') || promptLower.includes('mainly google')) {
        focusPlatforms = ['google'];
      }
      if (promptLower.includes('focus on whatsapp') || promptLower.includes('more whatsapp')) {
        focusPlatforms = ['whatsapp'];
      }

      let strategy = '';
      
      if (avoidPlatforms.length > 0) {
        strategy += `Note: As requested, this strategy excludes ${avoidPlatforms.join(', ')} advertising.\n\n`;
      }

      focusPlatforms.forEach(platform => {
        switch (platform.toLowerCase()) {
          case 'meta':
          case 'facebook':
          case 'instagram':
            strategy += `### Meta (Facebook & Instagram) - PRIMARY FOCUS
- Advanced audience targeting with lookalike audiences
- Video-first creative strategy for engagement
- Conversion campaigns with retargeting funnels
- Story ads and Reels for younger demographics
- Lead generation campaigns with instant forms\n\n`;
            break;
          
          case 'google':
            strategy += `### Google Ads - SEARCH & DISPLAY
- High-intent search campaigns targeting commercial keywords
- Display remarketing for brand awareness
- YouTube video campaigns for engagement
- Shopping campaigns for e-commerce
- Performance Max campaigns for omnichannel reach\n\n`;
            break;
          
          case 'whatsapp':
            strategy += `### WhatsApp Business - DIRECT ENGAGEMENT
- Broadcast messaging for promotions
- Customer service automation with chatbots
- Lead nurturing through personalized conversations
- Click-to-WhatsApp ads for immediate engagement
- Template-based campaigns for notifications\n\n`;
            break;
        }
      });

      return strategy || 'Custom platform strategy based on your preferences will be developed.';
    };

    const platformStrategy = generatePlatformStrategy(userPrompt, platforms);

    // Prepare business details
    const businessDetails = [];
    if (description) businessDetails.push(`- Description: ${description}`);
    if (website) businessDetails.push(`- Website: ${website}`);
    if (phone) businessDetails.push(`- Phone: ${phone}`);
    
    const businessDetailsText = businessDetails.length > 0 
      ? `\n${businessDetails.join('\n')}`
      : '';

    // Create the chain
    const chain = RunnableSequence.from([
      chatPrompt,
      llm,
      new StringOutputParser(),
    ]);

    // Execute the chain
    const strategy = await chain.invoke({
      businessName,
      businessType,
      industry,
      city,
      budget,
      marketingGoal,
      platforms: platforms.join(', '),
      userPrompt,
      conversationContext,
      businessDetails: businessDetailsText,
      platformStrategy
    });

    // Create metadata for the strategy
    const metadata = {
      businessName,
      businessType,
      industry,
      city,
      budget,
      platforms,
      marketingGoal,
      userPrompt,
      conversationLength: conversationHistory.length,
      generatedAt: new Date().toISOString(),
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      version: '2.0-chat',
      source: 'chatbot'
    };

    console.log('✅ Chat strategy generated successfully');

    res.status(200).json({ 
      success: true, 
      strategy,
      metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat Strategy Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate strategy through chat',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
