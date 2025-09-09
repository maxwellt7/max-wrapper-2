import { useEffect, useState } from "react";
import { Clock } from "lucide-react"; // Import Clock icon

export function Stopwatch({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
      <Clock className="w-4 h-4 text-zinc-400" />
      <span className="text-sm font-medium text-zinc-600 tabular-nums">
        {(elapsed / 1000).toFixed(1)}s
      </span>
    </div>
  );
}
