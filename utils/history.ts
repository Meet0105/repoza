// Client-side history management using localStorage

export interface SearchHistoryItem {
  type: 'search';
  query: string;
  resultsCount?: number;
  createdAt: string;
}

export interface RepoHistoryItem {
  type: 'repo';
  owner: string;
  repo: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  createdAt: string;
}

export interface BoilerplateHistoryItem {
  type: 'boilerplate';
  framework: string;
  language: string;
  features: string[];
  fileName: string;
  createdAt: string;
}

export type HistoryItem = SearchHistoryItem | RepoHistoryItem | BoilerplateHistoryItem;

const STORAGE_KEYS = {
  SEARCH: 'repoza_search_history',
  REPO: 'repoza_repo_history',
  BOILERPLATE: 'repoza_boilerplate_history',
};

// Generic save function
function saveToHistory<T>(key: string, item: T, maxItems = 50) {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [item, ...existing].slice(0, maxItems);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

// Generic get function
function getFromHistory<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

// Generic clear function
function clearHistory(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// Search History
export function saveSearchHistory(query: string, resultsCount?: number) {
  const item: SearchHistoryItem = {
    type: 'search',
    query,
    resultsCount,
    createdAt: new Date().toISOString(),
  };
  saveToHistory(STORAGE_KEYS.SEARCH, item);
}

export function getSearchHistory(): SearchHistoryItem[] {
  return getFromHistory<SearchHistoryItem>(STORAGE_KEYS.SEARCH);
}

export function clearSearchHistory() {
  clearHistory(STORAGE_KEYS.SEARCH);
}

// Repo History
export function saveRepoHistory(repo: {
  owner: string;
  repo: string;
  url: string;
  description: string;
  language: string;
  stars: number;
}) {
  const item: RepoHistoryItem = {
    type: 'repo',
    ...repo,
    createdAt: new Date().toISOString(),
  };
  
  // Check if already exists (avoid duplicates)
  const existing = getRepoHistory();
  const isDuplicate = existing.some(
    (r) => r.owner === repo.owner && r.repo === repo.repo
  );
  
  if (!isDuplicate) {
    saveToHistory(STORAGE_KEYS.REPO, item);
  }
}

export function getRepoHistory(): RepoHistoryItem[] {
  return getFromHistory<RepoHistoryItem>(STORAGE_KEYS.REPO);
}

export function clearRepoHistory() {
  clearHistory(STORAGE_KEYS.REPO);
}

// Boilerplate History
export function saveBoilerplateHistory(boilerplate: {
  framework: string;
  language: string;
  features: string[];
  fileName: string;
}) {
  const item: BoilerplateHistoryItem = {
    type: 'boilerplate',
    ...boilerplate,
    createdAt: new Date().toISOString(),
  };
  saveToHistory(STORAGE_KEYS.BOILERPLATE, item);
}

export function getBoilerplateHistory(): BoilerplateHistoryItem[] {
  return getFromHistory<BoilerplateHistoryItem>(STORAGE_KEYS.BOILERPLATE);
}

export function clearBoilerplateHistory() {
  clearHistory(STORAGE_KEYS.BOILERPLATE);
}

// Clear all history
export function clearAllHistory() {
  clearSearchHistory();
  clearRepoHistory();
  clearBoilerplateHistory();
}
