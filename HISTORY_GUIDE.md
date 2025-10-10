# History/Saved Page - Complete Guide

## 🚀 Overview
The History page provides users with a personal dashboard of their activity, including past searches, visited repos, and generated boilerplates.

## 📍 Route
`/history`

## ✨ Features

### 1. Three-Tab Interface
- **Searches Tab**: View all past search queries
- **Repos Tab**: See all repositories you've visited
- **Boilerplates Tab**: Access all generated projects

### 2. Automatic Tracking
All user activity is automatically saved:
- Search queries when you search
- Repo details when you visit a repo page
- Boilerplate configs when you generate a project

### 3. Quick Actions
- **Searches**: Click to re-run the same search
- **Repos**: Click to revisit the repo details page
- **Boilerplates**: Download the same configuration again

### 4. History Management
- Clear individual sections (Searches, Repos, or Boilerplates)
- Clear all history at once
- Timestamps showing when each action occurred

## 🔧 Technical Implementation

### Storage Method
Uses **localStorage** for guest mode (no authentication required):
- `repoza_search_history` - Search queries
- `repoza_repo_history` - Visited repositories
- `repoza_boilerplate_history` - Generated boilerplates

### Data Structures

**Search History Item:**
```typescript
{
  type: 'search',
  query: string,
  resultsCount?: number,
  createdAt: string (ISO date)
}
```

**Repo History Item:**
```typescript
{
  type: 'repo',
  owner: string,
  repo: string,
  url: string,
  description: string,
  language: string,
  stars: number,
  createdAt: string (ISO date)
}
```

**Boilerplate History Item:**
```typescript
{
  type: 'boilerplate',
  framework: string,
  language: string,
  features: string[],
  fileName: string,
  createdAt: string (ISO date)
}
```

### Utility Functions (`utils/history.ts`)

**Save Functions:**
- `saveSearchHistory(query, resultsCount?)`
- `saveRepoHistory(repoData)`
- `saveBoilerplateHistory(boilerplateData)`

**Get Functions:**
- `getSearchHistory()` → SearchHistoryItem[]
- `getRepoHistory()` → RepoHistoryItem[]
- `getBoilerplateHistory()` → BoilerplateHistoryItem[]

**Clear Functions:**
- `clearSearchHistory()`
- `clearRepoHistory()`
- `clearBoilerplateHistory()`
- `clearAllHistory()`

## 🔗 Integration Points

### 1. Home Page (`pages/index.tsx`)
- Added "View History" button in header
- Saves search queries automatically when user searches
- Imports: `saveSearchHistory`

### 2. Repo Details Page (`pages/repo/[owner]/[repo].tsx`)
- Saves repo data when page loads
- Prevents duplicates (checks if already saved)
- Imports: `saveRepoHistory`

### 3. Generator Page (`pages/generator.tsx`)
- Saves boilerplate config after successful generation
- Includes framework, language, features, and filename
- Imports: `saveBoilerplateHistory`

## 🎨 UI Features

### Tabbed Navigation
- Clean tab interface to switch between history types
- Shows count of items in each tab
- Active tab highlighted with purple border

### Search History Display
- List view with search icon
- Shows query text and result count
- Click to re-run search
- Relative timestamps (e.g., "2h ago", "3d ago")

### Repo History Display
- Grid layout (2 columns on desktop)
- Repo cards with:
  - Owner/repo name
  - Language badge
  - Description
  - Star count
  - Timestamp
- Click to visit repo details page

### Boilerplate History Display
- List view with detailed cards
- Shows:
  - Framework name
  - Language badge
  - Feature badges
  - Filename
  - Timestamp
- "Download Again" button to regenerate

### Empty States
- Friendly messages when no history exists
- Relevant icons for each section
- Encourages users to start using features

### Clear Actions
- Section-specific clear buttons
- "Clear All" button in header
- Confirmation dialog for clearing all

## 📱 Responsive Design
- Mobile-friendly layout
- Stacks repo cards on small screens
- Touch-friendly buttons and tabs

## ⏰ Timestamp Formatting
Smart relative time display:
- "Just now" - less than 1 minute
- "5m ago" - minutes
- "2h ago" - hours
- "3d ago" - days
- Full date - older than 7 days

## 🚀 User Flow Examples

### Viewing Search History
1. User visits `/history`
2. Searches tab is active by default
3. Sees list of past searches
4. Clicks a search → redirected to home with that query

### Revisiting a Repo
1. User clicks "Repos" tab
2. Sees grid of visited repositories
3. Clicks a repo card → opens repo details page

### Re-downloading a Boilerplate
1. User clicks "Boilerplates" tab
2. Sees list of generated projects
3. Clicks "Download Again" → regenerates and downloads ZIP

### Clearing History
1. User clicks "Clear All" button
2. Confirmation dialog appears
3. Confirms → all history cleared
4. Empty states shown in all tabs

## 💾 Storage Limits
- Maximum 50 items per category (configurable)
- Oldest items automatically removed when limit reached
- Prevents localStorage from growing too large

## 🔮 Future Enhancements
- MongoDB integration for logged-in users
- Sync across devices
- Export history as JSON
- Search within history
- Favorite/pin important items
- Analytics dashboard (most searched terms, etc.)
- Share history with team members

## 🎯 Benefits
- **Convenience**: Quick access to past work
- **Productivity**: Re-run searches without retyping
- **Reference**: Keep track of interesting repos
- **Efficiency**: Regenerate boilerplates easily
- **Personal**: Customized experience for each user
