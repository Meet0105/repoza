import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

interface Dependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
  isOutdated?: boolean;
  latestVersion?: string;
  hasVulnerability?: boolean;
  vulnerabilityLevel?: 'low' | 'moderate' | 'high' | 'critical';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { owner, repo } = req.body;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Owner and repo are required' });
  }

  try {
    // Fetch package.json from GitHub
    const packageJsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
    const headers: any = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    let packageJson: any = null;
    let hasPackageJson = true;

    try {
      const response = await axios.get(packageJsonUrl, { headers });
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      packageJson = JSON.parse(content);
    } catch (error: any) {
      if (error.response?.status === 404) {
        hasPackageJson = false;
      } else {
        throw error;
      }
    }

    // If no package.json, try other dependency files
    if (!hasPackageJson) {
      // Try requirements.txt for Python
      try {
        const requirementsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`;
        const response = await axios.get(requirementsUrl, { headers });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        
        const dependencies: Dependency[] = content
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => {
            const match = line.match(/^([^=<>~!]+)([=<>~!]+)?(.+)?$/);
            if (match) {
              return {
                name: match[1].trim(),
                version: match[3]?.trim() || 'latest',
                type: 'dependency' as const,
              };
            }
            return null;
          })
          .filter(Boolean) as Dependency[];

        return res.status(200).json({
          language: 'Python',
          totalDependencies: dependencies.length,
          dependencies,
          devDependencies: [],
          hasVulnerabilities: false,
          outdatedCount: 0,
        });
      } catch (error) {
        // Python file not found either
      }

      // Try go.mod for Go
      try {
        const goModUrl = `https://api.github.com/repos/${owner}/${repo}/contents/go.mod`;
        const response = await axios.get(goModUrl, { headers });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        
        const dependencies: Dependency[] = [];
        const lines = content.split('\n');
        let inRequire = false;

        for (const line of lines) {
          if (line.includes('require (')) {
            inRequire = true;
            continue;
          }
          if (inRequire && line.includes(')')) {
            break;
          }
          if (inRequire || line.trim().startsWith('require ')) {
            const match = line.match(/\s*([^\s]+)\s+v?([^\s]+)/);
            if (match) {
              dependencies.push({
                name: match[1],
                version: match[2],
                type: 'dependency',
              });
            }
          }
        }

        return res.status(200).json({
          language: 'Go',
          totalDependencies: dependencies.length,
          dependencies,
          devDependencies: [],
          hasVulnerabilities: false,
          outdatedCount: 0,
        });
      } catch (error) {
        // Go file not found either
      }

      return res.status(404).json({ 
        error: 'No dependency file found (package.json, requirements.txt, or go.mod)' 
      });
    }

    // Parse dependencies from package.json
    const dependencies: Dependency[] = [];
    const devDependencies: Dependency[] = [];

    if (packageJson.dependencies) {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: version as string,
          type: 'dependency',
        });
      });
    }

    if (packageJson.devDependencies) {
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        devDependencies.push({
          name,
          version: version as string,
          type: 'devDependency',
        });
      });
    }

    // Simulate vulnerability check (in production, use npm audit or Snyk API)
    const vulnerablePackages = ['lodash', 'moment', 'request', 'axios'];
    let hasVulnerabilities = false;
    let outdatedCount = 0;

    dependencies.forEach(dep => {
      // Simulate outdated check
      if (dep.version.includes('^') || dep.version.includes('~')) {
        const randomOutdated = Math.random() > 0.7;
        if (randomOutdated) {
          dep.isOutdated = true;
          outdatedCount++;
          dep.latestVersion = incrementVersion(dep.version);
        }
      }

      // Simulate vulnerability check
      if (vulnerablePackages.includes(dep.name)) {
        const hasVuln = Math.random() > 0.6;
        if (hasVuln) {
          dep.hasVulnerability = true;
          dep.vulnerabilityLevel = ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as any;
          hasVulnerabilities = true;
        }
      }
    });

    return res.status(200).json({
      language: 'JavaScript/TypeScript',
      totalDependencies: dependencies.length + devDependencies.length,
      dependencies,
      devDependencies,
      hasVulnerabilities,
      outdatedCount,
      packageJson: {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        engines: packageJson.engines,
      },
    });
  } catch (error: any) {
    console.error('Dependency analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze dependencies',
      details: error.message 
    });
  }
}

function incrementVersion(version: string): string {
  const cleanVersion = version.replace(/[\^~]/g, '');
  const parts = cleanVersion.split('.');
  if (parts.length >= 2) {
    const minor = parseInt(parts[1]) + 1;
    return `${parts[0]}.${minor}.0`;
  }
  return cleanVersion;
}
