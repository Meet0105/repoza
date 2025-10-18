import { Octokit } from '@octokit/rest';

export interface FrameworkDetectionResult {
  framework: string;
  language: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  buildCommand: string;
  startCommand: string;
  devCommand: string;
  installCommand: string;
  template: string;
  supported: boolean;
  confidence: number;
}

interface FrameworkConfig {
  template: string;
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  devCommand: string;
}

const SUPPORTED_FRAMEWORKS: Record<string, FrameworkConfig> = {
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
    template: 'node',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm run preview',
    devCommand: 'npm run dev',
  },
  vue: {
    template: 'node',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm run serve',
    devCommand: 'npm run dev',
  },
  angular: {
    template: 'angular-cli',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    devCommand: 'ng serve',
  },
  svelte: {
    template: 'node',
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
  express: {
    template: 'node',
    installCommand: 'npm install',
    buildCommand: '',
    startCommand: 'node server.js',
    devCommand: 'npm run dev',
  },
  static: {
    template: 'html',
    installCommand: '',
    buildCommand: '',
    startCommand: '',
    devCommand: '',
  },
};

export async function detectFramework(
  owner: string,
  repo: string,
  branch: string = 'main',
  accessToken?: string
): Promise<FrameworkDetectionResult> {
  const octokit = new Octokit({
    auth: accessToken || process.env.GITHUB_TOKEN,
  });

  try {
    // Try to fetch package.json
    let packageJson: any = null;
    let confidence = 0;
    let detectedFramework = 'static';
    let language = 'javascript';

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json',
        ref: branch,
      });

      if ('content' in data) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        packageJson = JSON.parse(content);
        confidence = 50;
      }
    } catch (error) {
      // No package.json, might be static HTML
      console.log('No package.json found, checking for HTML files');
    }

    // Detect framework from package.json
    if (packageJson) {
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Next.js detection
      if (deps.next) {
        detectedFramework = 'nextjs';
        confidence = 95;
        language = deps.typescript ? 'typescript' : 'javascript';
      }
      // React + Vite detection
      else if (deps.react && deps.vite) {
        detectedFramework = 'react-vite';
        confidence = 90;
        language = deps.typescript ? 'typescript' : 'javascript';
      }
      // React (CRA) detection
      else if (deps.react && deps['react-scripts']) {
        detectedFramework = 'react';
        confidence = 90;
        language = deps.typescript ? 'typescript' : 'javascript';
      }
      // Vue.js detection
      else if (deps.vue) {
        detectedFramework = 'vue';
        confidence = 90;
        language = deps.typescript ? 'typescript' : 'javascript';
      }
      // Angular detection
      else if (deps['@angular/core']) {
        detectedFramework = 'angular';
        confidence = 95;
        language = 'typescript';
      }
      // Svelte detection
      else if (deps.svelte) {
        detectedFramework = 'svelte';
        confidence = 90;
        language = deps.typescript ? 'typescript' : 'javascript';
      }
      // Express detection
      else if (deps.express) {
        detectedFramework = 'express';
        confidence = 85;
        language = deps.typescript ? 'typescript' : 'javascript';
      }
      // Generic Node.js
      else if (packageJson.main || packageJson.type === 'module') {
        detectedFramework = 'nodejs';
        confidence = 70;
        language = deps.typescript ? 'typescript' : 'javascript';
      }
    }

    // Check for config files to increase confidence
    if (detectedFramework !== 'static') {
      try {
        const configFiles: Record<string, string> = {
          nextjs: 'next.config.js',
          'react-vite': 'vite.config.js',
          vue: 'vue.config.js',
          angular: 'angular.json',
          svelte: 'svelte.config.js',
        };

        const configFile = configFiles[detectedFramework];
        if (configFile) {
          await octokit.repos.getContent({
            owner,
            repo,
            path: configFile,
            ref: branch,
          });
          confidence = Math.min(100, confidence + 10);
        }
      } catch (error) {
        // Config file not found, keep current confidence
      }
    }

    // Detect package manager
    let packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' = 'npm';
    try {
      await octokit.repos.getContent({
        owner,
        repo,
        path: 'yarn.lock',
        ref: branch,
      });
      packageManager = 'yarn';
    } catch {
      try {
        await octokit.repos.getContent({
          owner,
          repo,
          path: 'pnpm-lock.yaml',
          ref: branch,
        });
        packageManager = 'pnpm';
      } catch {
        try {
          await octokit.repos.getContent({
            owner,
            repo,
            path: 'bun.lockb',
            ref: branch,
          });
          packageManager = 'bun';
        } catch {
          packageManager = 'npm';
        }
      }
    }

    const config = SUPPORTED_FRAMEWORKS[detectedFramework];
    const supported = !!config;

    // Adjust install command based on package manager
    let installCommand = config?.installCommand || '';
    if (packageManager === 'yarn') {
      installCommand = installCommand.replace('npm install', 'yarn install');
    } else if (packageManager === 'pnpm') {
      installCommand = installCommand.replace('npm install', 'pnpm install');
    } else if (packageManager === 'bun') {
      installCommand = installCommand.replace('npm install', 'bun install');
    }

    return {
      framework: detectedFramework,
      language,
      packageManager,
      buildCommand: config?.buildCommand || '',
      startCommand: config?.startCommand || '',
      devCommand: config?.devCommand || '',
      installCommand,
      template: config?.template || 'html',
      supported,
      confidence,
    };
  } catch (error) {
    console.error('Error detecting framework:', error);
    throw new Error('Failed to detect framework');
  }
}

export function getSupportedFrameworks(): string[] {
  return Object.keys(SUPPORTED_FRAMEWORKS);
}

export function isFrameworkSupported(framework: string): boolean {
  return framework in SUPPORTED_FRAMEWORKS;
}
