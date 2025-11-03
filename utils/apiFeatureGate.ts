import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { checkSubscriptionStatus } from './subscriptionChecker';
import { Feature, isFeatureAvailable, getUnavailableFeatureMessage } from './featureGates';

export async function checkFeatureAccess(
    req: NextApiRequest,
    res: NextApiResponse,
    feature: Feature
): Promise<{ hasAccess: boolean; isPro: boolean; email?: string }> {
    // Get session
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        // Not logged in - check if feature is free
        const hasAccess = isFeatureAvailable(feature, false);
        return { hasAccess, isPro: false };
    }

    // Check subscription status
    const { isPro } = await checkSubscriptionStatus(session.user.email);

    // Check if user has access to this feature
    const hasAccess = isFeatureAvailable(feature, isPro);

    return { hasAccess, isPro, email: session.user.email };
}

export async function requireFeatureAccess(
    req: NextApiRequest,
    res: NextApiResponse,
    feature: Feature
): Promise<{ isPro: boolean; email: string } | null> {
    const { hasAccess, isPro, email } = await checkFeatureAccess(req, res, feature);

    if (!hasAccess) {
        res.status(403).json({
            error: getUnavailableFeatureMessage(feature),
            requiresPro: true,
            feature
        });
        return null;
    }

    if (!email) {
        res.status(401).json({
            error: 'Authentication required'
        });
        return null;
    }

    return { isPro, email };
}
