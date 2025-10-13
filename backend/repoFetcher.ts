import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export interface RepoFile {
  path: string;
  content: string;
  size: number;
}

export async function fetchRepoContent(owner: string, repo: string): Promise<RepoFile[]> {
  const files: RepoFile[] = [];
  
  try {
    // Priority files to fetch
    const priorityFiles = [
      'README.md',
      'README',
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'next.config.ts',
      '.env.example',
      'docker-compose.yml',
      'Dockerfile',
    ];

    // Fetch priority files
    for (const filePath of priorityFiles) {
      const content = await fetchFileContent(owner, repo, filePath);
      if (content) {
        files.push({
          path: filePath,
          content,
          size: content.length,
        });
      }
    }

    // Fetch key source files from common directories
    const sourceDirs = ['src', 'lib', 'app', 'pages/api', 'api'];
    
    for (const dir of sourceDirs) {
      const dirFiles = await fetchDirectoryFiles(owner, repo, dir, 5); // Limit to 5 files per dir
      files.push(...dirFiles);
    }

    console.log(`Fetched ${files.length} files from ${owner}/${repo}`);
    return files;
  } catch (error) {
    console.error('Error fetching repo content:', error);
    return files;
  }
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.data.content) {
      // Decode base64 content
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return content;
    }

    return null;
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.error(`Error fetching ${path}:`, error.message);
    }
    return null;
  }
}

async function fetchDirectoryFiles(
  owner: string,
  repo: string,
  path: string,
  limit = 5
): Promise<RepoFile[]> {
  const files: RepoFile[] = [];
  
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!Array.isArray(response.data)) {
      return files;
    }

    // Filter for relevant file types
    const relevantFiles = response.data
      .filter((item: any) => {
        if (item.type !== 'file') return false;
        
        const ext = item.name.split('.').pop()?.toLowerCase();
        return ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java'].includes(ext || '');
      })
      .slice(0, limit);

    // Fetch content for each file
    for (const file of relevantFiles) {
      const content = await fetchFileContent(owner, repo, file.path);
      if (content && content.length < 50000) { // Skip very large files
        files.push({
          path: file.path,
          content,
          size: content.length,
        });
      }
    }

    return files;
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.error(`Error fetching directory ${path}:`, error.message);
    }
    return files;
  }
}

export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  const readmeVariants = ['README.md', 'README', 'readme.md', 'Readme.md'];
  
  for (const variant of readmeVariants) {
    const content = await fetchFileContent(owner, repo, variant);
    if (content) return content;
  }
  
  return null;
}
