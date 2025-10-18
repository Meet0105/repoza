# Design Document - StackBlitz Live Preview

## Overview

The StackBlitz Live Preview feature integrates StackBlitz's WebContainers API to provide instant, browser-based live previews of GitHub repositories. This design leverages StackBlitz's powerful in-browser development environment to run projects without server-side code execution, eliminating security risks and infrastructure costs while providing a seamless user experience.

The system consists of three main layers:
1. **Frontend Components** - User interface for triggering and displaying previews
2. **Backend Services** - Repository analysis, file fetching, and StackBlitz project configuration
3. **Integration Layer** - StackBlitz SDK integration and project management

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Repo Detail  │  │ Preview      │  │  Preview Logs        │  │
│  │ Page         │  │ Modal        │  │  Component           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
          ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/stackblitz/create-project                          │  │
│  │  /api/stackblitz/preview-status                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Framework    │  │ StackBlitz   │  │  Repository          │  │
│  │ Detector     │  │ Fetcher      │  │  File Manager        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
          ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ GitHub API   │  │ StackBlitz   │  │  MongoDB             │  │
│  │              │  │ SDK          │  │  (Tracking)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User clicks "Live Preview" 
    ↓
Frontend sends request to /api/stackblitz/create-project
    ↓
Backend analyzes repository (Framework Detector)
    ↓
Backend fetches files from GitHub (StackBlitz Fetcher)
    ↓
Backend formats files for StackBlitz
    ↓
Backend creates StackBlitz project configuration
    ↓
Frontend receives StackBlitz project ID
    ↓
Frontend embeds StackBlitz using SDK
    ↓
StackBlitz loads in iframe with live preview
    ↓
User interacts with running application
```

## Components and Interfaces

### 1. Frontend Components

#### 1.1 LivePreviewButton Component

**Location:** `components/LivePreviewButton.tsx`

**Purpose:** Trigger button for initiating live previews

**Props:**
```typescript
interface LivePreviewButtonProps {
  owner: string;
  repo: string;
  branch?: string;
  onPreviewStart?: () => void;
  onPreviewReady?: (projectId: string) => void;
  onError?: (error: string) => void;
}
```

**Features:**
- Gradient button design (green-to-blue)
- Loading states with spinner
- Disabled state when preview is loading
- Error handling with tooltips
- Integration with authentication (requires sign-in for private repos)

#### 1.2 LivePreviewModal Component

**Location:** `components/LivePreviewModal.tsx`

**Purpose:** Full-screen modal displaying the StackBlitz preview

**Props:**
```typescript
interface LivePreviewModalProps {
  owner: string;
  repo: string;
  branch?: string;
  onClose: () => void;
}
```

**Features:**
- Full-screen modal with backdrop
- Progress indicators during loading
- Embedded StackBlitz iframe
- Error display with retry options
- Build logs viewer
- Full-screen toggle
- Quick actions (Deploy, Convert, Close)

**State Management:**
```typescript
interface PreviewState {
  status: 'idle' | 'analyzing' | 'fetching' | 'building' | 'ready' | 'error';
  progress: number; // 0-100
  message: string;
  projectId: string | null;
  error: string | null;
  logs: string[];
}
```

#### 1.3 PreviewLogsPanel Component

**Location:** `components/PreviewLogsPanel.tsx`

**Purpose:** Display build logs and errors

**Features:**
- Syntax-highlighted logs
- Auto-scroll to latest log
- Collapsible panel
- Log filtering (errors, warnings, info)
- Copy logs to clipboard

### 2. Backend Services

#### 2.1 Framework Detector Service

**Location:** `backend/frameworkDetector.ts`

**Purpose:** Analyze repository and detect framework/language

**Interface:**
```typescript
interface FrameworkDetectionResult {
  framework: string; // 'nextjs', 'react', 'vue', 'angular', etc.
  language: string; // 'typescript', 'javascript', 'python', etc.
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  buildCommand: string;
  startCommand: string;
  devCommand: string;
  installCommand: string;
  template: string; // StackBlitz template name
  supported: boolean;
  confidence: number; // 0-100
}

