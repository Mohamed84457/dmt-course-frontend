"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import {
  Mail,
  MailCheck,
  ExternalLink,
  LogIn,
  Sparkles,
  AlertCircle,
  Clock,
} from "lucide-react";

function VerifyEmailPendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { t } = useAppPreferences();

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
          <MailCheck className="h-8 w-8" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> {t("verifyAlmostThere")}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {t("verifyEmailTitle")}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {t("verifyEmailMessage")}{" "}
            {email ? (
              <span className="font-semibold text-slate-100 underline decoration-indigo-500 underline-offset-4">
                {email}
              </span>
            ) : (
              t("yourEmailAddress")
            )}
            . {t("verifyEmailActivate")}
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl text-left space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              {t("linkValidFor")} <strong>15 {t("minutes")}</strong>.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{t("checkSpam")}</span>
          </div>
        </div>

        {/* Quick Email Service Shortcuts */}
        <div className="pt-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">
            {t("openEmailProvider")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-red-400" />
              {t("openGmail")}
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href="https://outlook.live.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-sky-400" />
              {t("openOutlook")}
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Back to sign in */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-3">
          <Link href="/login">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              icon={<LogIn className="w-4 h-4" />}
            >
              {t("backToSignIn")}
            </Button>
          </Link>
          <div className="text-xs text-slate-500">
            {t("wrongEmail")}{" "}
            <Link href="/register" className="text-indigo-400 hover:underline">
              {t("registerAnotherEmail")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyEmailPendingContent />
    </Suspense>
  );
}
