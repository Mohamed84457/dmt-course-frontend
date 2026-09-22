import React from "react";
import { useUIStore } from "@/store/useUIStore";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
        };

        const borderColors = {
          success: "border-emerald-500/30 bg-emerald-950/40",
          error: "border-rose-500/30 bg-rose-950/40",
          warning: "border-amber-500/30 bg-amber-950/40",
          info: "border-cyan-500/30 bg-cyan-950/40",
        };

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl text-slate-100 animate-in slide-in-from-bottom-5 duration-200",
              borderColors[toast.type]
            )}
          >
            {icons[toast.type]}
            <div className="flex-1 text-sm">
              {toast.title && <h5 className="font-semibold text-white">{toast.title}</h5>}
              <p className="text-slate-300 text-xs leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
