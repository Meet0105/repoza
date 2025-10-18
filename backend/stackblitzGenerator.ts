import { FrameworkDetectionResult } from './frameworkDetector';

export interface StackBlitzProject {
  title: string;
  description: string;
  template: string;
  files: Record<string, string>;
  dependencies?: Record<string, string>;
  openFile?: string;
  settings?: {
    compile?: {
      trigger?: 'auto' | 'keystroke' | 'save';
      action?: 'hmr' | 'refresh';
      clearConsole?: boolean;
    };
  };
}

function extractDependencies(packageJsonContent?: string): Record<string, string> {
  if (!packageJsonContent) return {};

  try {
    const packageJson = JSON.parse(packageJsonContent);
    return {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
  } catch (error) {
    console.error('Error parsing package.json:', error);
    return {};
  }
}

export async function generateStackBlitzProject(
  owner: string,
  repo: string,
  frameworkInfo: FrameworkDetectionResult,
  files: Record<string, string>
): Promise<StackBlitzProject> {
  const dependencies = extractDependencies(files['package.json']);

  // Add README if not present
  if (!files['README.md']) {
    files['README.md'] = `# ${repo}

Live preview of [${owner}/${repo}](https://github.com/${owner}/${repo})

Powered by [Repoza](https://repoza.app) 🚀

## Framework
${frameworkInfo.framework}

## Commands
- Install: \`${frameworkInfo.installCommand}\`
- Dev: \`${frameworkInfo.devCommand}\`
- Build: \`${frameworkInfo.buildCommand}\`
- Start: \`${frameworkInfo.startCommand}\`
`;
  }

  // Determine which file to open by default
  let openFile = 'README.md';
  const possibleEntryFiles = [
    'src/App.tsx',
    'src/App.jsx',
    'src/main.tsx',
    'src/main.jsx',
    'src/index.tsx',
    'src/index.jsx',
    'pages/index.tsx',
    'pages/index.jsx',
    'app/page.tsx',
    'app/page.jsx',
    'index.tsx',
    'index.jsx',
    'index.ts',
    'index.js',
    'index.html',
    'App.tsx',
    'App.jsx',
    'main.tsx',
    'main.jsx',
  ];

  for (const file of possibleEntryFiles) {
    if (files[file]) {
      openFile = file;
      break;
    }
  }

  const project: StackBlitzProject = {
    title: `${owner}/${repo}`,
    description: `Live preview of ${owner}/${repo} - ${frameworkInfo.framework} project`,
    template: frameworkInfo.template,
    files,
    dependencies: Object.keys(dependencies).length > 0 ? dependencies : undefined,
    openFile,
    settings: {
      compile: {
        trigger: 'auto',
        action: 'hmr',
        clearConsole: false,
      },
    },
  };

  return project;
}

export function getStackBlitzEmbedUrl(projectId: string): string {
  return `https://stackblitz.com/edit/${projectId}?embed=1&view=preview`;
}

export function getStackBlitzOpenUrl(projectId: string): string {
  return `https://stackblitz.com/edit/${projectId}`;
}