async function detectFramework(
  owner: string,
  repo: string,
  branch?: string
): Promise<FrameworkDetectionResult>
```

**Detection Logic:**
1. Fetch `package.json` from GitHub
2. Analyze dependencies:
   - `next` → Next.js
   - `react` + `vite` → React + Vite
   - `vue` → Vue.js
   - `@angular/core` → Angular
   - `svelte` → Svelte
   - `express` → Node.js/Express
3. Check for config files:
   - `next.config.js` → Next.js
   - `vite.config.js` → Vite
   - `angular.json` → Angular
4. Fallback to static HTML if no framework detected
5. Return confidence score based on detection method

**Supported Frameworks:**
```typescript
const SUPPORTED_FRAMEWORKS = {
  nextjs: {
    template: 'node',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    devCommand: 'npm run dev',
  },
  react: {
    template: 'create-react-app',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    devCommand: 'npm start',
  },
  'react-vite': {
    template: 'vite-react',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm run preview',
    devCommand: 'npm run dev',
  },
  vue: {
    template: 'vue',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm run serve',
    devCommand: 'npm run dev',
  },
  angular: {
    template: 'angular',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    devCommand: 'ng serve',
  },
  svelte: {
    template: 'svelte',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    devCommand: 'npm run dev',
  },
  nodejs: {
    template: 'node',
    installCommand: 'npm install',
    buildCommand: '',
    startCommand: 'node index.js',
    devCommand: 'node index.js',
  },
  static: {
    template: 'html',
    installCommand: '',
    buildCommand: '',
    startCommand: '',
    devCommand: '',
  },
};
```

#### 2.2 StackBlitz Fetcher Service

**Location:** `backend/stackblitzFetcher.ts`

**Purpose:** Fetch repository files and format for StackBlitz

**Interface:**
```typescript
interface StackBlitzFile {
  path: string;
  content: string;
}

interface FetchResult {
  files: Record<string, string>; // path -> content
  totalFiles: number;
  totalSize: number; // in bytes
  excluded: string[];
}

async function fetchRepoForStackBlitz(
  owner: string,
  repo: string,
  branch?: string,
  accessToken?: string
): Promise<FetchResult>
```

**File Fetching Logic:**
1. Get repository tree from GitHub API
2. Filter files:
   - **Include:** `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.html`, `.css`, `.md`, `.vue`, `.svelte`
   - **Exclude:** `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `.cache/`, binary files
3. Limit to 50 files maximum (configurable)
4. Limit total size to 10MB (configurable)
5. Fetch file contents in parallel (batch of 10)
6. Format as StackBlitz file structure

**File Exclusion Patterns:**
```typescript
const EXCLUDE_PATTERNS = [
  'node_modules/',
  '.git/',
  'dist/',
  'build/',
  '.next/',
  '.cache/',
  'coverage/',
  '.vercel/',
  '.env',
  '.env.local',
  '*.log',
  '*.lock',
  'yarn.lock',
  'package-lock.json',
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.gif',
  '*.svg',
  '*.ico',
  '*.woff',
  '*.woff2',
  '*.ttf',
  '*.eot',
];
```

#### 2.3 StackBlitz Project Generator

**Location:** `backend/stackblitzGenerator.ts`

**Purpose:** Generate StackBlitz project configuration

**Interface:**
```typescript
interface StackBlitzProject {
  title: string;
  description: string;
  template: string;
  files: Record<string, string>;
  dependencies?: Record<string, string>;
  settings?: {
    compile?: {
      trigger?: 'auto' | 'keystroke' | 'save';
      action?: 'hmr' | 'refresh';
      clearConsole?: boolean;
    };
  };
}

async function generateStackBlitzProject(
  owner: string,
  repo: string,
  frameworkInfo: FrameworkDetectionResult,
  files: Record<string, string>
): Promise<StackBlitzProject>
```

