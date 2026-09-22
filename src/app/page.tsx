"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useCourseStore } from "@/store/useCourseStore";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { courses, categories, fetchCourses, fetchCategories } = useCourseStore();

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [fetchCourses, fetchCategories]);

  const featuredCourses = courses.slice(0, 6);

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Decorative Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-28 lg:pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="h-4 w-4" />
          <span>Next-Generation Learning Platform</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl max-w-4xl mx-auto leading-[1.15]">
          Master Future-Proof Skills with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            World-Class Courses
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Accelerate your career through interactive lessons, real-world assignments, live quizzes, and industry-recognized certifications.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses">
            <Button
              variant="primary"
              size="lg"
              icon={<BookOpen className="w-5 h-5" />}
              className="shadow-indigo-500/30 shadow-lg"
            >
              Explore Catalog
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl">
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-bold text-white">10K+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Active Students</div>
          </div>
          <div className="text-center p-3 border-l border-slate-800">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-400">250+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Expert Courses</div>
          </div>
          <div className="text-center p-3 border-l border-slate-800">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">99.8%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Satisfaction Rate</div>
          </div>
          <div className="text-center p-3 border-l border-slate-800">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">50+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Partner Organizations</div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Curated Curriculum
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Featured Courses</h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredCourses.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Browse Domains
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Explore By Category</h2>
          <p className="text-sm text-slate-400 mt-2">
            Find the perfect learning pathway tailored to your professional goals.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              href={`/courses?category=${cat._id}`}
              className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all text-center flex flex-col items-center"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                {cat.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us Feature Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white">Interactive Classroom</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Seamlessly transition between video lectures, automated quizzes, and instructor-graded code assignments.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Globe className="w-6 h-6" />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white">Multi-Organization Ecosystem</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Connect with leading university partners, corporate training hubs, and specialized academies.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white">Verified Qualifications</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Earn verifiable certificates upon completing course modules and achieving passing quiz scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-10 md:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="mt-4 text-sm text-slate-300 max-w-lg mx-auto">
            Join thousands of active students and instructors building the future of digital education today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
