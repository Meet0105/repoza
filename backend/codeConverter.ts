import { generateText } from './gemini';
import axios from 'axios';

export interface ConversionConfig {
  targetLanguage: string;
  targetFramework?: string;
  scope: 'full' | 'selected';
  selectedFiles?: string[];
}

export interface ConversionResult {
  originalFile: string;
  convertedFile: string;
  originalContent: string;
  convertedContent: string;
  success: boolean;
  error?: string;
}

const LANGUAGE_MAPPINGS: Record<string, { extension: string; framework?: string }> = {
  python: { extension: '.py', framework: 'Django/Flask' },
  java: { extension: '.java', framework: 'Spring Boot' },
  csharp: { extension: '.cs', framework: 'ASP.NET' },
  go: { extension: '.go', framework: 'Gin/Echo' },
  rust: { extension: '.rs', framework: 'Actix/Rocket' },
  php: { extension: '.php', framework: 'Laravel' },
  ruby: { extension: '.rb', framework: 'Rails' },
  typescript: { extension: '.ts', framework: 'Node.js/Express' },
  javascript: { extension: '.js', framework: 'Node.js/Express' },
};

export async function convertFile(
  content: string,
  fileName: string,
  sourceLanguage: string,
  targetLanguage: string,
  targetFramework?: string
): Promise<string> {
  try {
    const targetInfo = LANGUAGE_MAPPINGS[targetLanguage.toLowerCase()];
    const framework = targetFramework || targetInfo?.framework || targetLanguage;

    const prompt = `You are an expert code translator. Convert the following ${sourceLanguage} code to ${targetLanguage} ${framework ? `(${framework})` : ''}.

IMPORTANT RULES:
1. Maintain the same functionality and logic
2. Use idiomatic ${targetLanguage} patterns and best practices
3. Convert imports/dependencies appropriately
4. Keep the same structure and organization
5. Add comments explaining major changes
6. Ensure the code is production-ready

Original file: ${fileName}
Source language: ${sourceLanguage}
Target language: ${targetLanguage}
${framework ? `Target framework: ${framework}` : ''}

Original code:
\`\`\`${sourceLanguage}
${content}
\`\`\`

Provide ONLY the converted code without explanations. Start directly with the code:`;

    const convertedCode = await generateText(prompt);
    
    // Clean up markdown code blocks if present
    let cleanedCode = convertedCode
      .replace(/```[\w]*\n/g, '')
      .replace(/```\n?$/g, '')
      .trim();

    return cleanedCode;
  } catch (error) {
    console.error(`Failed to convert ${fileName}:`, error);
    throw error;
  }
}

export async function fetchRepoFiles(
  owner: string,
  repo: string,
  path: string = '',
  githubToken?: string
): Promise<Array<{ path: string; content: string; type: string }>> {
  const files: Array<{ path: string; content: string; type: string }> = [];
  
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers: any = {
      Accept: 'application/vnd.github.v3+json',
    };
    
    if (githubToken) {
      headers.Authorization = `token ${githubToken}`;
    }

    const response = await axios.get(url, { headers });
    const items = Array.isArray(response.data) ? response.data : [response.data];

    for (const item of items) {
      if (item.type === 'file') {
        // Only process code files
        const ext = item.name.split('.').pop()?.toLowerCase();
        const codeExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'cs', 'php', 'rb'];
        
        if (codeExtensions.includes(ext || '')) {
          try {
            const fileResponse = await axios.get(item.download_url);
            files.push({
              path: item.path,
              content: fileResponse.data,
              type: ext || 'txt',
            });
          } catch (error) {
            console.error(`Failed to fetch ${item.path}`);
          }
        }
      } else if (item.type === 'dir') {
        // Recursively fetch directory contents
        const dirFiles = await fetchRepoFiles(owner, repo, item.path, githubToken);
        files.push(...dirFiles);
      }
    }

    return files;
  } catch (error) {
    console.error(`Failed to fetch repo files from ${path}:`, error);
    return files;
  }
}

export function convertFileName(fileName: string, targetLanguage: string): string {
  const targetInfo = LANGUAGE_MAPPINGS[targetLanguage.toLowerCase()];
  if (!targetInfo) return fileName;

  const parts = fileName.split('.');
  const ext = parts.pop();
  const baseName = parts.join('.');

  // Handle special cases
  if (ext === 'tsx' || ext === 'jsx') {
    // Component files
    return `${baseName}${targetInfo.extension}`;
  }

  return `${baseName}${targetInfo.extension}`;
}

export async function convertDependencies(
  packageJson: any,
  targetLanguage: string
): Promise<string> {
  try {
    const prompt = `Convert the following package.json dependencies to ${targetLanguage} equivalent.

For Python: Generate requirements.txt
For Java: Generate pom.xml dependencies section
For C#: Generate .csproj dependencies
For Go: Generate go.mod
For Rust: Generate Cargo.toml dependencies

Original package.json:
${JSON.stringify(packageJson, null, 2)}

Provide ONLY the converted dependency file content:`;

    const converted = await generateText(prompt);
    return converted.replace(/```[\w]*\n/g, '').replace(/```\n?$/g, '').trim();
  } catch (error) {
    console.error('Failed to convert dependencies:', error);
    throw error;
  }
}

export function detectSourceLanguage(files: Array<{ path: string; type: string }>): string {
  const extensions = files.map(f => f.type);
  
  if (extensions.includes('tsx') || extensions.includes('ts')) return 'TypeScript';
  if (extensions.includes('jsx') || extensions.includes('js')) return 'JavaScript';
  if (extensions.includes('py')) return 'Python';
  if (extensions.includes('java')) return 'Java';
  if (extensions.includes('go')) return 'Go';
  if (extensions.includes('rs')) return 'Rust';
  if (extensions.includes('cs')) return 'C#';
  if (extensions.includes('php')) return 'PHP';
  if (extensions.includes('rb')) return 'Ruby';
  
  return 'Unknown';
}
