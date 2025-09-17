"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stack {
  id: string;
  slug: string;
  title: string;
  description: string;
  questions: Array<{ index: number; key: string; text: string }>;
}

export function StackList() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStacks();
  }, []);

  const fetchStacks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/stacks/api/stacks");
      if (response.ok) {
        const data = await response.json();
        setStacks(data);
        setError(null);
      } else {
        setError("Failed to load stacks");
      }
    } catch (error) {
      console.error("Error fetching stacks:", error);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-xl shimmer"></div>
              <div className="flex-1">
                <div className="h-6 bg-slate-700 rounded-lg shimmer mb-2"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-700 rounded shimmer"></div>
              <div className="h-4 bg-slate-700 rounded shimmer w-3/4"></div>
            </div>
            <div className="flex justify-between items-center mt-6">
              <div className="h-3 bg-slate-700 rounded shimmer w-20"></div>
              <div className="h-8 bg-slate-700 rounded-lg shimmer w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400 glow-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-red-400 mb-6 font-medium">⚠️ {error}</div>
          <button 
            onClick={fetchStacks}
            className="px-6 py-3 glass-subtle rounded-xl text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-105 glow-primary font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (stacks.length === 0) {
    return (
      <div className="flex justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No stacks available</h3>
          <p className="text-slate-400">Check back later for new reflection experiences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {stacks.map((stack, index) => (
        <Link key={stack.id} href={`/stacks/${stack.slug}/new`}>
          <div 
            className="group relative glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:ring-2 hover:ring-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            
            {/* Stack Icon and Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl glass-subtle flex items-center justify-center group-hover:glow-primary transition-all duration-300">
                <svg className="w-6 h-6 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors duration-200">
                  {stack.title}
                </h3>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed mb-4 group-hover:text-slate-300 transition-colors duration-200">
              {stack.description}
            </p>
            
            {/* Stack Stats */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{stack.questions?.length || 0} questions</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>~{Math.ceil((stack.questions?.length || 0) * 2)} min</span>
              </div>
            </div>
            
            {/* Action Area */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Start Journey
              </span>
              <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-all duration-200 group-hover:translate-x-1">
                <span className="text-sm font-semibold">Begin</span>
                <svg className="w-4 h-4 group-hover:glow-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
            
            {/* Bottom highlight */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      ))}
    </div>
  );
}