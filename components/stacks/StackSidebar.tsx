"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
// Temporary simple icons to avoid dependency issues

interface Stack {
  id: string;
  slug: string;
  title: string;
  description: string;
}

interface StackSession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  stack: {
    slug: string;
    title: string;
  };
}

export function StackSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [sessions, setSessions] = useState<StackSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch available stacks
      const stacksResponse = await fetch("/stacks/api/stacks");
      if (stacksResponse.ok) {
        const stacksData = await stacksResponse.json();
        setStacks(stacksData);
      } else {
        console.error("Failed to fetch stacks:", stacksResponse.status, stacksResponse.statusText);
      }

      // Fetch user sessions
      const sessionsResponse = await fetch("/stacks/api/sessions");
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      } else {
        console.error("Failed to fetch sessions:", sessionsResponse.status, sessionsResponse.statusText);
      }
    } catch (error) {
      console.error("Network error fetching sidebar data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full modern-scrollbar theme-stacks">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-slate-200">Stacks</h2>
      </div>

      {/* AI Dashboard Link */}
      <div className="p-4 border-b border-slate-700/30">
        <Link
          href="/stacks/dashboard"
          className="block"
        >
          <div className="group glass-subtle rounded-xl p-4 hover:glass transition-all duration-300 hover:scale-[1.02] border border-blue-400/20 hover:border-blue-400/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:glow-primary transition-all duration-300">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-3.182-2.1l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                  AI Analysis
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Mental loops & patterns
                </div>
              </div>
              <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Available Stacks */}
      <div className="p-4 border-b border-slate-700/30">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Available Stacks
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <div className="glass-subtle rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-slate-600 rounded shimmer mb-2"></div>
                <div className="h-3 bg-slate-700 rounded shimmer w-3/4"></div>
              </div>
            </div>
          ) : (
            stacks.map((stack) => (
              <Link
                key={stack.id}
                href={`/stacks/${stack.slug}/new`}
                className="block"
              >
                <div className="group glass-subtle rounded-lg p-3 hover:glass transition-all duration-200 hover:scale-[1.01] border border-transparent hover:border-blue-400/30">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center group-hover:glow-accent transition-all duration-200">
                      <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-300 group-hover:text-white truncate transition-colors text-sm">
                        {stack.title}
                      </div>
                      <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate transition-colors">
                        Start new session
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="flex-1 p-4 overflow-y-auto modern-scrollbar">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-subtle rounded-lg p-3 animate-pulse">
                  <div className="h-3 bg-slate-600 rounded shimmer mb-2"></div>
                  <div className="h-2 bg-slate-700 rounded shimmer w-2/3 mb-1"></div>
                  <div className="h-2 bg-slate-700 rounded shimmer w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass-subtle rounded-lg p-4 text-center">
              <div className="w-8 h-8 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-slate-400 text-xs mb-1">No sessions yet</div>
              <div className="text-slate-500 text-xs">Start your first stack above</div>
            </div>
          ) : (
            sessions.map((session) => (
              <Link
                key={session.id}
                href={`/stacks/${session.stack.slug}/${session.id}`}
                className="block"
              >
                <div className={`group glass-subtle rounded-lg p-3 transition-all duration-200 hover:scale-[1.01] border ${
                  pathname.includes(session.id)
                    ? "border-blue-400/50 bg-blue-500/10 glow-primary"
                    : "border-transparent hover:border-slate-600/50 hover:glass"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-all duration-200 ${
                      session.status === "completed" 
                        ? "bg-green-400 group-hover:glow-success" 
                        : "bg-blue-400 group-hover:glow-primary"
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-300 group-hover:text-white text-sm truncate transition-colors">
                        {session.title}
                      </div>
                      <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate transition-colors">
                        {session.stack.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {session.status}
                        </span>
                        <div className="text-xs text-slate-500">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}