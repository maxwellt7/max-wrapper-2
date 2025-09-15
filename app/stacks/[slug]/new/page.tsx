"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Stack {
  id: string;
  slug: string;
  title: string;
  description: string;
  questions: Array<{ index: number; key: string; text: string }>;
}

export default function NewStackPage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stack, setStack] = useState<Stack | null>(null);
  const [loadingStack, setLoadingStack] = useState(true);

  useEffect(() => {
    fetchStackInfo();
  }, [params.slug]);

  const fetchStackInfo = async () => {
    try {
      const response = await fetch("/stacks/api/stacks");
      if (response.ok) {
        const stacks = await response.json();
        const currentStack = stacks.find((s: Stack) => s.slug === params.slug);
        setStack(currentStack || null);
      }
    } catch (error) {
      console.error("Error fetching stack info:", error);
    } finally {
      setLoadingStack(false);
    }
  };

  const handleStart = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/stacks/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stackSlug: params.slug,
          title: title.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const session = await response.json();
      router.push(`/stacks/${params.slug}/${session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to start stack session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStack) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Loading stack information...</p>
        </div>
      </div>
    );
  }

  if (!stack) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Stack Not Found</h2>
          <p className="text-base-content/70 mb-4">The requested stack doesn't exist.</p>
          <button 
            onClick={() => router.push('/stacks')}
            className="px-4 py-2 bg-primary text-primary-content rounded-lg"
          >
            Back to Stacks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {stack.title}
          </h1>
          <p className="text-base-content/70 mb-4">
            {stack.description}
          </p>
          <div className="text-sm text-base-content/60 mb-6">
            📝 {stack.questions.length} questions • ~{Math.ceil(stack.questions.length * 2)} minutes
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-base-content mb-2">
              Session Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Reflecting on my relationship with..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              maxLength={100}
            />
            <div className="text-xs text-base-content/50 mt-1">
              Give your session a meaningful title to help you remember it later
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!title.trim() || isLoading}
            className="w-full py-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Starting...
              </span>
            ) : (
              "Begin Stack"
            )}
          </button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => router.push('/stacks')}
            className="text-sm text-base-content/60 hover:text-base-content"
          >
            ← Back to all stacks
          </button>
        </div>
      </div>
    </div>
  );
}