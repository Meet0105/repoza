import { useState, useEffect } from 'react';
import { Settings, Key, Palette, Sliders, BarChart3, Save, TestTube } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';

function AdminPageContent() {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // API Keys State
  const [apiKeys, setApiKeys] = useState({
    githubToken: '',
    geminiApiKey: '',
  });

  // Theme State
  const [theme, setTheme] = useState({
    mode: 'dark',
    colorScheme: 'blue-gray',
    fontSize: 'medium',
  });

  // Ranking Weights State
  const [rankingWeights, setRankingWeights] = useState({
    stars: 0.7,
    lastUpdated: 0.5,
    languageMatch: 0.3,
    forks: 0.4,
    issues: 0.2,
  });

  // Usage Stats State
  const [usageStats, setUsageStats] = useState({
    githubCalls: 0,
    geminiRequests: 0,
    totalSearches: 0,
    totalBoilerplates: 0,
  });

  useEffect(() => {
    loadSettings();
    loadUsageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.theme) setTheme(data.theme);
        if (data.rankingWeights) setRankingWeights(data.rankingWeights);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const res = await fetch('/api/admin/usage-stats');
      if (res.ok) {
        const data = await res.json();
        setUsageStats(data);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const saveApiKeys = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/update-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeys),
      });
      
      if (res.ok) {
        setMessage('✅ API keys saved successfully!');
      } else {
        setMessage('❌ Failed to save API keys');
      }
    } catch (error) {
      setMessage('❌ Error saving API keys');
    }
    setSaving(false);
  };

  const testApiKey = async (keyType: 'github' | 'gemini') => {
    setMessage('Testing...');
    try {
      const res = await fetch('/api/admin/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyType, key: keyType === 'github' ? apiKeys.githubToken : apiKeys.geminiApiKey }),
      });
      
      const data = await res.json();
      if (data.valid) {
        setMessage(`✅ ${keyType === 'github' ? 'GitHub' : 'Gemini'} key is valid!`);
      } else {
        setMessage(`❌ ${keyType === 'github' ? 'GitHub' : 'Gemini'} key is invalid`);
      }
    } catch (error) {
      setMessage('❌ Error testing key');
    }
  };

  const saveTheme = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/update-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
      
      if (res.ok) {
        setMessage('✅ Theme saved successfully!');
        localStorage.setItem('repoza-theme', JSON.stringify(theme));
        applyTheme(theme);
      } else {
        setMessage('❌ Failed to save theme');
      }
    } catch (error) {
      setMessage('❌ Error saving theme');
    }
    setSaving(false);
  };

  const applyTheme = (themeConfig: typeof theme) => {
    document.documentElement.classList.toggle('dark', themeConfig.mode === 'dark');
    document.documentElement.setAttribute('data-color-scheme', themeConfig.colorScheme);
    document.documentElement.setAttribute('data-font-size', themeConfig.fontSize);
  };

  const saveRankingWeights = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/update-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankingWeights),
      });
      
      if (res.ok) {
        setMessage('✅ Ranking weights saved successfully!');
      } else {
        setMessage('❌ Failed to save ranking weights');
      }
    } catch (error) {
      setMessage('❌ Error saving ranking weights');
    }
    setSaving(false);
  };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 animate-slide-up">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                            <Settings className="w-9 h-9 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold gradient-text-primary">Admin Settings</h1>
                            <p className="text-gray-300 text-lg mt-2">Manage your Repoza configuration</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-8 glass rounded-2xl p-2 overflow-x-auto">
                    <TabButton
                        active={activeTab === 'api-keys'}
                        onClick={() => setActiveTab('api-keys')}
                        icon={<Key className="w-4 h-4" />}
                        label="API Keys"
                    />
                    <TabButton
                        active={activeTab === 'theme'}
                        onClick={() => setActiveTab('theme')}
                        icon={<Palette className="w-4 h-4" />}
                        label="Theme"
                    />
                    <TabButton
                        active={activeTab === 'ranking'}
                        onClick={() => setActiveTab('ranking')}
                        icon={<Sliders className="w-4 h-4" />}
                        label="Ranking"
                    />
                    <TabButton
                        active={activeTab === 'usage'}
                        onClick={() => setActiveTab('usage')}
                        icon={<BarChart3 className="w-4 h-4" />}
                        label="Usage"
                    />
                </div>

                {/* Message Display */}
                {message && (
                    <div className="mb-6 glass-strong rounded-xl p-5 border border-cyan-500/30 animate-slide-up">
                        <span className="text-white font-medium">{message}</span>
                    </div>
                )}

                {/* Tab Content */}
                <div className="glass rounded-2xl p-8 shadow-xl animate-slide-up">
                    {activeTab === 'api-keys' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold gradient-text-primary mb-6">API Key Configuration</h2>

                            <div>
                                <label className="block text-sm font-semibold text-cyan-400 mb-3">GitHub API Token</label>
                                <div className="flex gap-3">
                                    <input
                                        type="password"
                                        value={apiKeys.githubToken}
                                        onChange={(e) => setApiKeys({ ...apiKeys, githubToken: e.target.value })}
                                        placeholder="ghp_xxxxxxxxxxxx"
                                        className="input flex-1"
                                    />
                                    <button
                                        onClick={() => testApiKey('github')}
                                        className="btn-outline flex items-center gap-2"
                                    >
                                        <TestTube className="w-4 h-4" />
                                        <span>Test</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-purple-400 mb-3">Gemini API Key</label>
                                <div className="flex gap-3">
                                    <input
                                        type="password"
                                        value={apiKeys.geminiApiKey}
                                        onChange={(e) => setApiKeys({ ...apiKeys, geminiApiKey: e.target.value })}
                                        placeholder="AIzaSyxxxxxxxxxx"
                                        className="input flex-1"
                                    />
                                    <button
                                        onClick={() => testApiKey('gemini')}
                                        className="btn-outline flex items-center gap-2"
                                    >
                                        <TestTube className="w-4 h-4" />
                                        <span>Test</span>
                  </button>
                </div>
              </div>

              <button
                onClick={saveApiKeys}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save API Keys'}
              </button>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Theme Settings</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Theme Mode</label>
                <select
                  value={theme.mode}
                  onChange={(e) => setTheme({ ...theme, mode: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color Scheme</label>
                <select
                  value={theme.colorScheme}
                  onChange={(e) => setTheme({ ...theme, colorScheme: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="blue-gray">Blue Gray</option>
                  <option value="minimal-bw">Minimal Black & White</option>
                  <option value="purple">Purple</option>
                  <option value="green">Green</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <select
                  value={theme.fontSize}
                  onChange={(e) => setTheme({ ...theme, fontSize: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <button
                onClick={saveTheme}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Ranking Weight & Filters</h2>
              <p className="text-gray-400 mb-4">Adjust how search results are ranked (0 = no weight, 1 = max weight)</p>
              
              <WeightSlider
                label="Stars ⭐"
                value={rankingWeights.stars}
                onChange={(val) => setRankingWeights({ ...rankingWeights, stars: val })}
              />
              
              <WeightSlider
                label="Last Updated 🕒"
                value={rankingWeights.lastUpdated}
                onChange={(val) => setRankingWeights({ ...rankingWeights, lastUpdated: val })}
              />
              
              <WeightSlider
                label="Language Match 🧠"
                value={rankingWeights.languageMatch}
                onChange={(val) => setRankingWeights({ ...rankingWeights, languageMatch: val })}
              />
              
              <WeightSlider
                label="Forks 🍴"
                value={rankingWeights.forks}
                onChange={(val) => setRankingWeights({ ...rankingWeights, forks: val })}
              />
              
              <WeightSlider
                label="Issues 🐛"
                value={rankingWeights.issues}
                onChange={(val) => setRankingWeights({ ...rankingWeights, issues: val })}
              />

              <button
                onClick={saveRankingWeights}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Ranking Weights'}
              </button>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Usage Monitoring</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  label="GitHub API Calls"
                  value={usageStats.githubCalls}
                  icon="🔍"
                />
                <StatCard
                  label="Gemini Requests"
                  value={usageStats.geminiRequests}
                  icon="🤖"
                />
                <StatCard
                  label="Total Searches"
                  value={usageStats.totalSearches}
                  icon="📊"
                />
                <StatCard
                  label="Boilerplates Generated"
                  value={usageStats.totalBoilerplates}
                  icon="⚡"
                />
              </div>

              <button
                onClick={loadUsageStats}
                className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
              >
                Refresh Stats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 flex items-center gap-2 font-semibold transition-all duration-300 rounded-xl ${active
                    ? 'glass-strong text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:glass-light'
                }`}
        >
            {icon}
            <span className="whitespace-nowrap">{label}</span>
        </button>
    );
}

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-gray-400">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}


export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <AdminPageContent />
    </ProtectedRoute>
  );
}
