import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 focus:ring-indigo-500",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-600",
    outline:
      "border border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:text-white focus:ring-indigo-500",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25 focus:ring-rose-500",
    ghost:
      "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 focus:ring-slate-600 shadow-none",
    glass:
      "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-lg focus:ring-white/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="inline-block">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