**Project Configuration:**
```typescript
const project: StackBlitzProject = {
  title: `${owner}/${repo}`,
  description: `Live preview of ${owner}/${repo}`,
  template: frameworkInfo.template,
  files: {
    ...files,
    // Add custom files if needed
    'README.md': `# ${repo}\n\nLive preview powered by Repoza`,
  },
  dependencies: extractDependencies(files['package.json']),
  settings: {
    compile: {
      trigger: 'auto',
      action: 'hmr',
      clearConsole: false,
    },
  },
};
```

### 3. API Endpoints

#### 3.1 Create StackBlitz Project

**Endpoint:** `POST /api/stackblitz/create-project`

**Request Body:**
```typescript
interface CreateProjectRequest {
  owner: string;
  repo: string;
  branch?: string;
}
```

**Response:**
```typescript
interface CreateProjectResponse {
  success: boolean;
  projectId: string;
  embedUrl: string;
  framework: string;
  filesCount: number;
  error?: string;
}
```

**Implementation Flow:**
1. Validate request parameters
2. Check authentication for private repos
3. Detect framework using Framework Detector
4. Check if framework is supported
5. Fetch files using StackBlitz Fetcher
6. Generate StackBlitz project configuration
7. Create project using StackBlitz SDK
8. Log preview creation in MongoDB
9. Return project ID and embed URL

#### 3.2 Preview Status

**Endpoint:** `GET /api/stackblitz/preview-status?projectId={id}`

**Response:**
```typescript
interface PreviewStatusResponse {
  status: 'building' | 'ready' | 'error';
  logs: string[];
  error?: string;
}
```

#### 3.3 Cleanup Previews

**Endpoint:** `POST /api/stackblitz/cleanup-previews`

**Purpose:** Background job to clean up old preview records

**Logic:**
- Delete preview records older than 30 minutes
- Run every 15 minutes via cron or manual trigger

### 4. Database Schema

#### Preview Tracking Collection

**Collection:** `stackblitz_previews`

**Schema:**
```typescript
interface StackBlitzPreview {
  _id: ObjectId;
  projectId: string;
  repoId: string; // "owner/repo"
  owner: string;
  repo: string;
  branch: string;
  framework: string;
  userId?: string; // If authenticated
  createdAt: Date;
  closedAt?: Date;
  status: 'created' | 'ready' | 'error' | 'closed';
  filesCount: number;
  loadTime: number; // milliseconds
  error?: string;
}
```

**Indexes:**
```typescript
{
  projectId: 1,
  repoId: 1,
  createdAt: 1,
  userId: 1,
}
```

## Data Models

### StackBlitz SDK Integration

**Installation:**
```bash
npm install @stackblitz/sdk
```

**Usage:**
```typescript
import sdk from '@stackblitz/sdk';

// Embed project in iframe
const vm = await sdk.embedProject(
  'preview-container',
  {
    title: 'My Project',
    description: 'Project description',
    template: 'node',
    files: {
      'index.js': 'console.log("Hello World");',
      'package.json': '{"name": "my-project"}',
    },
  },
  {
    openFile: 'index.js',
    view: 'preview',
    height: 600,
    hideNavigation: false,
    hideDevTools: false,
  }
);

// Open in new window
sdk.openProject(
  {
    title: 'My Project',
    template: 'node',
    files: { /* ... */ },
  },
  {
    newWindow: true,
  }
);
```

## Error Handling

### Error Types and Handling Strategy

#### 1. Framework Detection Errors

**Error:** Unsupported framework detected

**Handling:**
- Display list of supported frameworks
- Suggest closest match
- Offer "Open on StackBlitz" fallback link
- Log for analytics

**User Message:**
```
⚠️ Framework Not Supported

This repository uses [detected framework], which isn't currently supported for live preview.

Supported frameworks:
• Next.js
• React (Vite)
• Vue.js
• Angular
• Svelte
• Node.js/Express
• Static HTML

You can still view this project on StackBlitz directly.
```

#### 2. File Fetching Errors

**Error:** Repository too large or rate limit exceeded

**Handling:**
- Show file count and size limits
- Suggest viewing on GitHub
- Implement caching for repeated requests
- Use authenticated requests to increase rate limits

**User Message:**
```
⚠️ Repository Too Large

This repository has too many files for live preview.

Limits:
• Maximum 50 files
• Maximum 10MB total size

Current repository:
• 150 files
• 25MB total size

Try viewing specific files or opening on GitHub.
```

#### 3. Build Errors

**Error:** Project fails to build in StackBlitz

**Handling:**
- Display build logs
- Highlight error lines
- Suggest common fixes
- Offer to open in StackBlitz for debugging

**User Message:**
```
❌ Build Failed

The project encountered errors during build:

Error: Cannot find module 'react'
  at index.tsx:1:1

Common fixes:
• Check package.json dependencies
• Ensure all imports are correct
• Try opening in StackBlitz for full debugging
```

#### 4. Authentication Errors

**Error:** Private repository requires authentication

**Handling:**
- Prompt user to sign in
- Request GitHub OAuth permissions
- Retry with access token

**User Message:**
```
🔒 Authentication Required

This is a private repository. Please sign in with GitHub to preview.

