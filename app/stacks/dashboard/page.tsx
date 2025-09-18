"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';

interface AnalysisResult {
  mentalLoops: {
    pattern: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    frequency: number;
    examples: string[];
  }[];
  performanceAccelerators: {
    pattern: string;
    description: string;
    strength: 'high' | 'medium' | 'low';
    frequency: number;
    examples: string[];
  }[];
  overallInsights: {
    dominantThemes: string[];
    emotionalPatterns: string[];
    behavioralTrends: string[];
    recommendations: string[];
  };
  analysisDate: string;
  sessionsAnalyzed: number;
}

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/stacks/api/analyze');
      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.statusText}`);
      }
      
      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const getImpactColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  const getStrengthColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  return (
    <div className="min-h-full p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl glass glow-primary" style={{backgroundColor: 'rgb(var(--primary) / 0.15)', borderColor: 'rgb(var(--primary) / 0.3)'}}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'rgb(var(--primary))'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-3.182-2.10l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                AI Performance Analysis
              </h1>
            </div>
            <p className="text-lg" style={{color: 'rgb(var(--fg) / 0.9)'}}>
              Discover hidden mental loops and performance patterns from your stacks responses
            </p>
          </div>
          <div className="glass-subtle rounded-xl p-2 hover:glass transition-all duration-200">
            <Button 
              onClick={fetchAnalysis} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border text-purple-300 hover:text-purple-200 transition-all duration-200 glow-primary"
              style={{borderColor: 'rgb(var(--primary) / 0.3)', backgroundColor: 'rgb(var(--primary) / 0.1)'}}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="glass rounded-2xl border p-6" style={{borderColor: 'rgb(var(--destructive) / 0.3)'}}>
            <div className="flex items-center gap-3" style={{color: 'rgb(var(--destructive))'}}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center glow-destructive" style={{backgroundColor: 'rgb(var(--destructive) / 0.2)'}}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="font-medium">Error: {error}</p>
            </div>
          </div>
        )}

        {loading && !analysis && (
          <div className="glass rounded-2xl p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto glow-primary" style={{background: 'linear-gradient(135deg, rgb(var(--primary) / 0.3), rgb(var(--secondary) / 0.3))'}}>
                <Brain className="h-8 w-8 animate-pulse" style={{color: 'rgb(var(--primary))'}} />
              </div>
              <div>
                <p className="text-xl font-semibold mb-2" style={{color: 'rgb(var(--fg))'}} >Analyzing your responses...</p>
                <p style={{color: 'rgb(var(--muted))'}}>This may take a moment as AI processes your data</p>
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mental Loops Card */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border" style={{borderColor: 'rgb(var(--destructive) / 0.2)'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-destructive" style={{backgroundColor: 'rgb(var(--destructive) / 0.2)'}}>
                  <TrendingDown className="h-5 w-5" style={{color: 'rgb(var(--destructive))'}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{color: 'rgb(var(--fg))'}}>Hidden Mental Loops</h3>
                  <p className="text-sm" style={{color: 'rgb(var(--muted))'}}>
                    Patterns that may be sabotaging your performance ({analysis.mentalLoops.length} identified)
                  </p>
                </div>
              </div>
              
              <ScrollArea className="h-64 modern-scrollbar">
                <div className="space-y-4 pr-4">
                  {analysis.mentalLoops.map((loop, index) => (
                    <div key={index} className="glass-subtle rounded-xl p-4 border border-slate-600/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-200">{loop.pattern}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loop.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          loop.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {loop.impact} impact
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{loop.description}</p>
                      <div className="text-xs text-slate-500">
                        Frequency: {loop.frequency} occurrences
                      </div>
                      {loop.examples.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-300">Examples:</p>
                          {loop.examples.map((example, i) => (
                            <p key={i} className="text-xs text-slate-400 italic pl-3 border-l-2 border-red-400/30">
                              "{example}"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Performance Accelerators Card */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border" style={{borderColor: 'rgb(var(--primary) / 0.2)'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-primary" style={{backgroundColor: 'rgb(var(--primary) / 0.2)'}}>
                  <TrendingUp className="h-5 w-5" style={{color: 'rgb(var(--primary))'}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{color: 'rgb(var(--fg))'}}>Performance Accelerators</h3>
                  <p className="text-sm" style={{color: 'rgb(var(--muted))'}}>
                    Patterns that are boosting your performance ({analysis.performanceAccelerators.length} identified)
                  </p>
                </div>
              </div>
              
              <ScrollArea className="h-64 modern-scrollbar">
                <div className="space-y-4 pr-4">
                  {analysis.performanceAccelerators.map((accelerator, index) => (
                    <div key={index} className="glass-subtle rounded-xl p-4 border border-slate-600/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-200">{accelerator.pattern}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          accelerator.strength === 'high' ? 'bg-green-500/20 text-green-400' :
                          accelerator.strength === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {accelerator.strength} strength
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{accelerator.description}</p>
                      <div className="text-xs text-slate-500">
                        Frequency: {accelerator.frequency} occurrences
                      </div>
                      {accelerator.examples.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-300">Examples:</p>
                          {accelerator.examples.map((example, i) => (
                            <p key={i} className="text-xs text-slate-400 italic pl-3 border-l-2 border-blue-400/30">
                              "{example}"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Key Insights */}
            <div className="glass rounded-2xl p-6 border" style={{borderColor: 'rgb(var(--accent) / 0.2)'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-accent" style={{backgroundColor: 'rgb(var(--accent) / 0.2)'}}>
                  <Lightbulb className="h-5 w-5" style={{color: 'rgb(var(--accent))'}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-200">Key Insights</h3>
                  <p className="text-sm text-slate-400">Overall patterns and themes</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Dominant Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.overallInsights.dominantThemes.map((theme, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Emotional Patterns</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.overallInsights.emotionalPatterns.map((pattern, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-slate-500/20 text-slate-300 border border-slate-400/30">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass rounded-2xl p-6 border" style={{borderColor: 'rgb(var(--secondary) / 0.2)'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-secondary" style={{backgroundColor: 'rgb(var(--secondary) / 0.2)'}}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'rgb(var(--secondary))'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{color: 'rgb(var(--fg))'}}>AI Recommendations</h3>
                  <p className="text-sm" style={{color: 'rgb(var(--muted))'}}>Actionable insights for improvement</p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {analysis.overallInsights.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-slate-400 flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0 glow-accent"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Analysis Summary */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border" style={{borderColor: 'rgb(var(--border) / 0.3)'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgb(var(--muted) / 0.2)'}}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'rgb(var(--muted))'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold" style={{color: 'rgb(var(--fg))'}}>Analysis Summary</h3>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{color: 'rgb(var(--primary))'}}>{analysis.sessionsAnalyzed}</div>
                  <div className="text-sm" style={{color: 'rgb(var(--muted))'}}>Sessions analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{color: 'rgb(var(--destructive))'}}>{analysis.mentalLoops.length}</div>
                  <div className="text-sm" style={{color: 'rgb(var(--muted))'}}>Mental loops found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{analysis.performanceAccelerators.length}</div>
                  <div className="text-sm text-slate-400">Accelerators found</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Analysis date</div>
                  <div className="text-sm font-medium text-slate-300">{new Date(analysis.analysisDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}