"use client";

interface ManifestoData {
  why?: string;
  who_identity?: string;
  future_goals?: string;
  goal_achiever_identity?: string;
  feelings_truth?: string;
  past_wins_proof?: string;
}

interface ManifestoDisplayProps {
  data: ManifestoData;
}

export function ManifestoDisplay({ data }: ManifestoDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6 space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-primary mb-2">🌅 Your Morning Manifesto</h3>
        <p className="text-sm text-base-content/70">Your foundational beliefs and identity</p>
      </div>

      {data.why && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">🎯 Your WHY</h4>
          <p className="text-base-content/80 leading-relaxed">{data.why}</p>
        </div>
      )}

      {data.who_identity && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">👤 WHO You Are</h4>
          <p className="text-base-content/80 leading-relaxed">{data.who_identity}</p>
        </div>
      )}

      {data.future_goals && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">🚀 Future Self Goals</h4>
          <p className="text-base-content/80 leading-relaxed">{data.future_goals}</p>
        </div>
      )}

      {data.goal_achiever_identity && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">⭐ Goal Achiever Identity</h4>
          <p className="text-base-content/80 leading-relaxed">{data.goal_achiever_identity}</p>
        </div>
      )}

      {data.feelings_truth && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">✨ Feelings That Make It True</h4>
          <p className="text-base-content/80 leading-relaxed">{data.feelings_truth}</p>
        </div>
      )}

      {data.past_wins_proof && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">🏆 Proof of Past Wins</h4>
          <p className="text-base-content/80 leading-relaxed">{data.past_wins_proof}</p>
        </div>
      )}

      <div className="text-center pt-4 border-t border-primary/20">
        <p className="text-sm text-base-content/60 italic">
          "Embody the feelings that activate & anchor any future memory"
        </p>
      </div>
    </div>
  );
}