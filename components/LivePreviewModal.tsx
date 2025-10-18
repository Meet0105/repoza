import { useState, useEffect, useRef } from 'react';
import sdk from '@stackblitz/sdk';

interface LivePreviewModalProps {
    owner: string;
    repo: string;
    branch?: string;
    onClose: () => void;
}

type PreviewStatus = 'idle' | 'analyzing' | 'fetching' | 'building' | 'ready' | 'error';

interface PreviewState {
    status: PreviewStatus;
    progress: number;
    message: string;
    projectId: string | null;
    error: string | null;
    framework: string | null;
    filesCount: number;
}

export default function LivePreviewModal({
    owner,
    repo,
    branch = 'main',
    onClose,
}: LivePreviewModalProps) {
    const [state, setState] = useState<PreviewState>({
        status: 'idle',
        progress: 0,
        message: 'Initializing preview...',
        projectId: null,
        error: null,
        framework: null,
        filesCount: 0,
    });

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [stackblitzUrl, setStackblitzUrl] = useState<string | null>(null);
    const iframeContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        createPreview();
    }, []);

    const createPreview = async () => {
        try {
            // Step 1: Analyzing
            setState((prev) => ({
                ...prev,
                status: 'analyzing',
                progress: 20,
                message: 'Analyzing repository structure...',
            }));

            await new Promise((resolve) => setTimeout(resolve, 500));

            // Step 2: Fetching
            setState((prev) => ({
                ...prev,
                status: 'fetching',
                progress: 40,
                message: 'Fetching repository files...',
            }));

            const response = await fetch('/api/stackblitz/create-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ owner, repo, branch }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to create preview');
            }

            // Step 3: Building
            setState((prev) => ({
                ...prev,
                status: 'building',
                progress: 70,
                message: `Building ${data.framework} project...`,
                projectId: data.projectId,
                framework: data.framework,
                filesCount: data.filesCount,
            }));

            // Step 4: Set status to ready first
            setState((prev) => ({
                ...prev,
                status: 'ready',
                progress: 100,
                message: 'Preview ready!',
            }));

            // Step 5: Wait for DOM to update, then embed StackBlitz
            await new Promise((resolve) => setTimeout(resolve, 100));

            if (iframeContainerRef.current) {
                console.log('Embedding StackBlitz project from GitHub...');
                console.log(`Repository: ${owner}/${repo}`);

                try {
                    // Use GitHub project embedding - StackBlitz will handle dependencies
                    const vm = await sdk.embedGithubProject(
                        iframeContainerRef.current,
                        `${owner}/${repo}`,
                        {
                            openFile: data.openFile || 'README.md',
                            view: 'preview',
                            height: 600,
                            hideNavigation: false,
                            hideDevTools: false,
                            forceEmbedLayout: true,
                        }
                    );

                    console.log('StackBlitz embedded successfully!', vm);

                    // Set the StackBlitz URL for "Open in StackBlitz" button
                    setStackblitzUrl(`https://stackblitz.com/github/${owner}/${repo}`);
                } catch (embedError: any) {
                    console.error('Error embedding StackBlitz:', embedError);
                    throw new Error(`Failed to embed StackBlitz: ${embedError.message}`);
                }
            } else {
                console.error('Container ref is null!');
                throw new Error('Container element not found');
            }
        } catch (error: any) {
            console.error('Error creating preview:', error);
            setState((prev) => ({
                ...prev,
                status: 'error',
                error: error.message,
                message: 'Failed to create preview',
            }));
        }
    };

    const handleRetry = () => {
        setState({
            status: 'idle',
            progress: 0,
            message: 'Retrying...',
            projectId: null,
            error: null,
            framework: null,
            filesCount: 0,
        });
        setStackblitzUrl(null);
        createPreview();
    };

    const handleClose = () => {
        onClose();
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
            <div
                className={`glass-strong rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-white/20 ${isFullScreen ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6 max-w-7xl'
                    }`}
            >
                {/* Header with Code Gradient */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 gradient-code opacity-20"></div>
                    <div className="relative glass-strong px-6 py-4 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                            </div>
                            <div className="h-6 w-px bg-white/20"></div>
                            <h2 className="text-xl font-bold gradient-text-code">
                                {owner}/{repo}
                                {state.framework && (
                                    <span className="badge-cyan ml-3 text-xs">
                                        {state.framework}
                                    </span>
                                )}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {state.status === 'ready' && (
                                <>
                                    <button
                                        onClick={toggleFullScreen}
                                        className="p-2.5 glass-light hover:glass rounded-lg transition-all duration-300 text-gray-300 hover:text-cyan-400 hover-lift"
                                        title="Toggle Fullscreen"
                                    >
                                        {isFullScreen ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                        )}
                                    </button>
                                    {stackblitzUrl && (
                                        <a
                                            href={stackblitzUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary text-sm"
                                        >
                                            Open in StackBlitz
                                        </a>
                                        )}
                                </>
                            )}
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-semibold hover-lift"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="h-full" style={{ height: 'calc(100% - 64px)' }}>
                    {state.status === 'error' ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 glass-light">
                            <div className="text-red-500 text-6xl mb-4 animate-pulse">⚠️</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Preview Failed</h3>
                            <p className="text-gray-300 mb-6 text-center max-w-md">{state.error}</p>
                            <button
                                onClick={handleRetry}
                                className="btn-primary"
                            >
                                Retry
                            </button>
                        </div>
                    ) : state.status === 'ready' ? (
                        <div
                            ref={iframeContainerRef}
                            className="w-full h-full bg-gray-950"
                            id="stackblitz-container"
                            style={{ minHeight: '600px' }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 glass-light">
                            <div className="w-20 h-20 mb-8">
                                <svg
                                    className="animate-spin text-cyan-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold gradient-text-code mb-3">{state.message}</h3>
                            <div className="w-full max-w-md mt-6">
                                <div className="glass-strong rounded-full h-4 overflow-hidden">
                                    <div
                                        className="gradient-code h-full transition-all duration-500 animate-gradient"
                                        style={{ width: `${state.progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-cyan-400 text-sm mt-3 text-center font-semibold">{state.progress}%</p>
                            </div>
                            {state.filesCount > 0 && (
                                <p className="text-gray-400 text-sm mt-6 glass-light px-4 py-2 rounded-lg">
                                    Processing {state.filesCount} files...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}