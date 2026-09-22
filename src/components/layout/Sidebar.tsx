"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { hasAnyRole } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  FolderTree,
  CreditCard,
  FileCheck,
  Award,
  Settings,
  X,
  PlusCircle,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (!user) return null;

  const isStaff = hasAnyRole(user.role, ["owner", "admin", "manager"]);
  const isTeacher = hasAnyRole(user.role, ["teacher", "instructor"]);

  const studentLinks = [
    { href: "/dashboard/student", label: "My Overview", icon: LayoutDashboard },
    { href: "/courses", label: "Browse Catalog", icon: BookOpen },
    { href: "/profile", label: "Account Profile", icon: Settings },
  ];

  const teacherLinks = [
    { href: "/dashboard/teacher", label: "Teaching Hub", icon: LayoutDashboard },
    { href: "/dashboard/teacher/courses/new", label: "New Course", icon: PlusCircle },
    { href: "/dashboard/teacher/grading", label: "Submissions & Grading", icon: FileCheck },
    { href: "/profile", label: "Profile", icon: Settings },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: "Executive Analytics", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users & Roles", icon: Users },
    { href: "/dashboard/admin/teachers", label: "Teacher Roster", icon: GraduationCap },
    { href: "/dashboard/admin/organizations", label: "Organizations", icon: Building2 },
    { href: "/dashboard/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/dashboard/admin/payments", label: "Financial Ledger", icon: CreditCard },
  ];

  const navLinks = isStaff ? adminLinks : isTeacher ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Header / Mobile Close */}
            <div className="flex items-center justify-between px-2 lg:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Menu Navigation
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card Summary */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
                <span className="text-[11px] text-indigo-400 font-medium capitalize">
                  {user.role[0]} Portal
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 p-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
              <Award className="w-4 h-4" />
              <span>EduSphere LMS</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Production-Ready Course Platform v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
