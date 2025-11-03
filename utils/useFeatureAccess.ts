import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Feature, isFeatureAvailable } from './featureGates';

export function useFeatureAccess(feature: Feature) {
  const { data: session } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!session?.user?.email) {
        setIsPro(false);
        setHasAccess(isFeatureAvailable(feature, false));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/subscription/status');
        const data = await response.json();
        
        const userIsPro = data.isPro || false;
        setIsPro(userIsPro);
        setHasAccess(isFeatureAvailable(feature, userIsPro));
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsPro(false);
        setHasAccess(isFeatureAvailable(feature, false));
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, [session, feature]);

  return { hasAccess, isPro, loading };
}
