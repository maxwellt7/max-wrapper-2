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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h2 className="text-xl font-bold text-base-content">Stacks</h2>
      </div>

      {/* AI Dashboard Link */}
      <div className="p-4 border-b border-base-300">
        <Link
          href="/stacks/dashboard"
          className="block"
        >
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <span className="w-5 h-5 text-primary text-lg">🧠</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-primary">
                AI Performance Analysis
              </div>
              <div className="text-sm text-primary/70">
                Discover mental loops & patterns
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Available Stacks */}
      <div className="p-4 border-b border-base-300">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-3">
          Available Stacks
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-base-300 rounded"></div>
            </div>
          ) : (
            stacks.map((stack) => (
              <Link
                key={stack.id}
                href={`/stacks/${stack.slug}/new`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors">
                  <span className="w-5 h-5 text-primary text-lg">+</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base-content truncate">
                      {stack.title}
                    </div>
                    <div className="text-sm text-base-content/70 truncate">
                      Start new session
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-3">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-base-300 rounded"></div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-base-content/50 py-8">
              <span className="w-12 h-12 mx-auto mb-2 opacity-50 text-4xl">⏰</span>
              <p className="text-sm">No sessions yet</p>
              <p className="text-xs">Start your first stack above</p>
            </div>
          ) : (
            sessions.map((session) => (
              <Link
                key={session.id}
                href={`/stacks/${session.stack.slug}/${session.id}`}
                className="block"
              >
                <div className={`p-3 rounded-lg transition-colors border ${
                  pathname.includes(session.id)
                    ? "bg-primary/10 border-primary/20"
                    : "hover:bg-base-300 border-transparent"
                }`}>
                  <div className="flex items-start gap-3">
                    {session.status === "completed" ? (
                      <span className="w-5 h-5 text-success mt-0.5 text-lg">✅</span>
                    ) : (
                      <span className="w-5 h-5 text-warning mt-0.5 text-lg">⏰</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base-content truncate">
                        {session.title}
                      </div>
                      <div className="text-sm text-base-content/70 truncate">
                        {session.stack.title}
                      </div>
                      <div className="text-xs text-base-content/50 mt-1">
                        {new Date(session.created_at).toLocaleDateString()}
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