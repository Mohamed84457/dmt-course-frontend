"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUIStore } from "@/store/useUIStore";
import { useCourseStore } from "@/store/useCourseStore";
import { getImageUrl, hasAnyRole } from "@/lib/utils";
import {
  GraduationCap,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  BookOpen,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/Button";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { toggleNotificationDrawer, toggleSidebar } = useUIStore();
  const { searchQuery, setSearchQuery } = useCourseStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (hasAnyRole(user.role, ["owner", "admin", "manager"])) return "/dashboard/admin";
    if (hasAnyRole(user.role, ["teacher", "instructor"])) return "/dashboard/teacher";
    return "/dashboard/student";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              Edu<span className="text-indigo-400">Sphere</span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar & Public Links */}
        <div className="hidden md:flex items-center gap-6 flex-1 max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Search courses, skills, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <nav className="flex items-center gap-4 text-sm font-medium text-slate-300">
            <Link
              href="/courses"
              className={`hover:text-indigo-400 transition-colors ${
                pathname.startsWith("/courses") ? "text-indigo-400 font-semibold" : ""
              }`}
            >
              Courses
            </Link>
            <Link
              href="/organizations"
              className={`hover:text-indigo-400 transition-colors ${
                pathname.startsWith("/organizations") ? "text-indigo-400 font-semibold" : ""
              }`}
            >
              Organizations
            </Link>
          </nav>
        </div>

        {/* Right: Actions / Auth / Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications Bell */}
              <button
                onClick={toggleNotificationDrawer}
                className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Dashboard Quick Link */}
              <Link href={getDashboardPath()} className="hidden sm:block">
                <Button variant="outline" size="sm" icon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard
                </Button>
              </Link>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800/60"
                >
                  <img
                    src={getImageUrl(user?.profileImage)}
                    alt={user?.name || "User"}
                    className="h-8 w-8 rounded-lg object-cover bg-slate-800 border border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="hidden md:inline-block text-xs font-semibold text-slate-200">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user?.role?.map((r) => (
                          <span
                            key={r}
                            className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={getDashboardPath()}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      My Profile
                    </Link>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
