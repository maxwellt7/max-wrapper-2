"use client";

interface ProgressHeaderProps {
  title: string;
  currentIndex: number;
  totalQuestions: number;
  status: string;
}

export function ProgressHeader({ 
  title, 
  currentIndex, 
  totalQuestions, 
  status 
}: ProgressHeaderProps) {
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;
  
  return (
    <div className="bg-base-200 border-b border-base-300 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-base-content truncate">
            {title}
          </h1>
          <div className="text-sm text-base-content/70">
            {status === "completed" ? "Completed" : `${currentIndex} / ${totalQuestions}`}
          </div>
        </div>
        
        <div className="w-full bg-base-300 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        {status === "completed" && (
          <div className="mt-2 text-sm text-success font-medium">
            Stack completed! Review your summary below.
          </div>
        )}
      </div>
    </div>
  );
}