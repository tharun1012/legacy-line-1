import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBadge({ score, maxScore = 10, label, size = "md", className }: ScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreClass = () => {
    if (percentage >= 80) return "score-excellent";
    if (percentage >= 60) return "score-good";
    if (percentage >= 40) return "score-average";
    return "score-poor";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "px-2 py-1 text-xs font-medium";
      case "lg": return "px-4 py-2 text-base font-bold";
      default: return "px-3 py-1.5 text-sm font-semibold";
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full shadow-button transition-smooth",
      getScoreClass(),
      getSizeClasses(),
      className
    )}>
      <span className="flex items-center gap-1">
        {label && <span className="opacity-90">{label}:</span>}
        <span>{score.toFixed(1)}</span>
        {maxScore && <span className="opacity-75">/{maxScore}</span>}
      </span>
    </div>
  );
}