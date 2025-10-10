import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Code2, Download, Sparkles, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { saveBoilerplateHistory } from '../utils/history';

export default function Generator() {
  const router = useRouter();
  const [framework, setFramework] = useState('nextjs');
  const [language, setLanguage] = useState('typescript');
  const [features, setFeatures] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(false);

  const frameworks = [
    { id: 'nextjs', name: 'Next.js', desc: 'React framework with SSR' },
    { id: 'react', name: 'React', desc: 'JavaScript library for UI' },
    { id: 'vue', name: 'Vue.js', desc: 'Progressive JavaScript framework' },
    { id: 'express', name: 'Express', desc: 'Node.js web framework' },
    { id: 'fastapi', name: 'FastAPI', desc: 'Modern Python web framework' },
  ];

  const languages = [
    { id: 'typescript', name: 'TypeScript' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
  ];

  const availableFeatures = [
    { id: 'tailwind', name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
    { id: 'api', name: 'API Routes', desc: 'Backend API endpoints' },
    { id: 'auth', name: 'Authentication', desc: 'JWT-based auth system' },
    { id: 'database', name: 'Database', desc: 'MongoDB integration' },
    { id: 'testing', name: 'Testing', desc: 'Jest/Vitest setup' },
    { id: 'docker', name: 'Docker', desc: 'Containerization setup' },
    { id: 'eslint', name: 'ESLint', desc: 'Code linting' },
    { id: 'prettier', name: 'Prettier', desc: 'Code formatting' },
  ];

  const toggleFeature = (featureId: string) => {
    setFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const parseDescriptionWithAI = async () => {
    if (!description.trim()) {
      alert('Please enter a project description');
      return;
    }

    setGenerating(true);
    setProgress('🧠 Analyzing your description with AI...');

    try {
      const res = await axios.post('/api/parse-project-description', {
        description,
      });

      const { framework: fw, language: lang, features: feat } = res.data;
      
      if (fw) setFramework(fw);
      if (lang) setLanguage(lang);
      if (feat && feat.length > 0) setFeatures(feat);

      setProgress('✅ AI parsed your requirements!');
      setTimeout(() => setProgress(''), 2000);
    } catch (error) {
      setProgress('❌ Failed to parse description');
      setTimeout(() => setProgress(''), 2000);
    } finally {
      setGenerating(false);
    }
  };

  const generateBoilerplate = async () => {
    setGenerating(true);
    setSuccess(false);
    setProgress('🧱 Setting up base structure...');

    try {
      const config = {
        framework,
        language,
        features,
      };

      // Simulate progress steps
      setTimeout(() => setProgress('🧩 Adding features...'), 1000);
      setTimeout(() => setProgress('🧰 Installing dependencies...'), 2000);
      setTimeout(() => setProgress('📦 Packaging project...'), 3000);

      const res = await axios.post('/api/generate-boilerplate', config, {
        responseType: 'blob',
      });

      // Create download link
      const fileName = `repoza-${framework}-${language}.zip`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Save to history
      saveBoilerplateHistory({
        framework,
        language,
        features,
        fileName,
      });

      setProgress('✅ Your project is ready! Download started.');
      setSuccess(true);
    } catch (error) {
      console.error('Generation failed:', error);
      setProgress('❌ Failed to generate boilerplate');
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold">Boilerplate Generator</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Generate a fully configured project boilerplate in seconds
          </p>
        </div>

        {/* AI Description Input */}
        <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold">Describe Your Project (AI-Powered)</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Let AI auto-select the best options for you based on your description
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., I want a Next.js app with Tailwind, Auth, and a simple product page"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={parseDescriptionWithAI}
              disabled={generating}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Parse with AI
            </button>
          </div>
        </div>

        {/* Manual Configuration */}
        <div className="space-y-6">
          {/* Framework Selection */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Select Framework</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {frameworks.map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => setFramework(fw.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    framework === fw.id
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <div className="font-semibold mb-1">{fw.name}</div>
                  <div className="text-sm text-gray-400">{fw.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Select Language</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    language === lang.id
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <div className="font-semibold text-center">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Features Selection */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Select Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                    features.includes(feature.id)
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    features.includes(feature.id)
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-white/30'
                  }`}>
                    {features.includes(feature.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{feature.name}</div>
                    <div className="text-sm text-gray-400">{feature.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Display */}
        {progress && (
          <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              {generating && !success && <Loader className="w-5 h-5 animate-spin text-purple-400" />}
              {success && <CheckCircle className="w-5 h-5 text-green-400" />}
              <span className="text-white">{progress}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-8">
          <button
            onClick={generateBoilerplate}
            disabled={generating}
            className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-colors"
          >
            {generating ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                Generate Project
              </>
            )}
          </button>
        </div>

        {/* Selected Configuration Summary */}
        <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Configuration:</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong>Framework:</strong> {frameworks.find(f => f.id === framework)?.name}</p>
            <p><strong>Language:</strong> {languages.find(l => l.id === language)?.name}</p>
            <p><strong>Features:</strong> {features.length > 0 ? features.map(f => availableFeatures.find(af => af.id === f)?.name).join(', ') : 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
