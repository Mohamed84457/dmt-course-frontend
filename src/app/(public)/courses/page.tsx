"use client";

import React, { useEffect, useState } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import { CourseCard } from "@/components/courses/CourseCard";
import { Input } from "@/components/ui/Input";
import { Search, BookOpen } from "lucide-react";
import { useAppPreferences } from "@/components/providers/AppPreferences";

export default function CoursesPage() {
  const { courses, categories, fetchCourses, fetchCategories } =
    useCourseStore();
  const { t } = useAppPreferences();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [fetchCourses, fetchCategories]);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    const catId = typeof c.category === "object" ? c.category?._id : c.category;
    const matchesCategory = selectedCat === "all" || catId === selectedCat;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-slate-100">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          {t("knowledgeBase")}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          {t("courseCatalog")}
        </h1>
        <p className="text-sm text-slate-400 mt-2">{t("discoverCourses")}</p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder={t("searchCourseTopic")}
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            {t("allCourses")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCat(cat._id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat._id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center p-8">
          <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-200">
            {t("noCoursesMatch")}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {t("adjustSearch")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
