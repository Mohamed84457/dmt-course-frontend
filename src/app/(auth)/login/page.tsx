"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PreferenceControls } from "@/components/layout/PreferenceControls";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import { GraduationCap, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  const { t } = useAppPreferences();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      addToast({
        type: "success",
        title: t("welcomeBack"),
        message: t("signedInMessage"),
      });

      let normalizedRoles = user?.role ?? [];
      if (!Array.isArray(normalizedRoles)) normalizedRoles = [normalizedRoles];

      if (
        normalizedRoles.some((r) =>
          ["owner", "admin", "manager"].includes(String(r).toLowerCase()),
        )
      ) {
        router.push("/dashboard/admin");
      } else if (
        normalizedRoles.some((r) =>
          ["teacher", "instructor"].includes(String(r).toLowerCase()),
        )
      ) {
        router.push("/dashboard/teacher");
      } else if (
        normalizedRoles.some((r) =>
          ["student"].includes(String(r).toLowerCase()),
        )
      ) {
        router.push("/dashboard/student");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: unknown) {
      addToast({
        type: "error",
        title: t("authenticationFailed"),
        message: err instanceof Error ? err.message : t("invalidCredentials"),
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
      <div className="mx-auto mt-4 w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-500 text-white mb-4 shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {t("signIn")} to EduSphere
          </h2>
          <p className="text-xs text-slate-400 mt-1">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("emailAddress")}
            type="email"
            placeholder="student@example.com"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label={t("password")}
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-slate-950 border-slate-800 text-indigo-600"
              />
              <span>{t("rememberMe")}</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-indigo-400 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isLoading}
            icon={<LogIn className="w-4 h-4" />}
          >
            {t("signIn")}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-400 hover:underline"
          >
            {t("createAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
