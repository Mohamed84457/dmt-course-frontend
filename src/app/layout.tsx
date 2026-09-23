"use client";

import React, { useEffect } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { NotificationDrawer } from "@/components/layout/NotificationDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePathname, useRouter } from "next/navigation";
import { AppPreferences } from "@/components/providers/AppPreferences";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, fetchMe, isAuthenticated, isLoading } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isAuthPage) router.replace("/login");
    if (isAuthenticated && isAuthPage) router.replace("/dashboard/student");
  }, [isAuthenticated, isAuthPage, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated || user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  const isLearningRoom = pathname.startsWith("/learn/");
  const showProtectedContent = isAuthenticated && !isLoading;

  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
        <AppPreferences>
          {!isLearningRoom && showProtectedContent && <Navbar />}
          {showProtectedContent && <NotificationDrawer />}
          <ToastContainer />
          <main className="flex-1">
            {isAuthPage || showProtectedContent ? children : null}
          </main>
          {!isLearningRoom && showProtectedContent && <Footer />}
        </AppPreferences>
      </body>
    </html>
  );
}
