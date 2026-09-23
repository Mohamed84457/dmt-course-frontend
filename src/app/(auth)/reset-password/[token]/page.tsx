"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ResetPasswordForm } from "../ResetPasswordForm";

export default function ResetPasswordTokenPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  return <ResetPasswordForm resetToken={token || ""} />;
}
