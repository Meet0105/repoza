import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import {
  fetchRepoFiles,
  convertFile,
  convertFileName,
  convertDependencies,
  detectSourceLanguage,
  ConversionResult,
} from '../../backend/codeConverter';
import { logApiCall } from '../../backend/mongodb';
import { requireFeatureAccess } from '../../utils/apiFeatureGate';
import archiver from 'archiver';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check feature access
  const access = await requireFeatureAccess(req, res, 'code-converter');
  if (!access) return; // Response already sent

  const session = await getServerSession(req, res, authOptions);
  const { owner, repo, targetLanguage, targetFramework, scope, selectedFiles } = req.body;

  if (!owner || !repo || !targetLanguage) {
    return res.status(400).json({ error: 'owner, repo, and targetLanguage are required' });
  }

  try {
    // Get GitHub token if available
    const githubToken = (session as any)?.accessToken || process.env.GITHUB_TOKEN;

    console.log(`Starting conversion: ${owner}/${repo} → ${targetLanguage}`);

    // Step 1: Fetch repo files
    console.log('Fetching repository files...');
    let files = await fetchRepoFiles(owner, repo, '', githubToken);

    if (files.length === 0) {
      return res.status(404).json({ error: 'No code files found in repository' });
    }

    // Step 2: Filter files if scope is 'selected'
    if (scope === 'selected' && selectedFiles && selectedFiles.length > 0) {
      files = files.filter(f => selectedFiles.includes(f.path));
    }

    // Limit to 50 files to control costs
    if (files.length > 50) {
      files = files.slice(0, 50);
      console.log('Limited to first 50 files');
    }

    console.log(`Converting ${files.length} files...`);

    // Step 3: Detect source language
    const sourceLanguage = detectSourceLanguage(files);
    console.log(`Detected source language: ${sourceLanguage}`);

    // Step 4: Convert files
    const conversions: ConversionResult[] = [];
    const convertedFiles: Record<string, string> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Converting ${i + 1}/${files.length}: ${file.path}`);

      try {
        const convertedContent = await convertFile(
          file.content,
          file.path,
          sourceLanguage,
          targetLanguage,
          targetFramework
        );

        const convertedPath = convertFileName(file.path, targetLanguage);

        conversions.push({
          originalFile: file.path,
          convertedFile: convertedPath,
          originalContent: file.content,
          convertedContent,
          success: true,
        });

        convertedFiles[convertedPath] = convertedContent;

        // Log Gemini API call
        await logApiCall('gemini', 'convertCode');

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`Failed to convert ${file.path}:`, error);
        conversions.push({
          originalFile: file.path,
          convertedFile: file.path,
          originalContent: file.content,
          convertedContent: '',
          success: false,
          error: error.message,
        });
      }
    }

    // Step 5: Convert dependencies if package.json exists
    const packageJsonFile = files.find(f => f.path === 'package.json');
    if (packageJsonFile) {
      try {
        console.log('Converting dependencies...');
        const packageJson = JSON.parse(packageJsonFile.content);
        const convertedDeps = await convertDependencies(packageJson, targetLanguage);
        
        const depsFileName = 
          targetLanguage.toLowerCase() === 'python' ? 'requirements.txt' :
          targetLanguage.toLowerCase() === 'java' ? 'pom.xml' :
          targetLanguage.toLowerCase() === 'go' ? 'go.mod' :
          targetLanguage.toLowerCase() === 'rust' ? 'Cargo.toml' :
          'dependencies.txt';
        
        convertedFiles[depsFileName] = convertedDeps;
        await logApiCall('gemini', 'convertDependencies');
      } catch (error) {
        console.error('Failed to convert dependencies:', error);
      }
    }

    // Step 6: Add README with conversion info
    const successCount = conversions.filter(c => c.success).length;
    const failCount = conversions.filter(c => !c.success).length;

    convertedFiles['CONVERSION_README.md'] = `# Converted Repository

**Original Repository:** ${owner}/${repo}
**Source Language:** ${sourceLanguage}
**Target Language:** ${targetLanguage}
${targetFramework ? `**Target Framework:** ${targetFramework}` : ''}

## Conversion Summary

- ✅ Successfully converted: ${successCount} files
- ❌ Failed: ${failCount} files
- 📊 Total processed: ${conversions.length} files

## Important Notes

⚠️ **This is an AI-generated conversion. Please review and test thoroughly before use.**

### What to check:
1. Dependencies and imports
2. API endpoints and routes
3. Database connections
4. Environment variables
5. Build configuration

### Failed Conversions
${failCount > 0 ? conversions.filter(c => !c.success).map(c => `- ${c.originalFile}: ${c.error}`).join('\n') : 'None'}

---

Converted by [Repoza](https://repoza.vercel.app) - AI-Powered Code Transformation
`;

    // Step 7: Create ZIP file
    console.log('Creating ZIP archive...');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${repo}-${targetLanguage.toLowerCase()}.zip`
    );

    archive.pipe(res);

    // Add all converted files to archive
    for (const [path, content] of Object.entries(convertedFiles)) {
      archive.append(content, { name: path });
    }

    await archive.finalize();

    console.log('Conversion complete!');
  } catch (error: any) {
    console.error('Conversion error:', error);
    return res.status(500).json({
      error: 'Failed to convert code',
      details: error.message,
    });
  }
}
