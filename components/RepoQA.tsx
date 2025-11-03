import { useState } from 'react';
import { MessageCircle, Send, Sparkles, FileText, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useFeatureAccess } from '../utils/useFeatureAccess';
import UpgradePrompt from './UpgradePrompt';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{ file: string; score: number; preview: string }>;
}

interface RepoQAProps {
    repoId: string;
    isIndexed: boolean;
    onIndexRequest: () => void;
}

export default function RepoQA({ repoId, isIndexed, onIndexRequest }: RepoQAProps) {
    const { hasAccess, loading: checkingAccess } = useFeatureAccess('repo-qa');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Show inline upgrade prompt if no access
    if (!checkingAccess && !hasAccess) {
        return (
            <div className="mt-8">
                <UpgradePrompt feature="repo-qa" inline />
            </div>
        );
    }

    const suggestedQuestions = [
        'What database does this use?',
        'How is authentication handled?',
        'Where is the API defined?',
        'What are the main dependencies?',
        'How do I run this project?',
    ];

    const handleAskQuestion = async (question: string) => {
        if (!question.trim() || loading) return;

        // Add user message
        const userMessage: Message = { role: 'user', content: question };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/api/repo-qa', {
                repoId,
                question,
            });

            // Add assistant message
            const assistantMessage: Message = {
                role: 'assistant',
                content: res.data.answer,
                sources: res.data.sources,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!isIndexed) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">AI Q&A Not Available</h3>
                        <p className="text-gray-300 mb-4">
                            This repository hasn't been indexed yet. Index it to ask questions about the code!
                        </p>
                        <button
                            onClick={onIndexRequest}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Index Repository
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setShowChat(!showChat)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                    <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">AI Q&A Assistant</h3>
                        <p className="text-sm text-gray-400">Ask questions about this repository</p>
                    </div>
                </div>
                <div className="text-gray-400">
                    {showChat ? '▼' : '▶'}
                </div>
            </button>

            {/* Chat Interface */}
            {showChat && (
                <div className="border-t border-white/10">
                    {/* Suggested Questions */}
                    {messages.length === 0 && (
                        <div className="p-4 border-b border-white/10">
                            <p className="text-sm text-gray-400 mb-3">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAskQuestion(q)}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-sm text-gray-300 rounded-lg border border-white/10 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                        {messages.map((message, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/10 text-gray-200'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                    {/* Sources */}
                                    {message.sources && message.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/20">
                                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                                <FileText className="w-3 h-3" />
                                                Sources:
                                            </p>
                                            <div className="space-y-1">
                                                {message.sources.map((source, sidx) => (
                                                    <div
                                                        key={sidx}
                                                        className="text-xs text-gray-400 bg-black/20 rounded px-2 py-1"
                                                    >
                                                        📄 {source.file} ({(source.score * 100).toFixed(0)}% match)
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm">You</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                </div>
                                <div className="bg-white/10 text-gray-200 rounded-lg p-3">
                                    <p className="text-sm">Thinking...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(input)}
                                placeholder="Ask a question about this repository..."
                                disabled={loading}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleAskQuestion(input)}
                                disabled={loading || !input.trim()}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
