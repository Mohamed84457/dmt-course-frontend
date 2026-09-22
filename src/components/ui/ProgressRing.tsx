import React from "react";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  colorClassName?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 48,
  strokeWidth = 4,
  colorClassName = "text-indigo-500",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClassName} transition-all duration-500 ease-out`}
          fill="transparent"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">
        {Math.round(progress)}%
      </span>
    </div>
  );
};
