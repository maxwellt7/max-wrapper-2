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
      <div className="space-y-4">
        <div className="text-center mb-4">Loading stacks...</div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-base-200 rounded-lg p-6 h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error mb-4">⚠️ {error}</div>
        <button 
          onClick={fetchStacks}
          className="px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stacks.map((stack) => (
        <div
          key={stack.id}
          className="bg-base-200 rounded-lg p-6 hover:bg-base-300 transition-colors border border-base-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-base-content mb-2">
                {stack.title}
              </h3>
              <p className="text-base-content/70 mb-4">
                {stack.description}
              </p>
              <div className="text-sm text-base-content/60 mb-4">
                📝 {stack.questions?.length || 0} questions
              </div>
              <div className="text-xs text-base-content/50">
                Estimated time: {Math.ceil((stack.questions?.length || 0) * 2)} minutes
              </div>
            </div>
            
            <Link href={`/stacks/${stack.slug}/new`}>
              <button className="ml-6 px-6 py-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Start Stack →
              </button>
            </Link>
          </div>
        </div>
      ))}
      
      {stacks.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-base-content mb-2">
            No stacks available
          </h3>
          <p className="text-base-content/70">
            Check back later for new reflection experiences.
          </p>
        </div>
      )}
    </div>
  );
}