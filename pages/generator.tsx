import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Code2, Download, Sparkles, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { saveBoilerplateHistory } from '../utils/history';
import DeployButton from '../components/DeployButton';

export default function Generator() {
  const router = useRouter();
  const [framework, setFramework] = useState('nextjs');
  const [language, setLanguage] = useState('typescript');
  const [features, setFeatures] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string> | null>(null);

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

      // Generate ZIP for download
      const zipRes = await axios.post('/api/generate-boilerplate', config, {
        responseType: 'blob',
      });

      // Also get files as JSON for deployment
      const filesRes = await axios.post('/api/generate-files', config);
      setGeneratedFiles(filesRes.data.files);

      // Create download link
      const fileName = `repoza-${framework}-${language}.zip`;
      const url = window.URL.createObjectURL(new Blob([zipRes.data]));
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
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-20">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 animate-slide-up">
                    <Link href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to home</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl gradient-ai flex items-center justify-center shadow-lg animate-pulse-glow">
                            <Code2 className="w-9 h-9 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold gradient-text-ai">Boilerplate Generator</h1>
                            <p className="text-gray-300 text-lg mt-2">
                                Generate a fully configured project boilerplate in seconds with AI
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Description Input */}
                <div className="mb-8 glass rounded-2xl p-8 shadow-lg hover-lift animate-slide-up">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg gradient-ai flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold gradient-text-ai">Describe Your Project</h2>
                    </div>
                    <p className="text-sm text-gray-300 mb-6">
                        Let AI auto-select the best options for you based on your description
                    </p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., I want a Next.js app with Tailwind, Auth, and a simple product page"
                            className="input flex-1"
                        />
                        <button
                            onClick={parseDescriptionWithAI}
                            disabled={generating}
                            className="btn-ai disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Parse with AI</span>
                        </button>
                    </div>
                </div>

                {/* Manual Configuration */}
                <div className="space-y-8">
                    {/* Framework Selection */}
                    <div className="glass rounded-2xl p-8 shadow-lg animate-slide-up">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="gradient-text-primary">Select Framework</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {frameworks.map((fw) => (
                                <button
                                    key={fw.id}
                                    onClick={() => setFramework(fw.id)}
                                    className={`p-5 rounded-xl border-2 transition-all duration-300 text-left hover-lift ${framework === fw.id
                                            ? 'border-purple-500 glass-strong shadow-lg shadow-purple-500/20'
                                            : 'glass-light border-white/10 hover:border-purple-500/50'
                                    }`}
                                >
                                    <div className="font-semibold text-lg mb-1">{fw.name}</div>
                                    <div className="text-sm text-gray-400">{fw.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="glass rounded-2xl p-8 shadow-lg animate-slide-up">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="gradient-text-code">Select Language</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => setLanguage(lang.id)}
                                    className={`p-5 rounded-xl border-2 transition-all duration-300 hover-lift ${language === lang.id
                                            ? 'border-cyan-500 glass-strong shadow-lg shadow-cyan-500/20'
                                            : 'glass-light border-white/10 hover:border-cyan-500/50'
                                        }`}
                                >
                                    <div className="font-semibold text-lg text-center">{lang.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Features Selection */}
                    <div className="glass rounded-2xl p-8 shadow-lg animate-slide-up">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="gradient-text-success">Select Features</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableFeatures.map((feature) => (
                                <button
                                    key={feature.id}
                                    onClick={() => toggleFeature(feature.id)}
                                    className={`p-5 rounded-xl border-2 transition-all duration-300 text-left flex items-start gap-3 hover-lift ${features.includes(feature.id)
                                            ? 'border-green-500 glass-strong shadow-lg shadow-green-500/20'
                                            : 'glass-light border-white/10 hover:border-green-500/50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${features.includes(feature.id)
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-white/30'
                                        }`}>
                                        {features.includes(feature.id) && (
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg mb-1">{feature.name}</div>
                                        <div className="text-sm text-gray-400">{feature.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Display */}
                {progress && (
                    <div className="mt-8 glass-strong border border-purple-500/30 rounded-xl p-5 animate-slide-up">
                        <div className="flex items-center gap-3">
                            {generating && !success && <Loader className="w-6 h-6 animate-spin text-purple-400" />}
                            {success && <CheckCircle className="w-6 h-6 text-green-400" />}
                            <span className="text-white font-medium text-lg">{progress}</span>
                        </div>
                    </div>
                )}

                {/* Generate Button */}
                <div className="mt-10">
                    <button
                        onClick={generateBoilerplate}
                        disabled={generating}
                        className="w-full btn-ai text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        {generating ? (
                            <>
                                <Loader className="w-6 h-6 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-6 h-6" />
                                <span>Generate & Download Project</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Deploy Button (shown after successful generation) */}
                {success && generatedFiles && (
                    <div className="mt-6 animate-slide-up">
                        <DeployButton
                            type="boilerplate"
                            boilerplateData={{
                                name: `repoza-${framework}-${Date.now()}`,
                                description: description || `Generated ${framework} project with Repoza`,
                                files: generatedFiles,
                                framework,
                            }}
                            onSuccess={(data) => {
                                console.log('Deployment initiated:', data);
                            }}
                        />
                    </div>
                )}

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
