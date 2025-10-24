import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronRight, Shield, TrendingUp } from 'lucide-react';
import axios from 'axios';

type Props = {
  owner: string;
  repo: string;
};

interface Dependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
  isOutdated?: boolean;
  latestVersion?: string;
  hasVulnerability?: boolean;
  vulnerabilityLevel?: 'low' | 'moderate' | 'high' | 'critical';
}

interface AnalysisData {
  language: string;
  totalDependencies: number;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  hasVulnerabilities: boolean;
  outdatedCount: number;
  packageJson?: {
    name: string;
    version: string;
    description: string;
    engines?: any;
  };
}

export default function DependencyAnalyzer({ owner, repo }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState('');
  const [showDev, setShowDev] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'outdated' | 'vulnerable'>('all');

  const analyze = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/analyze-dependencies', { owner, repo });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze dependencies');
    } finally {
      setLoading(false);
    }
  };

  const getVulnerabilityColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const filterDependencies = (deps: Dependency[]) => {
    if (filterType === 'outdated') {
      return deps.filter(d => d.isOutdated);
    }
    if (filterType === 'vulnerable') {
      return deps.filter(d => d.hasVulnerability);
    }
    return deps;
  };

  const getHealthScore = () => {
    if (!data) return 0;
    const total = data.totalDependencies;
    if (total === 0) return 100;
    
    const outdatedPenalty = (data.outdatedCount / total) * 30;
    const vulnPenalty = data.hasVulnerabilities ? 40 : 0;
    
    return Math.max(0, 100 - outdatedPenalty - vulnPenalty);
  };

  const healthScore = getHealthScore();
  const healthColor = healthScore >= 80 ? 'text-green-400' : healthScore >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text-primary">Dependency Analysis</h2>
            <p className="text-gray-400 text-sm">Check dependencies, vulnerabilities, and updates</p>
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
        </button>
      </div>

      {error && (
        <div className="glass-light border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-light rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-3xl font-bold text-white">{data.totalDependencies}</div>
              <div className="text-xs text-gray-400 mt-1">{data.language}</div>
            </div>

            <div className="glass-light rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Outdated</span>
              </div>
              <div className="text-3xl font-bold text-white">{data.outdatedCount}</div>
              <div className="text-xs text-gray-400 mt-1">Need updates</div>
            </div>

            <div className="glass-light rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">Vulnerabilities</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {data.hasVulnerabilities ? '⚠️' : '0'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {data.hasVulnerabilities ? 'Found issues' : 'None found'}
              </div>
            </div>

            <div className="glass-light rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-5 h-5 ${healthColor}`} />
                <span className="text-sm font-medium text-gray-300">Health Score</span>
              </div>
              <div className={`text-3xl font-bold ${healthColor}`}>
                {Math.round(healthScore)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Out of 100</div>
            </div>
          </div>

          {/* Package Info */}
          {data.packageJson && (
            <div className="glass-light rounded-lg p-4 border border-white/10">
              <h3 className="font-semibold text-white mb-2">{data.packageJson.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{data.packageJson.description}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Version: {data.packageJson.version}</span>
                {data.packageJson.engines?.node && (
                  <span>Node: {data.packageJson.engines.node}</span>
                )}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 glass rounded-xl p-2">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'glass-strong text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({data.dependencies.length})
            </button>
            <button
              onClick={() => setFilterType('outdated')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'outdated'
                  ? 'glass-strong text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Outdated ({data.outdatedCount})
            </button>
            <button
              onClick={() => setFilterType('vulnerable')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'vulnerable'
                  ? 'glass-strong text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Vulnerable
            </button>
          </div>

          {/* Dependencies List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Production Dependencies ({data.dependencies.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filterDependencies(data.dependencies).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No {filterType} dependencies</p>
                </div>
              ) : (
                filterDependencies(data.dependencies).map((dep, idx) => (
                  <div
                    key={idx}
                    className="glass-light rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{dep.name}</span>
                          <span className="text-sm text-gray-400">{dep.version}</span>
                        </div>

                        <div className="flex gap-2 mt-2">
                          {dep.isOutdated && (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                              Update to {dep.latestVersion}
                            </span>
                          )}
                          {dep.hasVulnerability && (
                            <span className={`text-xs px-2 py-1 rounded border ${getVulnerabilityColor(dep.vulnerabilityLevel)}`}>
                              {dep.vulnerabilityLevel?.toUpperCase()} vulnerability
                            </span>
                          )}
                          {!dep.isOutdated && !dep.hasVulnerability && (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/30">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Up to date
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dev Dependencies */}
          {data.devDependencies.length > 0 && (
            <div>
              <button
                onClick={() => setShowDev(!showDev)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
              >
                {showDev ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <h3 className="text-lg font-semibold">
                  Dev Dependencies ({data.devDependencies.length})
                </h3>
              </button>

              {showDev && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.devDependencies.map((dep, idx) => (
                    <div
                      key={idx}
                      className="glass-light rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{dep.name}</span>
                        <span className="text-sm text-gray-400">{dep.version}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
          <p className="text-gray-400 mb-4">Click "Analyze" to check dependencies</p>
          <p className="text-sm text-gray-500">
            Supports JavaScript/TypeScript, Python, and Go projects
          </p>
        </div>
      )}
    </div>
  );
}
