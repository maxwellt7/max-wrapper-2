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
      <div className="p-6 border-b" style={{borderColor: 'rgb(var(--border) / 0.3)'}}>
        <h2 className="text-xl font-bold" style={{color: 'rgb(var(--fg))'}}>Stacks</h2>
      </div>

      {/* AI Dashboard Link */}
      <div className="p-4 border-b" style={{borderColor: 'rgb(var(--border) / 0.3)'}}>
        <Link
          href="/stacks/dashboard"
          className="block"
        >
          <div className="group glass-subtle rounded-xl p-4 hover:glass transition-all duration-200 hover:scale-[1.01] border" style={{borderColor: 'rgb(var(--primary) / 0.2)'}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200" style={{backgroundColor: 'rgb(var(--primary) / 0.15)', color: 'rgb(var(--primary))'}}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-3.182-2.1l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold transition-colors" style={{color: 'rgb(var(--primary))'}}>
                  AI Analysis
                </div>
                <div className="text-sm transition-colors" style={{color: 'rgb(var(--muted))'}}>
                  Mental loops & patterns
                </div>
              </div>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" style={{color: 'rgb(var(--primary))'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Available Stacks */}
      <div className="p-4 border-b" style={{borderColor: 'rgb(var(--border) / 0.3)'}}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{color: 'rgb(var(--muted))'}}>
          Available Stacks
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <div className="glass-subtle rounded-lg p-3 animate-pulse">
                <div className="h-4 rounded shimmer mb-2" style={{backgroundColor: 'rgb(var(--border))'}}></div>
                <div className="h-3 rounded shimmer w-3/4" style={{backgroundColor: 'rgb(var(--border) / 0.7)'}}></div>
              </div>
            </div>
          ) : (
            stacks.map((stack) => (
              <Link
                key={stack.id}
                href={`/stacks/${stack.slug}/new`}
                className="block"
              >
                <div className="group glass-subtle rounded-lg p-3 hover:glass transition-all duration-200 hover:scale-[1.01] border border-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200" style={{backgroundColor: 'rgb(var(--primary) / 0.15)', color: 'rgb(var(--primary))'}}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate transition-colors text-sm" style={{color: 'rgb(var(--fg))'}}>
                        {stack.title}
                      </div>
                      <div className="text-xs truncate transition-colors" style={{color: 'rgb(var(--muted))'}}>
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
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{color: 'rgb(var(--muted))'}}>
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-subtle rounded-lg p-3 animate-pulse">
                  <div className="h-3 rounded shimmer mb-2" style={{backgroundColor: 'rgb(var(--border))'}}></div>
                  <div className="h-2 rounded shimmer w-2/3 mb-1" style={{backgroundColor: 'rgb(var(--border) / 0.7)'}}></div>
                  <div className="h-2 rounded shimmer w-1/2" style={{backgroundColor: 'rgb(var(--border) / 0.5)'}}></div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass-subtle rounded-lg p-4 text-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{backgroundColor: 'rgb(var(--muted) / 0.2)', color: 'rgb(var(--muted))'}}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs mb-1" style={{color: 'rgb(var(--muted))'}}>No sessions yet</div>
              <div className="text-xs" style={{color: 'rgb(var(--muted) / 0.7)'}}>Start your first stack above</div>
            </div>
          ) : (
            sessions.map((session) => (
              <Link
                key={session.id}
                href={`/stacks/${session.stack.slug}/${session.id}`}
                className="block"
              >
                <div 
                  className={`group glass-subtle rounded-lg p-3 transition-all duration-200 hover:scale-[1.01] border ${
                    pathname.includes(session.id)
                      ? "hover:glass"
                      : "border-transparent hover:glass"
                  }`}
                  style={{
                    borderColor: pathname.includes(session.id) ? 'rgb(var(--primary) / 0.5)' : 'transparent',
                    backgroundColor: pathname.includes(session.id) ? 'rgb(var(--primary) / 0.08)' : undefined
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-all duration-200"
                      style={{
                        backgroundColor: session.status === "completed" 
                          ? 'rgb(var(--success))' 
                          : 'rgb(var(--primary))'
                      }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate transition-colors" style={{color: 'rgb(41, 50, 65)'}}>
                        {session.title}
                      </div>
                      <div className="text-xs truncate transition-colors" style={{color: 'rgb(var(--muted))'}}>
                        {session.stack.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: session.status === 'completed' 
                              ? 'rgb(var(--success) / 0.15)' 
                              : 'rgb(var(--primary) / 0.15)',
                            color: session.status === 'completed' 
                              ? 'rgb(var(--success))' 
                              : 'rgb(var(--primary))'
                          }}
                        >
                          {session.status}
                        </span>
                        <div className="text-xs" style={{color: 'rgb(var(--muted) / 0.8)'}}>
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