"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GraduationCap, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      addToast({
        type: "success",
        title: "Welcome Back!",
        message: "Successfully signed into your account.",
      });

      const roles = Array.isArray(user?.role)
        ? user.role
        : user?.role
        ? [user.role]
        : [];

      if (roles.some((r) => ["owner", "admin", "manager"].includes(String(r).toLowerCase()))) {
        router.push("/dashboard/admin");
      } else if (roles.some((r) => ["teacher", "instructor"].includes(String(r).toLowerCase()))) {
        router.push("/dashboard/teacher");
      } else if (roles.some((r) => ["student"].includes(String(r).toLowerCase()))) {
        router.push("/dashboard/student");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Authentication Failed",
        message: err.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white mb-4 shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to EduSphere</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@example.com"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-indigo-600" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-indigo-400 hover:underline">
              Forgot password?
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
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-indigo-400 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
