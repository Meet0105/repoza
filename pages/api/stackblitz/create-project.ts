import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { detectFramework, getSupportedFrameworks } from '../../../backend/frameworkDetector';
import { fetchRepoForStackBlitz } from '../../../backend/stackblitzFetcher';
import { generateStackBlitzProject } from '../../../backend/stackblitzGenerator';
import { connectToDatabase } from '../../../backend/mongodb';

interface CreateProjectRequest {
  owner: string;
  repo: string;
  branch?: string;
}

interface CreateProjectResponse {
  success: boolean;
  projectId?: string;
  openFile?: string; // File to open in StackBlitz
  framework?: string;
  filesCount?: number;
  error?: string;
  supportedFrameworks?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateProjectResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { owner, repo, branch = 'main' }: CreateProjectRequest = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: owner and repo',
      });
    }

    // Get user session for private repos
    const session = await getServerSession(req, res, authOptions);
    const accessToken = (session as any)?.accessToken as string | undefined;

    const startTime = Date.now();

    // Step 1: Detect framework
    console.log(`Detecting framework for ${owner}/${repo}...`);
    const frameworkInfo = await detectFramework(owner, repo, branch, accessToken);

    if (!frameworkInfo.supported) {
      return res.status(400).json({
        success: false,
        error: `Framework "${frameworkInfo.framework}" is not supported for live preview`,
        supportedFrameworks: getSupportedFrameworks(),
      });
    }

    console.log(`Framework detected: ${frameworkInfo.framework} (confidence: ${frameworkInfo.confidence}%)`);

    // Step 2: Fetch repository files
    console.log(`Fetching files for ${owner}/${repo}...`);
    const fetchResult = await fetchRepoForStackBlitz(owner, repo, branch, accessToken);

    if (fetchResult.totalFiles === 0) {
      return res.status(400).json({
        success: false,
        error: 'No suitable files found in repository',
      });
    }

    console.log(`Fetched ${fetchResult.totalFiles} files (${(fetchResult.totalSize / 1024).toFixed(2)} KB)`);

    // Step 3: Generate StackBlitz project
    console.log(`Generating StackBlitz project...`);
    const project = await generateStackBlitzProject(owner, repo, frameworkInfo, fetchResult.files);

    // Generate a unique project ID
    const projectId = `${owner}-${repo}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const loadTime = Date.now() - startTime;

    // Step 4: Track preview in MongoDB
    try {
      const client = await connectToDatabase();
      if (client) {
        const db = client.db();
        await db.collection('stackblitz_previews').insertOne({
        projectId,
        repoId: `${owner}/${repo}`,
        owner,
        repo,
        branch,
        framework: frameworkInfo.framework,
        userId: session?.user?.email || null,
        createdAt: new Date(),
        status: 'created',
        filesCount: fetchResult.totalFiles,
        loadTime,
        });
      }
    } catch (dbError) {
      console.error('Error tracking preview:', dbError);
      // Don't fail the request if tracking fails
    }

    return res.status(200).json({
      success: true,
      projectId,
      openFile: project.openFile || 'README.md', // Return the file to open
      framework: frameworkInfo.framework,
      filesCount: fetchResult.totalFiles,
    });
  } catch (error: any) {
    console.error('Error creating StackBlitz project:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create preview',
    });
  }
}
