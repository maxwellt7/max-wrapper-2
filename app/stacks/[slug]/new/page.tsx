"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewStackPage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Start Your {params.slug === "gratitude" ? "Gratitude" : "New"} Stack
          </h1>
          <p className="text-base-content/70">
            Give your stack session a meaningful title to begin.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-base-content mb-2">
              Session Title
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Reflecting on my relationship with..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!title.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? "Starting..." : "Begin Stack"}
          </Button>
        </div>
      </div>
    </div>
  );
}