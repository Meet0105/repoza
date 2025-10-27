import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  GraduationCap,
  Sparkles,
  CheckCircle,
  Circle,
  Star,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Code,
  ArrowRight,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function Learn() {
  return (
    <ProtectedRoute>
      <LearnContent />
    </ProtectedRoute>
  );
}

function LearnContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [topic, setTopic] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [savedPaths, setSavedPaths] = useState<any[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    loadSavedPaths();
  }, []);

  const loadSavedPaths = async () => {
    try {
      const res = await axios.get('/api/learning-progress');
      setSavedPaths(res.data.progress);
    } catch (error) {
      console.error('Failed to load saved paths:', error);
    }
  };

  const generatePath = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/generate-learning-path', {
        topic: topic.trim(),
        currentLevel,
      });

      setLearningPath(res.data);
      setCompletedSteps([]);

      // Save to progress
      await axios.post('/api/learning-progress', {
        topic: topic.trim(),
        pathId: Date.now().toString(),
        completedSteps: [],
        currentStep: 0,
        totalSteps: res.data.steps.length,
      });

      await loadSavedPaths();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate learning path');
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompletion = async (stepIndex: number) => {
    const stepId = `step-${stepIndex}`;
    const newCompleted = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];

    setCompletedSteps(newCompleted);

    // Save progress
    if (learningPath) {
      await axios.post('/api/learning-progress', {
        topic: learningPath.topic,
        pathId: learningPath.generatedAt,
        completedSteps: newCompleted,
        currentStep: stepIndex,
        totalSteps: learningPath.steps.length,
      });
    }
  };

  const deletePath = async (topic: string) => {
    if (!confirm('Delete this learning path?')) return;

    try {
      await axios.delete('/api/learning-progress', { data: { topic } });
      await loadSavedPaths();
      if (learningPath?.topic === topic) {
        setLearningPath(null);
      }
    } catch (error) {
      alert('Failed to delete path');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Intermediate':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Advanced':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Expert':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const progressPercentage = learningPath
    ? Math.round((completedSteps.length / learningPath.steps.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold gradient-text-primary">Learning Paths</h1>
              <p className="text-gray-300 text-lg mt-2">
                AI-powered personalized learning journeys
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Generate Path */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-2xl p-6 border border-white/10 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Create Learning Path</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    What do you want to learn?
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., React, Python, Machine Learning"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    onKeyPress={(e) => e.key === 'Enter' && generatePath()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Level
                  </label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <button
                  onClick={generatePath}
                  disabled={loading || !topic.trim()}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  <Sparkles className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
                  <span>{loading ? 'Generating...' : 'Generate Path'}</span>
                </button>
              </div>

              {/* Saved Paths */}
              {savedPaths.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    Your Learning Paths ({savedPaths.length})
                  </h3>
                  <div className="space-y-2">
                    {savedPaths.map((path, idx) => (
                      <div
                        key={idx}
                        className="glass-light rounded-lg p-3 border border-white/10 hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{path.topic}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-white/10 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all"
                                  style={{ width: `${path.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">{path.progress}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deletePath(path.topic)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Learning Path */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="glass-strong rounded-2xl p-12 text-center border border-white/10">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
                <p className="text-gray-400">Generating your personalized learning path...</p>
                <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
              </div>
            ) : learningPath ? (
              <div className="space-y-6">
                {/* Path Overview */}
                <div className="glass-strong rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold gradient-text-primary mb-2">
                        {learningPath.pathTitle}
                      </h2>
                      <p className="text-gray-300">{learningPath.overview}</p>
                    </div>
                    <button
                      onClick={generatePath}
                      className="btn-secondary text-sm"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="glass-light rounded-lg p-4">
                      <Clock className="w-5 h-5 text-cyan-400 mb-2" />
                      <div className="text-sm text-gray-400">Total Time</div>
                      <div className="text-lg font-bold text-white">
                        {learningPath.totalEstimatedTime}
                      </div>
                    </div>
                    <div className="glass-light rounded-lg p-4">
                      <Target className="w-5 h-5 text-purple-400 mb-2" />
                      <div className="text-sm text-gray-400">Steps</div>
                      <div className="text-lg font-bold text-white">
                        {learningPath.steps.length}
                      </div>
                    </div>
                    <div className="glass-light rounded-lg p-4">
                      <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                      <div className="text-sm text-gray-400">Progress</div>
                      <div className="text-lg font-bold text-white">{progressPercentage}%</div>
                    </div>
                    <div className="glass-light rounded-lg p-4">
                      <BookOpen className="w-5 h-5 text-orange-400 mb-2" />
                      <div className="text-sm text-gray-400">Completed</div>
                      <div className="text-lg font-bold text-white">
                        {completedSteps.length}/{learningPath.steps.length}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Overall Progress</span>
                      <span className="text-sm font-semibold text-cyan-400">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Learning Steps */}
                {learningPath.steps.map((step: any, stepIndex: number) => {
                  const isCompleted = completedSteps.includes(`step-${stepIndex}`);

                  return (
                    <div
                      key={stepIndex}
                      className={`glass-strong rounded-2xl p-6 border transition-all ${
                        isCompleted
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-white/10'
                      }`}
                    >
                      {/* Step Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <button
                            onClick={() => toggleStepCompletion(stepIndex)}
                            className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-white/30 hover:border-cyan-500'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(
                                  step.level
                                )}`}
                              >
                                {step.level}
                              </span>
                              <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                            </div>
                            <p className="text-gray-300 mb-4">{step.description}</p>

                            {/* Skills */}
                            {step.skills && step.skills.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                                  Skills to Master:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {step.skills.map((skill: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm border border-cyan-500/30"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Repositories */}
                            <div className="space-y-3 mb-4">
                              {step.repos.map((repo: any, repoIdx: number) => (
                                <div
                                  key={repoIdx}
                                  className="glass-light rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-all"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <Link
                                        href={`/repo/${repo.owner}/${repo.repo}`}
                                        className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors"
                                      >
                                        {repo.owner}/{repo.repo}
                                      </Link>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-sm text-gray-400">
                                          <Star className="w-4 h-4 text-yellow-400" />
                                          {repo.stars.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-gray-400">
                                          <Clock className="w-4 h-4" />
                                          {repo.estimatedTime}
                                        </span>
                                      </div>
                                    </div>
                                    <a
                                      href={repo.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn-secondary text-sm"
                                    >
                                      <Code className="w-4 h-4" />
                                      <span>View</span>
                                    </a>
                                  </div>

                                  <p className="text-sm text-gray-400 mb-3">{repo.description}</p>

                                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                    <h5 className="text-sm font-semibold text-purple-400 mb-1">
                                      What to Learn:
                                    </h5>
                                    <p className="text-sm text-gray-300">{repo.whatToLearn}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Practice Projects */}
                            {step.projects && step.projects.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                                  Practice Projects:
                                </h4>
                                <ul className="space-y-1">
                                  {step.projects.map((project: string, idx: number) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-300 flex items-start gap-2"
                                    >
                                      <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                      <span>{project}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-strong rounded-2xl p-12 text-center border border-white/10">
                <GraduationCap className="w-20 h-20 mx-auto mb-4 text-gray-600 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-2">Start Your Learning Journey</h3>
                <p className="text-gray-400 mb-6">
                  Enter a topic and let AI create a personalized learning path for you
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  {['React', 'Python', 'Machine Learning', 'Web3'].map((example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setTopic(example);
                        setTimeout(generatePath, 100);
                      }}
                      className="glass-light rounded-lg p-4 hover:border-purple-500/50 border border-white/10 transition-all"
                    >
                      <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
                      <div className="text-sm font-semibold text-white">{example}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
