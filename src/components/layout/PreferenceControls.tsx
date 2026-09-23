"use client";

import React from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { useAppPreferences } from "@/components/providers/AppPreferences";

export const PreferenceControls: React.FC = () => {
  const { theme, toggleTheme, toggleLocale, t } = useAppPreferences();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={toggleLocale}
        aria-label={t("language")}
        title={t("language")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        <Languages className="h-4 w-4" />
        <span>{t("language")}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
        title={theme === "dark" ? t("lightMode") : t("darkMode")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};
