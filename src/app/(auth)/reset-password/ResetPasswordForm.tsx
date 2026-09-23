"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import { PreferenceControls } from "@/components/layout/PreferenceControls";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Save,
} from "lucide-react";

export function ResetPasswordForm({
  resetToken,
}: Readonly<{ resetToken: string }>) {
  const router = useRouter();
  const { resetPassword } = useAuthStore();
  const { addToast } = useUIStore();
  const { t } = useAppPreferences();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({
        type: "error",
        title: t("resetPassword"),
        message: t("passwordMismatch"),
      });
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccess(true);
      addToast({
        type: "success",
        title: t("resetSuccess"),
        message: t("resetSuccessMessage"),
      });
    } catch (error: unknown) {
      addToast({
        type: "error",
        title: t("resetPassword"),
        message:
          error instanceof Error ? error.message : t("missingResetToken"),
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
            {success ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <GraduationCap className="h-7 w-7" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {success ? t("resetSuccess") : t("resetTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {success ? t("resetSuccessMessage") : t("resetSubtitle")}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("newPassword")}
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
            />
            <Input
              label={t("confirmPassword")}
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              icon={<Save className="h-4 w-4" />}
            >
              {t("resetPassword")}
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            className="w-full"
            onClick={() => router.push("/login")}
            icon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}
          >
            {t("backToSignIn")}
          </Button>
        )}

        {!success && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("backToSignIn")}
          </Link>
        )}
      </div>
    </div>
  );
}
