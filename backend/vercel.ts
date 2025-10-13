import axios from 'axios';

export interface VercelDeployment {
  id: string;
  url: string;
  name: string;
  state: string;
  readyState: string;
  inspectorUrl: string;
}

export async function createVercelDeployment(
  accessToken: string,
  gitUrl: string,
  projectName: string,
  framework?: string
): Promise<VercelDeployment> {
  try {
    const response = await axios.post(
      'https://api.vercel.com/v13/deployments',
      {
        name: projectName,
        gitSource: {
          type: 'github',
          repo: gitUrl.replace('https://github.com/', ''),
          ref: 'main',
        },
        projectSettings: {
          framework: framework || 'nextjs',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to create Vercel deployment:', error.response?.data);
    throw new Error(error.response?.data?.error?.message || 'Failed to create deployment');
  }
}

export async function getVercelProjects(accessToken: string) {
  try {
    const response = await axios.get('https://api.vercel.com/v9/projects', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.projects || [];
  } catch (error: any) {
    console.error('Failed to get Vercel projects:', error.response?.data);
    throw new Error('Failed to get projects');
  }
}

export async function getVercelDeployment(accessToken: string, deploymentId: string) {
  try {
    const response = await axios.get(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to get deployment:', error.response?.data);
    throw new Error('Failed to get deployment status');
  }
}

export function generateVercelDeployUrl(gitHubUrl: string): string {
  return `https://vercel.com/new/clone?repository-url=${encodeURIComponent(gitHubUrl)}`;
}
