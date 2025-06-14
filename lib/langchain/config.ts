// LangChain Configuration for Adziga AI
export const LANGCHAIN_CONFIG = {
  // Model Configuration
  MODEL: {
    PROVIDER: 'groq',
    NAME: 'meta-llama/llama-4-scout-17b-16e-instruct',
    TEMPERATURE: 0.7,
    MAX_TOKENS: 2000,
    TOP_P: 0.9,
  },

  // API Configuration
  API: {
    GROQ_API_KEY: process.env.GROQ_API_KEY || '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',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
  },

  // Agent Configuration
  AGENTS: {
    STRATEGY: {
      ROLE: 'Senior Marketing Strategist',
      EXPERTISE: 'Digital advertising with 10+ years of experience',
      FOCUS: 'ROI optimization and goal achievement',
    },
    CAMPAIGN: {
      ROLE: 'Campaign Manager',
      EXPERTISE: 'Detailed campaign structures for digital advertising',
      FOCUS: 'Platform-specific optimization',
    },
    CONTENT: {
      ROLE: 'Creative Director',
      EXPERTISE: 'High-converting ad copy and creative briefs',
      FOCUS: 'Conversion-driven content',
    },
    ANALYTICS: {
      ROLE: 'Performance Marketing Analyst',
      EXPERTISE: 'Campaign optimization and data analysis',
      FOCUS: 'Data-driven insights and optimization',
    },
  },

  // Platform-Specific Settings
  PLATFORMS: {
    META: {
      NAME: 'Meta (Facebook & Instagram)',
      FEATURES: ['Lookalike audiences', 'Interest targeting', 'Video ads', 'Carousel ads'],
      OPTIMIZATION: 'Conversion campaigns and retargeting',
    },
    GOOGLE: {
      NAME: 'Google Ads',
      FEATURES: ['Search campaigns', 'Display network', 'YouTube ads'],
      OPTIMIZATION: 'High-intent keyword targeting',
    },
    WHATSAPP: {
      NAME: 'WhatsApp Business',
      FEATURES: ['Direct messaging', 'Customer service automation', 'Lead nurturing'],
      OPTIMIZATION: 'Conversation-based marketing',
    },
  },

  // Prompt Templates
  PROMPTS: {
    SYSTEM_CONTEXT: 'You are an expert at Adziga AI, a leading AI-powered advertising agency.',
    STRATEGY_FOCUS: 'Create comprehensive, data-driven advertising strategies that maximize ROI.',
    CAMPAIGN_FOCUS: 'Design detailed campaign structures with specific settings and targeting.',
    CONTENT_FOCUS: 'Generate high-converting ad copy and creative briefs.',
    ANALYTICS_FOCUS: 'Provide actionable optimization recommendations based on performance data.',
  },

  // Output Formatting
  OUTPUT: {
    STRATEGY_SECTIONS: [
      '🎯 STRATEGIC OVERVIEW',
      '📊 AUDIENCE ANALYSIS', 
      '📱 PLATFORM-SPECIFIC STRATEGY',
      '💰 BUDGET ALLOCATION PLAN',
      '📝 CREATIVE & MESSAGING FRAMEWORK',
      '📅 IMPLEMENTATION TIMELINE',
      '📈 KPIs & SUCCESS METRICS',
      '🚀 IMMEDIATE ACTION ITEMS'
    ],
    CAMPAIGN_SECTIONS: [
      '📋 CAMPAIGN STRUCTURE',
      '🎨 CREATIVE REQUIREMENTS',
      '⚙️ TECHNICAL SETUP',
      '📊 OPTIMIZATION PLAN'
    ],
    CONTENT_SECTIONS: [
      '📝 AD COPY VARIATIONS',
      '🎨 CREATIVE BRIEF',
      '🧪 A/B TESTING PLAN',
      '📱 PLATFORM OPTIMIZATION'
    ],
  },

  // Performance Benchmarks
  BENCHMARKS: {
    META: {
      CTR: 1.5, // Average click-through rate
      CPC: 0.5, // Average cost per click
      CONVERSION_RATE: 2.5, // Average conversion rate
    },
    GOOGLE: {
      CTR: 2.0,
      CPC: 1.0,
      CONVERSION_RATE: 3.0,
    },
    WHATSAPP: {
      OPEN_RATE: 90,
      RESPONSE_RATE: 15,
      CONVERSION_RATE: 5.0,
    },
  },

  // Budget Allocation Guidelines
  BUDGET_ALLOCATION: {
    TESTING_PERCENTAGE: 20, // 20% for testing
    SCALING_PERCENTAGE: 80, // 80% for scaling
    MIN_DAILY_BUDGET: 10, // Minimum daily budget per campaign
    PLATFORM_DISTRIBUTION: {
      META: 0.4, // 40% default allocation
      GOOGLE: 0.4, // 40% default allocation
      WHATSAPP: 0.2, // 20% default allocation
    },
  },

  // Optimization Thresholds
  OPTIMIZATION: {
    MIN_CONVERSIONS_FOR_OPTIMIZATION: 10,
    MIN_SPEND_FOR_ANALYSIS: 100,
    PERFORMANCE_CHECK_FREQUENCY: 24, // hours
    SCALING_THRESHOLD: 1.5, // Scale when ROAS > 1.5x target
  },
};

// Helper functions for LangChain configuration
export const getLLMConfig = () => ({
  model: LANGCHAIN_CONFIG.MODEL.NAME,
  temperature: LANGCHAIN_CONFIG.MODEL.TEMPERATURE,
  maxTokens: LANGCHAIN_CONFIG.MODEL.MAX_TOKENS,
  topP: LANGCHAIN_CONFIG.MODEL.TOP_P,
});

export const getAPIConfig = () => ({
  apiKey: LANGCHAIN_CONFIG.API.GROQ_API_KEY,
  timeout: LANGCHAIN_CONFIG.API.TIMEOUT,
  retryAttempts: LANGCHAIN_CONFIG.API.RETRY_ATTEMPTS,
});

export const getPlatformConfig = (platform: string) => {
  const platformKey = platform.toUpperCase() as keyof typeof LANGCHAIN_CONFIG.PLATFORMS;
  return LANGCHAIN_CONFIG.PLATFORMS[platformKey] || null;
};

export const getBudgetAllocation = (totalBudget: number, platforms: string[]) => {
  const allocation: Record<string, number> = {};
  const platformCount = platforms.length;
  const budgetPerPlatform = totalBudget / platformCount;

  platforms.forEach(platform => {
    allocation[platform] = budgetPerPlatform;
  });

  return allocation;
};

export const getOptimizationRecommendations = (performance: any) => {
  const recommendations = [];
  
  if (performance.conversions < LANGCHAIN_CONFIG.OPTIMIZATION.MIN_CONVERSIONS_FOR_OPTIMIZATION) {
    recommendations.push('Increase budget or extend campaign duration to gather more conversion data');
  }
  
  if (performance.spend < LANGCHAIN_CONFIG.OPTIMIZATION.MIN_SPEND_FOR_ANALYSIS) {
    recommendations.push('Increase spend to reach minimum threshold for meaningful analysis');
  }
  
  return recommendations;
}; 