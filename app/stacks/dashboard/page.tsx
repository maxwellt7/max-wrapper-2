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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Performance Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Discover hidden mental loops and performance patterns from your stacks responses
          </p>
        </div>
        <Button 
          onClick={fetchAnalysis} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && !analysis && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Brain className="h-12 w-12 animate-pulse mx-auto text-primary" />
                <p className="text-lg font-medium">Analyzing your responses...</p>
                <p className="text-muted-foreground">This may take a moment as AI processes your data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mental Loops Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Hidden Mental Loops
              </CardTitle>
              <CardDescription>
                Patterns that may be sabotaging your performance ({analysis.mentalLoops.length} identified)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {analysis.mentalLoops.map((loop, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{loop.pattern}</h4>
                        <Badge variant={getImpactColor(loop.impact)}>
                          {loop.impact} impact
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{loop.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Frequency: {loop.frequency} occurrences
                      </div>
                      {loop.examples.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">Examples:</p>
                          {loop.examples.map((example, i) => (
                            <p key={i} className="text-xs text-muted-foreground italic pl-2 border-l-2">
                              "{example}"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Performance Accelerators Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Accelerators
              </CardTitle>
              <CardDescription>
                Patterns that are boosting your performance ({analysis.performanceAccelerators.length} identified)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {analysis.performanceAccelerators.map((accelerator, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{accelerator.pattern}</h4>
                        <Badge variant={getStrengthColor(accelerator.strength)}>
                          {accelerator.strength} strength
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{accelerator.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Frequency: {accelerator.frequency} occurrences
                      </div>
                      {accelerator.examples.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">Examples:</p>
                          {accelerator.examples.map((example, i) => (
                            <p key={i} className="text-xs text-muted-foreground italic pl-2 border-l-2">
                              "{example}"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Overall Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Key Insights
              </CardTitle>
              <CardDescription>Overall patterns and themes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Dominant Themes</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.overallInsights.dominantThemes.map((theme, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Emotional Patterns</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.overallInsights.emotionalPatterns.map((pattern, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Actionable insights for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.overallInsights.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>Sessions analyzed: <strong>{analysis.sessionsAnalyzed}</strong></p>
                <p>Analysis date: <strong>{new Date(analysis.analysisDate).toLocaleDateString()}</strong></p>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                <p>Mental loops found: <strong className="text-destructive">{analysis.mentalLoops.length}</strong></p>
                <p>Accelerators found: <strong className="text-primary">{analysis.performanceAccelerators.length}</strong></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}