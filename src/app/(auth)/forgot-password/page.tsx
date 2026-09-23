"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import { PreferenceControls } from "@/components/layout/PreferenceControls";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const { addToast } = useUIStore();
  const { t } = useAppPreferences();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (error: unknown) {
      addToast({
        type: "error",
        title: t("registrationFailed"),
        message:
          error instanceof Error ? error.message : t("registrationError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] px-4 py-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-md justify-end">
        <PreferenceControls />
      </div>
      <div className="mx-auto mt-4 w-full max-w-md space-y-7 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
            {sent ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <GraduationCap className="h-7 w-7" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {sent ? t("resetEmailSent") : t("forgotTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {sent ? t("resetEmailSentMessage") : t("forgotSubtitle")}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("emailAddress")}
              type="email"
              placeholder="student@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              icon={<Send className="h-4 w-4" />}
            >
              {t("sendResetLink")}
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("backToSignIn")}
        </Link>
      </div>
    </div>
  );
}