[Sign In with GitHub]
```

#### 5. Network Errors

**Error:** GitHub API or StackBlitz unavailable

**Handling:**
- Show retry button
- Display error details
- Suggest checking internet connection
- Log for monitoring

**User Message:**
```
🌐 Connection Error

Failed to connect to GitHub API.

• Check your internet connection
• GitHub may be experiencing issues
• Try again in a few moments

[Retry]
```

## Testing Strategy

### 1. Unit Tests

**Framework Detector Tests:**
```typescript
describe('Framework Detector', () => {
  test('detects Next.js from package.json', async () => {
    const result = await detectFramework('vercel', 'next.js');
    expect(result.framework).toBe('nextjs');
    expect(result.supported).toBe(true);
  });

  test('detects React + Vite', async () => {
    const result = await detectFramework('vitejs', 'vite-react-template');
    expect(result.framework).toBe('react-vite');
  });

  test('returns unsupported for unknown framework', async () => {
    const result = await detectFramework('user', 'custom-framework');
    expect(result.supported).toBe(false);
  });
});
```

**StackBlitz Fetcher Tests:**
```typescript
describe('StackBlitz Fetcher', () => {
  test('fetches and filters files correctly', async () => {
    const result = await fetchRepoForStackBlitz('facebook', 'react');
    expect(result.files).toBeDefined();
    expect(result.excluded).toContain('node_modules/');
  });

  test('respects file size limits', async () => {
    const result = await fetchRepoForStackBlitz('large', 'repo');
    expect(result.totalSize).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### 2. Integration Tests

**API Endpoint Tests:**
```typescript
describe('POST /api/stackblitz/create-project', () => {
  test('creates project for supported framework', async () => {
    const response = await request(app)
      .post('/api/stackblitz/create-project')
      .send({ owner: 'vercel', repo: 'next.js' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.projectId).toBeDefined();
  });

  test('returns error for unsupported framework', async () => {
    const response = await request(app)
      .post('/api/stackblitz/create-project')
      .send({ owner: 'user', repo: 'unsupported' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('not supported');
  });
});
```

### 3. End-to-End Tests

**User Flow Tests:**
```typescript
describe('Live Preview E2E', () => {
  test('complete preview flow', async () => {
    // Navigate to repo page
    await page.goto('/repo/vercel/next.js');

    // Click Live Preview button
    await page.click('[data-testid="live-preview-button"]');

    // Wait for modal
    await page.waitForSelector('[data-testid="preview-modal"]');

    // Wait for preview to load
    await page.waitForSelector('iframe[data-stackblitz]');

    // Verify preview is interactive
    const iframe = await page.$('iframe[data-stackblitz]');
    expect(iframe).toBeDefined();
  });
});
```

### 4. Performance Tests

**Load Time Tests:**
- Measure time from button click to preview ready
- Target: < 10 seconds for typical repos
- Monitor GitHub API response times
- Track StackBlitz embedding performance

**Concurrent Request Tests:**
- Test multiple simultaneous preview requests
- Verify no performance degradation
- Check rate limit handling

## Security Considerations

### 1. Access Control

- **Private Repositories:** Require GitHub OAuth authentication
- **Access Tokens:** Store securely in session, never expose in client
- **Token Validation:** Verify token has required permissions before fetching files

### 2. Code Execution Safety

- **Browser Sandboxing:** StackBlitz runs code in isolated WebContainers
- **No Server Execution:** All code runs client-side in browser
- **Resource Limits:** StackBlitz enforces memory and CPU limits

### 3. Rate Limiting

- **GitHub API:** Implement caching to reduce API calls
- **Preview Creation:** Limit previews per user per hour
- **Authenticated Requests:** Use user tokens for higher rate limits

### 4. Data Privacy

- **No Code Storage:** Files are not stored on Repoza servers
- **Temporary Processing:** Files are processed in memory only
- **User Data:** Preview logs contain no sensitive information

## Performance Optimization

### 1. Caching Strategy

**Repository Metadata Cache:**
```typescript
// Cache framework detection results
const cacheKey = `framework:${owner}/${repo}:${branch}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache for 1 hour
await redis.setex(cacheKey, 3600, JSON.stringify(result));
```

**File Content Cache:**
```typescript
// Cache file contents for popular repos
const cacheKey = `files:${owner}/${repo}:${branch}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache for 30 minutes
await redis.setex(cacheKey, 1800, JSON.stringify(files));
```

### 2. Parallel Processing

**Concurrent File Fetching:**
```typescript
// Fetch files in batches of 10
const batches = chunk(filePaths, 10);
const results = [];

for (const batch of batches) {
  const batchResults = await Promise.all(
    batch.map(path => fetchFileContent(owner, repo, path))
  );
  results.push(...batchResults);
}
```

### 3. Progressive Loading

**Staged Preview Loading:**
1. Show modal immediately with "Analyzing..." message
2. Update to "Fetching files..." with progress bar
3. Update to "Building project..." with percentage
4. Display preview when ready

### 4. Resource Optimization

**File Size Limits:**
- Maximum 50 files per preview
- Maximum 10MB total size
- Exclude large binary files automatically

**Network Optimization:**
- Compress file contents before sending to frontend
- Use GitHub's raw content API for faster fetching
- Implement request debouncing for repeated previews

## Integration with Existing Features

### 1. Repository Detail Page

**Button Placement:**
- Add "Live Preview" button next to "Deploy to Vercel" and "Convert Code"
- Use consistent styling with gradient background
- Show loading state during preview creation

**Quick Actions:**
- After successful preview, show "Deploy This" button
- Link to Code Converter with pre-filled data
- Suggest AI Q&A for understanding the code

### 2. Search Results

**Preview Icon:**
- Add eye icon (👁️) to repository cards
- Show on hover for quick access
- Open preview in modal without navigation

### 3. Code Converter Integration

**Preview Before/After:**
- Show original code preview
- Show converted code preview side-by-side
- Allow comparison before downloading

### 4. Deployment Integration

**Preview → Deploy Flow:**
- Add "Deploy This Preview" button in preview modal
- Pre-fill deployment form with preview data
- Seamless transition from preview to production

## Monitoring and Analytics

### 1. Metrics to Track

**Usage Metrics:**
- Total previews created
- Previews per framework
- Success rate
- Average load time
- User engagement (time spent in preview)

**Error Metrics:**
- Framework detection failures
- File fetching errors
- Build failures
- Rate limit hits

**Performance Metrics:**
- API response times
- GitHub API latency
- StackBlitz embedding time
- Total preview creation time

### 2. Logging Strategy

**Preview Creation Log:**
```typescript
{
  event: 'preview_created',
  timestamp: new Date(),
  repoId: 'owner/repo',
  framework: 'nextjs',
  filesCount: 25,
  totalSize: 1024000,
  loadTime: 5432,
  userId: 'user123',
  success: true,
}
```

**Error Log:**
```typescript
{
  event: 'preview_error',
  timestamp: new Date(),
  repoId: 'owner/repo',
  error: 'Framework not supported',
  errorCode: 'UNSUPPORTED_FRAMEWORK',
  userId: 'user123',
}
```

### 3. Admin Dashboard Integration

**Preview Statistics Panel:**
- Total previews today/week/month
- Most previewed repositories
- Framework distribution chart
- Success rate trend
- Average load time graph

## Future Enhancements

### Phase 2 Features

1. **Custom Configuration:**
   - Allow users to specify build commands
   - Custom environment variables
   - Framework version selection

2. **Collaborative Previews:**
   - Share preview links with others
   - Real-time collaboration in StackBlitz
   - Comment on specific lines

3. **Preview History:**
   - Save preview sessions
   - Quick re-open previous previews
   - Compare different versions

4. **Advanced Frameworks:**
   - Python (Pyodide)
   - Rust (WASM)
   - Go (TinyGo)
   - Mobile frameworks (React Native preview)

5. **Performance Improvements:**
   - Predictive pre-loading for popular repos
   - CDN caching for common dependencies
   - Incremental file fetching

6. **Enhanced Debugging:**
   - Integrated console
   - Network inspector
   - Performance profiler
   - Source maps support

## Conclusion

This design provides a comprehensive, secure, and performant solution for live repository previews using StackBlitz. The browser-based execution model eliminates security concerns while providing an excellent user experience. The modular architecture allows for easy testing, maintenance, and future enhancements.

Key benefits:
- ✅ Zero server-side code execution (secure)
- ✅ No infrastructure costs (browser-based)
- ✅ Instant previews (< 10 seconds)
- ✅ Supports major frameworks
- ✅ Seamless integration with existing features
- ✅ Comprehensive error handling
- ✅ Performance optimized with caching
- ✅ Full monitoring and analytics
