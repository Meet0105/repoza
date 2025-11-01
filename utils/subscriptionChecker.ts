import { connectToDatabase } from '../backend/mongodb';

export interface SubscriptionLimits {
  searches: number;
  boilerplates: number;
  codeConversions: number;
  learningPaths: number;
  setupGuides: number;
  dependencyAnalyzes: number;
  collections: number;
  historyDays: number;
}

export const FREE_LIMITS: SubscriptionLimits = {
  searches: 10,
  boilerplates: 3,
  codeConversions: 0, // Not available in free
  learningPaths: 0, // Not available in free
  setupGuides: 3,
  dependencyAnalyzes: 5,
  collections: 3,
  historyDays: 7
};

export const PRO_LIMITS: SubscriptionLimits = {
  searches: -1, // Unlimited
  boilerplates: -1, // Unlimited
  codeConversions: -1, // Unlimited
  learningPaths: -1, // Unlimited
  setupGuides: -1, // Unlimited
  dependencyAnalyzes: -1, // Unlimited
  collections: -1, // Unlimited
  historyDays: 30
};

export async function getUserSubscription(email: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return { plan: 'free', status: 'inactive' };
    
    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    
    return {
      plan: user?.subscription?.plan || 'free',
      status: user?.subscription?.status || 'inactive',
      razorpaySubscriptionId: user?.subscription?.razorpaySubscriptionId,
      razorpayPaymentId: user?.subscription?.razorpayPaymentId,
      currentPeriodEnd: user?.subscription?.currentPeriodEnd
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { plan: 'free', status: 'inactive' };
  }
}

export async function getUserUsage(email: string, feature: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return 0;
    
    const db = client.db();
    const today = new Date().toISOString().split('T')[0];
    
    const usage = await db.collection('usage').findOne({
      email,
      feature,
      date: today
    });
    
    return usage?.count || 0;
  } catch (error) {
    console.error('Error getting user usage:', error);
    return 0;
  }
}

export async function incrementUsage(email: string, feature: string) {
  try {
    const client = await connectToDatabase();
    if (!client) return;
    
    const db = client.db();
    const today = new Date().toISOString().split('T')[0];
    
    await db.collection('usage').updateOne(
      { email, feature, date: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
}

export async function checkFeatureAccess(email: string, feature: string): Promise<{ allowed: boolean; reason?: string; usage?: number; limit?: number }> {
  try {
    const subscription = await getUserSubscription(email);
    const limits = subscription.plan === 'pro' ? PRO_LIMITS : FREE_LIMITS;
    
    // Get feature limit
    const limit = limits[feature as keyof SubscriptionLimits];
    
    // If unlimited (-1), allow
    if (limit === -1) {
      return { allowed: true };
    }
    
    // If feature not available in plan (limit = 0)
    if (limit === 0) {
      return { 
        allowed: false, 
        reason: `${feature} is only available in Pro plan`,
        usage: 0,
        limit: 0
      };
    }
    
    // Check current usage
    const usage = await getUserUsage(email, feature);
    
    if (usage >= limit) {
      return { 
        allowed: false, 
        reason: `Daily limit reached for ${feature} (${usage}/${limit})`,
        usage,
        limit
      };
    }
    
    return { allowed: true, usage, limit };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return { allowed: false, reason: 'Error checking access' };
  }
}

export function isPro(subscription: any): boolean {
  return subscription?.plan === 'pro' && subscription?.status === 'active';
}

export function isFree(subscription: any): boolean {
  return !subscription || subscription?.plan === 'free' || subscription?.status !== 'active';
}
