"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserTable } from "@/components/dashboard/UserTable";
import { User } from "@/types";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    api.get("/users")
      .then((res) => {
        const list = res.data?.users || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setUsers(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            User & Role Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control user access privileges, assign RBAC roles, and toggle account activation status.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : (
          <UserTable users={users} onRefresh={loadUsers} />
        )}
      </main>
    </div>
  );
}
