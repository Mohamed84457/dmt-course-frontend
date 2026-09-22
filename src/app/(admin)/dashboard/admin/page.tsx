"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { User, Course, Organization, Payment } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  BookOpen,
  Building2,
  CreditCard,
  TrendingUp,
  Activity,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/users").catch(() => ({ data: [] })),
      api.get("/courses").catch(() => ({ data: [] })),
      api.get("/organization/all").catch(() => api.get("/organization")),
      api.get("/payments").catch(() => ({ data: [] })),
    ]).then(([uRes, cRes, oRes, pRes]) => {
      setUsers(uRes.data?.users || uRes.data?.data || (Array.isArray(uRes.data) ? uRes.data : []));
      setCourses(cRes.data?.courses || cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : []));
      setOrgs(oRes.data?.organizations || oRes.data?.data || (Array.isArray(oRes.data) ? oRes.data : []));
      setPayments(pRes.data?.payments || pRes.data?.data || (Array.isArray(pRes.data) ? pRes.data : []));
      setLoading(false);
    });
  }, []);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            System Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
            Executive Analytics & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform overview, user management, and revenue monitoring.
          </p>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change="+14.2%"
            icon={<CreditCard className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10 text-emerald-400"
          />
          <StatCard
            title="Registered Users"
            value={users.length}
            change="+8.5%"
            icon={<Users className="w-5 h-5 text-indigo-400" />}
          />
          <StatCard
            title="Published Courses"
            value={courses.length}
            icon={<BookOpen className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/10 text-purple-400"
          />
          <StatCard
            title="Organizations"
            value={orgs.length}
            icon={<Building2 className="w-5 h-5 text-cyan-400" />}
            iconBg="bg-cyan-500/10 text-cyan-400"
          />
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/admin/users"
            className="group p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                User & Role Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Assign Owner, Admin, Manager, Teacher, or Student roles.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 mt-4 inline-block">
              Manage Users →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/teachers"
            className="group p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                Teacher Roster
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Hire instructors, assign department credentials.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-400 mt-4 inline-block">
              Faculty Portal →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/payments"
            className="group p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                Financial Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Record manual receipts, track tuition transfers.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 mt-4 inline-block">
              View Ledger →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
