// Subscription utility functions

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionLimits {
  searchesPerDay: number;
  boilerplatesPerDay: number;
  collectionsMax: number;
  codeConverterPerDay: number;
  learningPathsPerMonth: number;
  setupGuidesPerDay: number;
  dependencyAnalyzerPerDay: number;
  historyDays: number;
  hasRepoQA: boolean;
  hasLivePreview: boolean;
  hasDeploy: boolean;
  hasUnlimitedSearch: boolean;
  hasUnlimitedBoilerplate: boolean;
  hasUnlimitedCollections: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    searchesPerDay: 10,
    boilerplatesPerDay: 3,
    collectionsMax: 3,
    codeConverterPerDay: 0, // Not available
    learningPathsPerMonth: 0, // Not available
    setupGuidesPerDay: 3,
    dependencyAnalyzerPerDay: 5,
    historyDays: 7,
    hasRepoQA: false,
    hasLivePreview: false,
    hasDeploy: false,
    hasUnlimitedSearch: false,
    hasUnlimitedBoilerplate: false,
    hasUnlimitedCollections: false,
  },
  pro: {
    searchesPerDay: -1, // Unlimited
    boilerplatesPerDay: -1, // Unlimited
    collectionsMax: -1, // Unlimited
    codeConverterPerDay: -1, // Unlimited
    learningPathsPerMonth: -1, // Unlimited
    setupGuidesPerDay: -1, // Unlimited
    dependencyAnalyzerPerDay: -1, // Unlimited
    historyDays: 30,
    hasRepoQA: true,
    hasLivePreview: true,
    hasDeploy: true,
    hasUnlimitedSearch: true,
    hasUnlimitedBoilerplate: true,
    hasUnlimitedCollections: true,
  },
};

export const SUBSCRIPTION_PRICES = {
  pro: {
    monthly: 9.99,
    yearly: 99.99, // Save 2 months
  },
};

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof SubscriptionLimits
): boolean {
  const limits = SUBSCRIPTION_LIMITS[tier];
  const value = limits[feature];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  return value === -1 || value > 0;
}

/**
 * Check if user has reached their limit
 */
export function hasReachedLimit(
  tier: SubscriptionTier,
  feature: keyof SubscriptionLimits,
  currentUsage: number
): boolean {
  const limits = SUBSCRIPTION_LIMITS[tier];
  const limit = limits[feature];
  
  if (typeof limit === 'boolean') {
    return !limit;
  }
  
  if (limit === -1) {
    return false; // Unlimited
  }
  
  return currentUsage >= limit;
}

/**
 * Get remaining usage for a feature
 */
export function getRemainingUsage(
  tier: SubscriptionTier,
  feature: keyof SubscriptionLimits,
  currentUsage: number
): number | 'unlimited' {
  const limits = SUBSCRIPTION_LIMITS[tier];
  const limit = limits[feature];
  
  if (typeof limit === 'boolean') {
    return limit ? 'unlimited' : 0;
  }
  
  if (limit === -1) {
    return 'unlimited';
  }
  
  return Math.max(0, limit - currentUsage);
}
