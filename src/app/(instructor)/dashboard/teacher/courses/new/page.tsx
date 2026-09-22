"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useCourseStore } from "@/store/useCourseStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  BookOpen,
  Layers,
  HelpCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function NewCourseBuilderPage() {
  const router = useRouter();
  const { categories, fetchCategories } = useCourseStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [educationLevel, setEducationLevel] = useState("General");
  const [price, setPrice] = useState("0");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lesson Builder State
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      addToast({ type: "warning", message: "Please select a category." });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      formData.append("price", price || "0");
      formData.append("level", level);
      formData.append("educationLevel", educationLevel || "General");
      if (imageFile) formData.append("image", imageFile);

      const res = await api.post("/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newCourse = res.data?.course || res.data?.data || res.data;
      setCreatedCourseId(newCourse._id);

      addToast({
        type: "success",
        title: "Course Created!",
        message: "Course shell initialized. You can now add lesson modules.",
      });
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      let errorMsg = err.response?.data?.message || "Could not create course";
      if (serverErrors && typeof serverErrors === "object") {
        errorMsg = Object.entries(serverErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
      }

      addToast({
        type: "error",
        title: "Validation Error",
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdCourseId) return;

    setIsLessonSubmitting(true);
    try {
      await api.post("/lessons", {
        title: lessonTitle,
        content: lessonContent,
        videoUrl,
        courseId: createdCourseId,
        order: 1,
        isPublished: true,
      });

      addToast({
        type: "success",
        title: "Lesson Added",
        message: `Added module "${lessonTitle}" to course curriculum.`,
      });

      setLessonTitle("");
      setLessonContent("");
      setVideoUrl("");
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Lesson Error",
        message: err.response?.data?.message || "Could not add lesson",
      });
    } finally {
      setIsLessonSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Course & Curriculum Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Design a new course, attach media modules, quizzes, and assignments.
          </p>
        </div>

        {/* Step 1: Course Overview */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
            <BookOpen className="w-5 h-5" />
            <span>Step 1: Course Metadata & Details</span>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-4">
            <Input
              label="Course Title"
              placeholder="e.g. Master React & Next.js 14 Enterprise Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={!!createdCourseId}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Course Summary / Syllabus Description
              </label>
              <textarea
                rows={4}
                placeholder="Detailed overview of learning objectives, prerequisites, and target audience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={!!createdCourseId}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Subject Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={!!createdCourseId}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Education Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. University, High School, General"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={!!createdCourseId}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Price ($ USD)"
                type="number"
                placeholder="49.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={!!createdCourseId}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!!createdCourseId}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {!createdCourseId && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Course Cover Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 cursor-pointer"
                />
              </div>
            )}

            {!createdCourseId && (
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Initialize Course
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Step 2: Lesson Builder (Active once course initialized) */}
        {createdCourseId && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm">
              <Layers className="w-5 h-5" />
              <span>Step 2: Add Curriculum Lessons & Video Content</span>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4">
              <Input
                label="Lesson Module Title"
                placeholder="e.g. Lesson 1: Introduction to State Management Stores"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
              />

              <Input
                label="Video Lecture URL (YouTube or Direct MP4 link)"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Lesson Study Notes & Code Documentation
                </label>
                <textarea
                  rows={4}
                  placeholder="Comprehensive reading material for this lesson..."
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/teacher")}
                >
                  Done Building Course
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isLessonSubmitting}
                >
                  Attach Lesson Module
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
