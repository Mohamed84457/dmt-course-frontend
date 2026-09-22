import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  iconBg = "bg-indigo-500/10 text-indigo-400",
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={cn("p-2.5 rounded-xl border border-white/5", iconBg)}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {change && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full border",
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
