"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/Button";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogIn,
  GraduationCap,
} from "lucide-react";

export default function VerifyEmailTokenPage() {
  const params = useParams();
  const router = useRouter();
  const { verifyEmail } = useAuthStore();
  const { addToast } = useUIStore();
  const { t } = useAppPreferences();

  const rawToken = params?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);

  const verificationAttempted = useRef(false);

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setErrorMessage(t("noVerificationToken"));
      return;
    }

    setStatus("verifying");
    setErrorMessage("");

    try {
      const response = await verifyEmail(token);
      setStatus("success");
      addToast({
        type: "success",
        title: t("emailVerified"),
        message: response?.message || t("emailVerifiedMessage"),
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || t("verificationFailed"));
    }
  };

  useEffect(() => {
    if (!verificationAttempted.current && token) {
      verificationAttempted.current = true;
      handleVerify();
    }
  }, [token]);

  // Automatic countdown and redirect on success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "success" && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (status === "success" && countdown === 0) {
      router.push("/login");
    }
    return () => clearTimeout(timer);
  }, [status, countdown, router]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center">
        {/* Decorative Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-500 text-white mb-6 shadow-lg shadow-indigo-500/25">
          <GraduationCap className="h-7 w-7" />
        </div>

        {/* State: Verifying */}
        {status === "verifying" && (
          <div className="space-y-6 py-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {t("verifyingEmail")}
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                {t("validatingLink")}
              </p>
            </div>
          </div>
        )}

        {/* State: Success */}
        {status === "success" && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 animate-bounce-short">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> {t("accountActivated")}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {t("verifiedSuccessfully")}
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {t("accountActiveMessage")}
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
              {t("redirectingLogin")}{" "}
              <span className="font-semibold text-indigo-400">
                {countdown}s
              </span>
              ...
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => router.push("/login")}
                icon={<LogIn className="w-4 h-4" />}
              >
                {t("signIn")} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* State: Error */}
        {status === "error" && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {t("verificationFailedTitle")}
              </h2>
              <p className="text-sm text-rose-300 mt-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-xs text-slate-400 mt-3">{t("linksExpire")}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                className="w-full flex-1"
                onClick={handleVerify}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                {t("retry")}
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-full flex-1"
                onClick={() => router.push("/login")}
                icon={<LogIn className="w-4 h-4" />}
              >
                Go to Sign In
              </Button>
            </div>

            <div className="text-xs text-slate-500 pt-2">
              Need assistance?{" "}
              <Link
                href="/register"
                className="text-indigo-400 hover:underline"
              >
                Create new account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
