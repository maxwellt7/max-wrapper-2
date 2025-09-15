"use client";

import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

export function MessageBubble({ role, content, timestamp, isLoading }: MessageBubbleProps) {
  const isAssistant = role === "assistant";
  
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[80%] ${isAssistant ? "mr-12" : "ml-12"}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isAssistant
              ? "bg-base-200 text-base-content"
              : "bg-primary text-primary-content"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="loading loading-dots loading-sm"></div>
              <span className="text-sm opacity-70">Thinking...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
        
        <div
          className={`text-xs text-base-content/50 mt-1 ${
            isAssistant ? "text-left" : "text-right"
          }`}
        >
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}