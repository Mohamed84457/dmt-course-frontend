"use client";

import React, { useEffect } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { NotificationDrawer } from "@/components/layout/NotificationDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchMe, isAuthenticated } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const pathname = usePathname();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (isAuthenticated || user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  const isLearningRoom = pathname.startsWith("/learn/");

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
        {!isLearningRoom && <Navbar />}
        <NotificationDrawer />
        <ToastContainer />
        <main className="flex-1">{children}</main>
        {!isLearningRoom && <Footer />}
      </body>
    </html>
  );
}
