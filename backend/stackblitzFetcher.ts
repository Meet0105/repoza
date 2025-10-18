import { Octokit } from '@octokit/rest';

export interface StackBlitzFile {
  path: string;
  content: string;
}

export interface FetchResult {
  files: Record<string, string>;
  totalFiles: number;
  totalSize: number;
  excluded: string[];
}

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
  '.env.production',
  '.env.development',
  '*.log',
  '*.lock',
  'yarn.lock',
  'package-lock.json',
  'pnpm-lock.yaml',
  'bun.lockb',
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
  '*.pdf',
  '*.zip',
  '*.tar',
  '*.gz',
];

const INCLUDE_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.html',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.md',
  '.vue',
  '.svelte',
  '.txt',
  '.yml',
  '.yaml',
  '.toml',
  '.xml',
];

const MAX_FILES = 50;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function shouldExcludeFile(path: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => {
    if (pattern.endsWith('/')) {
      return path.startsWith(pattern) || path.includes(`/${pattern}`);
    }
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      return path.endsWith(ext);
    }
    return path === pattern || path.includes(`/${pattern}`);
  });
}

function shouldIncludeFile(path: string): boolean {
  return INCLUDE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export async function fetchRepoForStackBlitz(
  owner: string,
  repo: string,
  branch: string = 'main',
  accessToken?: string
): Promise<FetchResult> {
  const octokit = new Octokit({
    auth: accessToken || process.env.GITHUB_TOKEN,
  });

  try {
    // Get repository tree
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: refData.object.sha,
      recursive: 'true',
    });

    // Filter files
    const filesToFetch = treeData.tree
      .filter((item: any) => item.type === 'blob')
      .filter((item: any) => item.path && !shouldExcludeFile(item.path))
      .filter((item: any) => item.path && shouldIncludeFile(item.path))
      .slice(0, MAX_FILES);

    const excluded = treeData.tree
      .filter((item: any) => item.type === 'blob')
      .filter((item: any) => item.path && shouldExcludeFile(item.path))
      .map((item: any) => item.path || '');

    // Fetch file contents in batches
    const files: Record<string, string> = {};
    let totalSize = 0;
    const batchSize = 10;

    for (let i = 0; i < filesToFetch.length; i += batchSize) {
      const batch = filesToFetch.slice(i, i + batchSize);
      const batchPromises = batch.map(async (file: any) => {
        if (!file.path) return null;

        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: branch,
          });

          if ('content' in data && data.content) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            const size = Buffer.byteLength(content, 'utf-8');

            // Check size limit
            if (totalSize + size > MAX_SIZE) {
              console.log(`Skipping ${file.path} - size limit exceeded`);
              return null;
            }

            totalSize += size;
            return { path: file.path, content };
          }
        } catch (error) {
          console.error(`Error fetching ${file.path}:`, error);
          return null;
        }

        return null;
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach((result: any) => {
        if (result) {
          files[result.path] = result.content;
        }
      });

      // Stop if we've exceeded size limit
      if (totalSize >= MAX_SIZE) {
        break;
      }
    }

    return {
      files,
      totalFiles: Object.keys(files).length,
      totalSize,
      excluded,
    };
  } catch (error) {
    console.error('Error fetching repository files:', error);
    throw new Error('Failed to fetch repository files');
  }
}

export function formatFilesForStackBlitz(files: Record<string, string>): Record<string, string> {
  // StackBlitz expects files with paths as keys
  // Already in correct format from fetchRepoForStackBlitz
  return files;
}
