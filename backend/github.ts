import axios from 'axios';

export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

export async function createGitHubRepo(
  accessToken: string,
  repoName: string,
  description: string,
  isPrivate = false
): Promise<GitHubRepo> {
  try {
    const response = await axios.post(
      'https://api.github.com/user/repos',
      {
        name: repoName,
        description,
        private: isPrivate,
        auto_init: false,
      },
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to create GitHub repo:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to create repository');
  }
}

export async function uploadFileToGitHub(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string
): Promise<void> {
  try {
    // Encode content to base64
    const encodedContent = Buffer.from(content).toString('base64');

    await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        message,
        content: encodedContent,
      },
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
  } catch (error: any) {
    console.error(`Failed to upload ${path}:`, error.response?.data);
    throw new Error(`Failed to upload ${path}`);
  }
}

export async function uploadMultipleFiles(
  accessToken: string,
  owner: string,
  repo: string,
  files: Record<string, string>
): Promise<void> {
  const fileEntries = Object.entries(files);
  
  // Upload files sequentially to avoid rate limits
  for (const [path, content] of fileEntries) {
    await uploadFileToGitHub(
      accessToken,
      owner,
      repo,
      path,
      content,
      `Add ${path}`
    );
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export async function getUserGitHubInfo(accessToken: string) {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return {
      login: response.data.login,
      name: response.data.name,
      email: response.data.email,
      avatar_url: response.data.avatar_url,
    };
  } catch (error: any) {
    console.error('Failed to get GitHub user info:', error.response?.data);
    throw new Error('Failed to get user information');
  }
}

export async function checkRepoExists(
  accessToken: string,
  owner: string,
  repo: string
): Promise<boolean> {
  try {
    await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return true;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
}
