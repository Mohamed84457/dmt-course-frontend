"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { Category } from "@/types";
import { api } from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = () => {
    setLoading(true);
    api.get("/categories")
      .then((res) => {
        const list = res.data?.categories || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setCategories(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Category Builder & Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create high-level learning domains, upload custom imagery, and manage subject taxonomy.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : (
          <CategoryManager categories={categories} onRefresh={loadCategories} />
        )}
      </main>
    </div>
  );
}
