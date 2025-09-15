"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StackChat } from "@/components/stacks/StackChat";
import { ProgressHeader } from "@/components/stacks/ProgressHeader";

interface StackSession {
  id: string;
  title: string;
  status: string;
  current_index: number;
  stack: {
    slug: string;
    title: string;
    questions: Array<{
      index: number;
      key: string;
      text: string;
    }>;
  };
}

export default function StackSessionPage() {
  const params = useParams();
  const [session, setSession] = useState<StackSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSession();
  }, [params.sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/stacks/api/session?sessionId=${params.sessionId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }

      const sessionData = await response.json();
      setSession(sessionData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Loading your session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-error mb-2">
            {error || "Session not found"}
          </h2>
          <p className="text-base-content/70 mb-4">
            Please try again or start a new session.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-primary-content rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ProgressHeader
        title={session.title}
        currentIndex={session.current_index}
        totalQuestions={session.stack.questions.length}
        status={session.status}
      />
      
      <StackChat
        session={session}
        onSessionUpdate={setSession}
      />
    </div>
  );
}