# Feature Gates Implementation Guide

## Overview

Feature gates restrict access to premium features based on user subscription status. Free users can access basic features, while Pro users get unlimited access to all premium features.

## Features Classification

### 🔒 Pro Features (Requires Subscription)
1. **Code Converter** - Convert code between languages/frameworks
2. **Learning Path** - Generate personalized learning paths
3. **Repository Q&A** - Ask questions about repository code
4. **Live Preview** - Preview repositories in StackBlitz
5. **One-Click Deploy** - Deploy to Vercel with one click

### 🆓 Free Features (Available to All)
1. **Dependency Analyzer** - Analyze project dependencies
2. **Code Explanation** - Get AI explanations of code
3. **AI Chatbot** - Chat with AI about repositories
4. **Collections** - Organize repositories
5. **Setup Guide** - Generate setup guides

## Implementation

### 1. Feature Configuration (`utils/featureGates.ts`)

```typescript
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
  // ... more features
};
```

### 2. Client-Side Hook (`utils/useFeatureAccess.ts`)

Use this hook in React components to check feature access:

```typescript
import { useFeatureAccess } from '../utils/useFeatureAccess';

function MyComponent() {
  const { hasAccess, isPro, loading } = useFeatureAccess('code-converter');
  
  if (!loading && !hasAccess) {
    return <UpgradePrompt feature="code-converter" />;
  }
  
  // Render feature UI
}
```

### 3. Server-Side Gate (`utils/apiFeatureGate.ts`)

Use this in API routes to protect endpoints:

```typescript
import { requireFeatureAccess } from '../../utils/apiFeatureGate';

export default async function handler(req, res) {
  // Check feature access
  const access = await requireFeatureAccess(req, res, 'code-converter');
  if (!access) return; // Response already sent with 403
  
  // Continue with API logic
}
```

### 4. Upgrade Prompt Component (`components/UpgradePrompt.tsx`)

Two display modes:

**Modal Mode:**
```typescript
<UpgradePrompt 
  feature="code-converter" 
  onClose={() => setShowModal(false)} 
/>
```

**Inline Mode:**
```typescript
<UpgradePrompt 
  feature="code-converter" 
  inline 
/>
```

## Protected Components

### Code Converter Modal
- Shows upgrade prompt if user is not Pro
- Blocks conversion API calls

### Live Preview Modal
- Shows upgrade prompt before loading preview
- Blocks StackBlitz API calls

### Repository Q&A
- Shows inline upgrade prompt
- Blocks Q&A API calls

### Learning Path Page
- Shows full-page upgrade prompt
- Blocks learning path generation

### Deploy Button
- Changes to "Upgrade to Deploy" button
- Shows upgrade modal on click
- Blocks deployment API calls

## API Routes Protected

1. `/api/convert-code` - Code Converter
2. `/api/generate-learning-path` - Learning Path
3. `/api/repo-qa` - Repository Q&A
4. `/api/stackblitz/create-project` - Live Preview
5. `/api/deploy-repo` - Deploy Existing Repo
6. `/api/deploy-boilerplate` - Deploy Generated Code

## Error Responses

When a free user tries to access a Pro feature, the API returns:

```json
{
  "error": "Code Converter is a Pro feature. Upgrade to Pro to unlock this feature!",
  "requiresPro": true,
  "feature": "code-converter"
}
```

Status Code: `403 Forbidden`

## User Experience Flow

### Free User Accessing Pro Feature

1. **Click on Pro Feature** (e.g., "Convert Code" button)
2. **Modal/Inline Prompt Appears** with:
   - Feature name and description
   - List of Pro features
   - "Upgrade to Pro" button
   - "Maybe Later" option (for modals)
3. **Click "Upgrade to Pro"** → Redirected to `/pricing`
4. **Complete Payment** → Subscription activated
5. **Return to Feature** → Full access granted

### Pro User Accessing Features

1. **Click on Any Feature** → Works immediately
2. **No Prompts or Restrictions**
3. **Unlimited Usage**

## Testing

### Test as Free User

1. Sign out or use account without subscription
2. Try accessing:
   - Code Converter → Should show upgrade prompt
   - Learning Path → Should show upgrade prompt
   - Live Preview → Should show upgrade prompt
   - Deploy → Button should say "Upgrade to Deploy"
   - Repo Q&A → Should show inline upgrade prompt

### Test as Pro User

1. Sign in with Pro subscription
2. All features should work without prompts
3. No "Upgrade" buttons or messages

## Adding New Pro Features

1. **Add to Feature Type:**
```typescript
// utils/featureGates.ts
export type Feature = 
  | 'existing-features'
  | 'new-feature'; // Add here
```

2. **Add to Configuration:**
```typescript
export const FEATURE_CONFIG = {
  'new-feature': {
    name: 'New Feature',
    description: 'Description of the feature',
    requiresPro: true // or false for free
  }
};
```

3. **Protect API Route:**
```typescript
// pages/api/new-feature.ts
import { requireFeatureAccess } from '../../utils/apiFeatureGate';

export default async function handler(req, res) {
  const access = await requireFeatureAccess(req, res, 'new-feature');
  if (!access) return;
  
  // Feature logic
}
```

4. **Add UI Gate:**
```typescript
// components/NewFeature.tsx
import { useFeatureAccess } from '../utils/useFeatureAccess';
import UpgradePrompt from './UpgradePrompt';

export default function NewFeature() {
  const { hasAccess, loading } = useFeatureAccess('new-feature');
  
  if (!loading && !hasAccess) {
    return <UpgradePrompt feature="new-feature" inline />;
  }
  
  return <div>Feature UI</div>;
}
```

## Benefits

✅ **Clear Monetization** - Users know what they get with Pro
✅ **Smooth UX** - Upgrade prompts are contextual and helpful
✅ **Secure** - Both client and server-side protection
✅ **Flexible** - Easy to add/remove features from Pro tier
✅ **Consistent** - Same upgrade experience across all features

## Pricing Page Integration

The upgrade prompts link to `/pricing` where users can:
- See all Pro features
- Compare Free vs Pro plans
- Subscribe with Stripe
- Choose currency (USD, INR, EUR, GBP)

After successful payment:
- User is redirected to success page
- Subscription is activated in database
- All Pro features become immediately available
- Success notification appears on pricing page

## Notes

- Feature gates are checked on every request (no caching)
- Subscription status is fetched from MongoDB
- Stripe webhooks keep subscription status in sync
- Free users see upgrade prompts, not error messages
- Pro users never see upgrade prompts
