"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TeacherRoster } from "@/components/dashboard/TeacherRoster";
import { User } from "@/types";
import { api } from "@/lib/api";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeachers = () => {
    setLoading(true);
    api.get("/teacher")
      .then((res) => {
        const list = res.data?.teacher || res.data?.teachers || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setTeachers(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Teacher & Faculty Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage course instructors, hire new faculty members, and audit teaching assignments.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : (
          <TeacherRoster teachers={teachers} onRefresh={loadTeachers} />
        )}
      </main>
    </div>
  );
}
