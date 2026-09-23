"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { useAppPreferences } from "@/components/providers/AppPreferences";

function QueryResetPassword() {
  const searchParams = useSearchParams();
  const { t } = useAppPreferences();
  const token =
    searchParams.get("token") || searchParams.get("resetToken") || "";

  if (!token) {
    return (
      <p className="mx-auto max-w-md px-4 py-24 text-center text-rose-400">
        {t("missingResetToken")}
      </p>
    );
  }

  return <ResetPasswordForm resetToken={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <QueryResetPassword />
    </Suspense>
  );
}
