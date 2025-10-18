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

            // Step 4: Embed StackBlitz project using SDK
            if (iframeContainerRef.current) {
                console.log('Embedding StackBlitz project from GitHub...');

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

                // Set the StackBlitz URL for "Open in StackBlitz" button
                setStackblitzUrl(`https://stackblitz.com/github/${owner}/${repo}`);
            }

            // Step 5: Ready
            setState((prev) => ({
                ...prev,
                status: 'ready',
                progress: 100,
                message: 'Preview ready!',
            }));
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
            <div
                className={`bg-gray-900 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${isFullScreen ? 'w-full h-full' : 'w-11/12 h-5/6 max-w-7xl'
                    }`}
            >
                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h2 className="ml-4 text-xl font-bold text-white">
                            {owner}/{repo}
                            {state.framework && (
                                <span className="ml-3 text-sm font-normal text-gray-400">
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
                                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
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
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Open in StackBlitz
                                    </a>
                                )}
                            </>
                        )}
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="h-full pb-20">
                    {state.status === 'error' ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Preview Failed</h3>
                            <p className="text-gray-400 mb-6 text-center max-w-md">{state.error}</p>
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : state.status === 'ready' ? (
                        <div
                            ref={iframeContainerRef}
                            className="w-full h-full"
                            id="stackblitz-container"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                            <div className="w-16 h-16 mb-6">
                                <svg
                                    className="animate-spin text-blue-500"
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
                            <h3 className="text-2xl font-bold text-white mb-2">{state.message}</h3>
                            <div className="w-full max-w-md mt-6">
                                <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
                                        style={{ width: `${state.progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-gray-400 text-sm mt-2 text-center">{state.progress}%</p>
                            </div>
                            {state.filesCount > 0 && (
                                <p className="text-gray-500 text-sm mt-4">
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
