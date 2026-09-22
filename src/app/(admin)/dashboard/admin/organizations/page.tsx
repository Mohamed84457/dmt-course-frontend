"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { OrganizationManager } from "@/components/dashboard/OrganizationManager";
import { Organization } from "@/types";
import { api } from "@/lib/api";

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrgs = () => {
    setLoading(true);
    api.get("/organization/all")
      .catch(() => api.get("/organization"))
      .then((res) => {
        const list = res.data?.organizations || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setOrgs(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Organization Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Register university hubs, corporate organizations, and partner academies.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : (
          <OrganizationManager organizations={orgs} onRefresh={loadOrgs} />
        )}
      </main>
    </div>
  );
}
