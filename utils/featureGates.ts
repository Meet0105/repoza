// Feature gates for subscription-based access control

export type Feature = 
  | 'code-converter'
  | 'learning-path'
  | 'repo-qa'
  | 'live-preview'
  | 'one-click-deploy'
  | 'dependency-analyzer'
  | 'code-explanation'
  | 'chatbot'
  | 'collections'
  | 'setup-guide';

export const FEATURE_CONFIG: Record<Feature, {
  name: string;
  description: string;
  requiresPro: boolean;
}> = {
  'code-converter': {
    name: 'Code Converter',
    description: 'Convert code between different languages and frameworks',
    requiresPro: true
  },
  'learning-path': {
    name: 'Learning Path',
    description: 'Generate personalized learning paths for repositories',
    requiresPro: true
  },
  'repo-qa': {
    name: 'Repository Q&A',
    description: 'Ask questions about repository code and get AI-powered answers',
    requiresPro: true
  },
  'live-preview': {
    name: 'Live Preview',
    description: 'Preview repositories live in StackBlitz',
    requiresPro: true
  },
  'one-click-deploy': {
    name: 'One-Click Deploy',
    description: 'Deploy repositories to Vercel with one click',
    requiresPro: true
  },
  'dependency-analyzer': {
    name: 'Dependency Analyzer',
    description: 'Analyze and visualize project dependencies',
    requiresPro: false // Free feature
  },
  'code-explanation': {
    name: 'Code Explanation',
    description: 'Get AI-powered explanations of code snippets',
    requiresPro: false // Free feature
  },
  'chatbot': {
    name: 'AI Chatbot',
    description: 'Chat with AI about repositories and code',
    requiresPro: false // Free feature
  },
  'collections': {
    name: 'Collections',
    description: 'Organize repositories into collections',
    requiresPro: false // Free feature
  },
  'setup-guide': {
    name: 'Setup Guide',
    description: 'Generate setup guides for repositories',
    requiresPro: false // Free feature
  }
};

export function isFeatureAvailable(feature: Feature, isPro: boolean): boolean {
  const config = FEATURE_CONFIG[feature];
  if (!config) return false;
  
  // If feature doesn't require pro, it's available to everyone
  if (!config.requiresPro) return true;
  
  // If feature requires pro, check if user is pro
  return isPro;
}

export function getUnavailableFeatureMessage(feature: Feature): string {
  const config = FEATURE_CONFIG[feature];
  return `${config.name} is a Pro feature. Upgrade to Pro to unlock this feature!`;
}

export function getProFeatures(): Feature[] {
  return Object.entries(FEATURE_CONFIG)
    .filter(([_, config]) => config.requiresPro)
    .map(([feature]) => feature as Feature);
}

export function getFreeFeatures(): Feature[] {
  return Object.entries(FEATURE_CONFIG)
    .filter(([_, config]) => !config.requiresPro)
    .map(([feature]) => feature as Feature);
}
