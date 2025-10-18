import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface LivePreviewButtonProps {
  owner: string;
  repo: string;
  branch?: string;
  onPreviewStart?: () => void;
  onPreviewReady?: (projectId: string, embedUrl: string) => void;
  onError?: (error: string) => void;
}

export default function LivePreviewButton({
  owner,
  repo,
  branch = 'main',
  onPreviewStart,
  onPreviewReady,
  onError,
}: LivePreviewButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    onPreviewReady?.('', ''); // Just trigger the modal to open
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
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
          <span>Creating Preview...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Live Preview</span>
        </>
      )}
    </button>
  );
}
