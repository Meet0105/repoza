import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ReadmeRendererProps {
  content: string;
}

export default function ReadmeRenderer({ content }: ReadmeRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="readme-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold text-white mb-6 mt-8 pb-3 border-b border-cyan-500/30" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold text-white mb-4 mt-6 pb-2 border-b border-white/10" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold text-white mb-3 mt-5" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-semibold text-gray-200 mb-2 mt-4" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-lg font-semibold text-gray-300 mb-2 mt-3" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-base font-semibold text-gray-400 mb-2 mt-3" {...props} />
          ),

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-gray-300 leading-relaxed mb-4" {...props} />
          ),

          // Links
          a: ({ node, ...props }) => (
            <a
              className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/50 hover:decoration-cyan-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 ml-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300 ml-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),

          // Code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && match) {
              return (
                <div className="relative group mb-4">
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => copyCode(codeString)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy code"
                    >
                      {copiedCode === codeString ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-lg overflow-hidden border border-white/10">
                    <div className="bg-gray-800 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">{match[1]}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            }

            return (
              <code
                className="bg-gray-800 text-cyan-300 px-2 py-1 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-cyan-500 bg-cyan-500/10 pl-4 py-2 my-4 italic text-gray-300"
              {...props}
            />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-white/10 rounded-lg overflow-hidden" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-white/10" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-white/5 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-white" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-300" {...props} />
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t border-white/10" {...props} />
          ),

          // Images
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg max-w-full h-auto my-4 border border-white/10"
              {...props}
            />
          ),

          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white" {...props} />
          ),

          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-gray-200" {...props} />
          ),

          // Delete/Strikethrough
          del: ({ node, ...props }) => (
            <del className="line-through text-gray-500" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
