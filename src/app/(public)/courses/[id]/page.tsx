"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCourseStore } from "@/store/useCourseStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Course, Lesson } from "@/types";
import { getImageUrl, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EnrollmentModal } from "@/components/courses/EnrollmentModal";
import {
  BookOpen,
  UserCheck,
  CheckCircle2,
  Lock,
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { fetchCourseById, fetchCourseLessons } = useCourseStore();
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      Promise.all([fetchCourseById(courseId), fetchCourseLessons(courseId)])
        .then(([c, l]) => {
          setCourse(c);
          setLessons(l);
        })
        .finally(() => setLoading(false));
    }
  }, [courseId, fetchCourseById, fetchCourseLessons]);

  if (loading || !course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const categoryName = typeof course.category === "object" ? course.category?.name : "General";
  const teacherObj = typeof course.teacherId === "object" ? (course.teacherId as any) : null;
  const userObj = teacherObj && typeof teacherObj.userId === "object" ? teacherObj.userId : null;
  const teacherName = userObj?.name || teacherObj?.name || "Instructor";

  const handleEnrollTrigger = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setEnrollModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-slate-100">
      {/* Top Hero Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="purple">{categoryName}</Badge>
            {course.level && <Badge variant="secondary" className="capitalize">{course.level}</Badge>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {course.title}
          </h1>

          <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Instructor: <strong className="text-white">{teacherName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>{lessons.length} Modules / Lessons</span>
            </div>
          </div>
        </div>

        {/* Purchase / Enrollment Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={getImageUrl(course.image || course.thumbnail)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Course Tuition</span>
              <span className="text-3xl font-extrabold text-white">
                {course.price === 0 ? "Free" : formatCurrency(course.price)}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full lifetime access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Quizzes & coding assignment review</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Certificate of completion</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-indigo-500/25 shadow-lg"
              onClick={handleEnrollTrigger}
            >
              Enroll in Course
            </Button>
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown Section */}
      <div className="border-t border-slate-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>

        {lessons.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            Lessons are currently being published for this course curriculum.
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson._id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{lesson.title}</h4>
                    <span className="text-[11px] text-slate-400">
                      {lesson.videoUrl ? "Video Lecture" : "Reading Module"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAuthenticated ? (
                    <button
                      onClick={() => router.push(`/learn/${course._id}/${lesson._id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 text-indigo-400 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" /> Start Lesson
                    </button>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EnrollmentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        course={course}
      />
    </div>
  );
}
