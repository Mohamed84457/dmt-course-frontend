"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Course, Lesson, Quiz, Assignment, Enrollment } from "@/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/store/useUIStore";
import { QuizCreatorModal } from "@/components/courses/QuizCreatorModal";
import { AssignmentCreatorModal } from "@/components/courses/AssignmentCreatorModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  Upload,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Users,
  Search,
  Check,
  Percent,
} from "lucide-react";

interface LessonFull extends Lesson {
  quizzes?: Quiz[];
  assignments?: Assignment[];
}

export default function TeacherCourseCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<"syllabus" | "students">("syllabus");
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonFull[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonMaterialUrl, setLessonMaterialUrl] = useState("");
  const [lessonIsPublished, setLessonIsPublished] = useState(true);
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false);

  // Progress Update Modal
  const [selectedEnrollmentForProgress, setSelectedEnrollmentForProgress] = useState<Enrollment | null>(null);
  const [newProgressValue, setNewProgressValue] = useState<number>(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Quiz Creator Modal State
  const [activeLessonForQuiz, setActiveLessonForQuiz] = useState<Lesson | null>(null);

  // Assignment Creator Modal State
  const [activeLessonForAssign, setActiveLessonForAssign] = useState<Lesson | null>(null);

  // Load Course & Curriculum
  const fetchCurriculum = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        api.get(`/courses/${courseId}`).catch(() => null),
        api.get(`/lessons/course/${courseId}`).catch(() => ({ data: [] })),
      ]);

      const courseData: Course = cRes?.data?.course || cRes?.data?.data || cRes?.data;
      setCourse(courseData);

      const rawLessons: Lesson[] =
        lRes?.data?.lessons || lRes?.data?.data || (Array.isArray(lRes?.data) ? lRes.data : []);

      // Fetch assessments for each lesson in parallel
      const enrichedLessons: LessonFull[] = await Promise.all(
        rawLessons.map(async (l) => {
          const [qRes, aRes] = await Promise.all([
            api.get(`/quiz/lesson/${l._id}`).catch(() => ({ data: [] })),
            api.get(`/assignments/lesson/${l._id}`).catch(() => ({ data: [] })),
          ]);

          const qList: Quiz[] =
            qRes.data?.quizzes || qRes.data?.data || (Array.isArray(qRes.data) ? qRes.data : []);
          const aList: Assignment[] =
            aRes.data?.assignments || aRes.data?.data || (Array.isArray(aRes.data) ? aRes.data : []);

          return {
            ...l,
            quizzes: qList,
            assignments: aList,
          };
        })
      );

      setLessons(enrichedLessons);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Load Error",
        message: "Failed to load course curriculum.",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, addToast]);

  // Load Course Enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!courseId) return;
    setLoadingEnrollments(true);
    try {
      const res = await api.get(`/enrollments/course/${courseId}`);
      const list: Enrollment[] =
        res.data?.enrollments || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setEnrollments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCurriculum();
    fetchEnrollments();
  }, [fetchCurriculum, fetchEnrollments]);

  // Handle Open Create Lesson Modal
  const handleOpenCreateLesson = () => {
    setEditingLesson(null);
    setLessonTitle("");
    setLessonDescription("");
    setLessonMaterialUrl("");
    setLessonIsPublished(true);
    setIsLessonModalOpen(true);
  };

  // Handle Open Edit Lesson Modal
  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description || lesson.content || "");
    setLessonMaterialUrl(lesson.materialUrl || lesson.videoUrl || "");
    setLessonIsPublished(lesson.isPublished ?? true);
    setIsLessonModalOpen(true);
  };

  // Save Lesson (Create or Update)
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      addToast({ type: "warning", message: "Please enter a lesson title." });
      return;
    }

    setIsLessonSubmitting(true);
    try {
      if (editingLesson) {
        // Update Lesson
        await api.patch(`/lessons/${editingLesson._id}`, {
          title: lessonTitle.trim(),
          description: lessonDescription.trim() || undefined,
          materialUrl: lessonMaterialUrl.trim() || undefined,
          isPublished: lessonIsPublished,
        });

        addToast({
          type: "success",
          title: "Lesson Updated",
          message: `Module "${lessonTitle}" updated successfully.`,
        });
      } else {
        // Create Lesson
        await api.post("/lessons", {
          courseId,
          title: lessonTitle.trim(),
          description: lessonDescription.trim() || undefined,
          materialUrl: lessonMaterialUrl.trim() || undefined,
          isPublished: lessonIsPublished,
        });

        addToast({
          type: "success",
          title: "Lesson Created",
          message: `New module "${lessonTitle}" added to curriculum.`,
        });
      }

      setIsLessonModalOpen(false);
      fetchCurriculum();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      let errorMsg = err.response?.data?.message || "Could not save lesson";
      if (serverErrors && typeof serverErrors === "object") {
        errorMsg = Object.entries(serverErrors)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join(" | ");
      }

      addToast({
        type: "error",
        title: "Lesson Error",
        message: errorMsg,
      });
    } finally {
      setIsLessonSubmitting(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${title}" and all its attached assessments?`)) {
      return;
    }

    try {
      await api.delete(`/lessons/${lessonId}`);
      addToast({
        type: "success",
        title: "Lesson Deleted",
        message: `Lesson "${title}" removed from curriculum.`,
      });
      fetchCurriculum();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Delete Error",
        message: err.response?.data?.message || "Could not delete lesson",
      });
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (quizId: string, qTitle: string) => {
    if (!confirm(`Are you sure you want to delete quiz "${qTitle}"?`)) return;
    try {
      await api.delete(`/quiz/${quizId}`);
      addToast({
        type: "success",
        title: "Quiz Deleted",
        message: `Quiz "${qTitle}" removed successfully.`,
      });
      fetchCurriculum();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Delete Error",
        message: err.response?.data?.message || "Could not delete quiz",
      });
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (assignId: string, aTitle: string) => {
    if (!confirm(`Are you sure you want to delete assignment "${aTitle}"?`)) return;
    try {
      await api.delete(`/assignments/${assignId}`);
      addToast({
        type: "success",
        title: "Assignment Deleted",
        message: `Assignment "${aTitle}" removed successfully.`,
      });
      fetchCurriculum();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Delete Error",
        message: err.response?.data?.message || "Could not delete assignment",
      });
    }
  };

  // Update Enrollment Progress
  const handleUpdateStudentProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentForProgress) return;
    setIsUpdatingProgress(true);

    try {
      await api.patch(`/enrollments/${selectedEnrollmentForProgress._id}/progress`, {
        progress: Number(newProgressValue),
      });

      addToast({
        type: "success",
        title: "Progress Updated",
        message: `Student progress set to ${newProgressValue}%.`,
      });

      setSelectedEnrollmentForProgress(null);
      fetchEnrollments();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Progress Update Failed",
        message: err.response?.data?.message || "Could not update progress",
      });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Filtered student list
  const filteredEnrollments = enrollments.filter((enr) => {
    const u = enr.studentId?.userId || enr.studentId;
    const name = (u?.name || "").toLowerCase();
    const email = (u?.email || "").toLowerCase();
    const q = studentSearch.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Instructor Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                  {course?.title || "Course Details"}
                </h1>
                {course?.level && (
                  <Badge variant="primary" size="sm">
                    {course.level}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage curriculum modules, attach interactive quizzes, and inspect student roster & progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleOpenCreateLesson}
              >
                Add Lesson Module
              </Button>
              {lessons.length > 0 && (
                <Link href={`/learn/${courseId}/${lessons[0]._id}`}>
                  <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />}>
                    Student View
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Course Overview Metrics Banner */}
        {course && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Modules
              </span>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">{lessons.length} Lessons</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Price
              </span>
              <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
                {course.price ? formatCurrency(course.price) : "Free"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Enrolled Students
              </span>
              <p className="text-base sm:text-lg font-bold text-indigo-400 mt-0.5">
                {enrollments.length || course.enrolledStudentsCount || 0}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Assessments
              </span>
              <p className="text-base sm:text-lg font-bold text-purple-400 mt-0.5">
                {lessons.reduce((acc, l) => acc + (l.quizzes?.length || 0) + (l.assignments?.length || 0), 0)} Items
              </p>
            </div>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "syllabus"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Curriculum Syllabus ({lessons.length})
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "students"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Enrolled Students ({enrollments.length})
          </button>
        </div>

        {/* TAB 1: CURRICULUM SYLLABUS */}
        {activeTab === "syllabus" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Curriculum Syllabus ({lessons.length} Modules)</span>
              </h2>

              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleOpenCreateLesson}
              >
                Add Lesson
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-36 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : lessons.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Lessons Created Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Begin building this course curriculum by adding your first module, video, reading notes, and assessments.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreateLesson}
                >
                  Create First Lesson Module
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl transition-all hover:border-slate-700"
                  >
                    {/* Module Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="h-9 w-9 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-base font-bold text-white">{lesson.title}</h3>
                            {lesson.isPublished ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                                Draft
                              </span>
                            )}
                          </div>

                          {lesson.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">
                              {lesson.description}
                            </p>
                          )}

                          {lesson.materialUrl && (
                            <div className="pt-1 flex items-center gap-2 text-xs text-indigo-400">
                              <Video className="w-3.5 h-3.5" />
                              <a
                                href={lesson.materialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline truncate max-w-xs"
                              >
                                {lesson.materialUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lesson Actions */}
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<HelpCircle className="w-3.5 h-3.5 text-indigo-400" />}
                          onClick={() => setActiveLessonForQuiz(lesson)}
                        >
                          + Add Quiz
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Upload className="w-3.5 h-3.5 text-purple-400" />}
                          onClick={() => setActiveLessonForAssign(lesson)}
                        >
                          + Add Assignment
                        </Button>
                        <button
                          onClick={() => handleOpenEditLesson(lesson)}
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Lesson"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Assessments Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                      {/* Quizzes List */}
                      <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-indigo-400" />
                            <span>Quizzes ({lesson.quizzes?.length || 0})</span>
                          </span>
                          <button
                            onClick={() => setActiveLessonForQuiz(lesson)}
                            className="text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> New Quiz
                          </button>
                        </div>

                        {lesson.quizzes && lesson.quizzes.length > 0 ? (
                          <div className="space-y-2">
                            {lesson.quizzes.map((quiz) => (
                              <div
                                key={quiz._id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-white block">{quiz.title}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {quiz.questions?.length || 0} Questions • {quiz.durationMinutes || 15} Mins • Pass: {quiz.passingMarks || 60}%
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  title="Delete Quiz"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">No quizzes attached.</p>
                        )}
                      </div>

                      {/* Assignments List */}
                      <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Upload className="w-4 h-4 text-purple-400" />
                            <span>Assignments ({lesson.assignments?.length || 0})</span>
                          </span>
                          <button
                            onClick={() => setActiveLessonForAssign(lesson)}
                            className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> New Assignment
                          </button>
                        </div>

                        {lesson.assignments && lesson.assignments.length > 0 ? (
                          <div className="space-y-2">
                            {lesson.assignments.map((assign) => (
                              <div
                                key={assign._id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-white block">{assign.title}</span>
                                  <span className="text-[10px] text-slate-400">
                                    Points: {assign.totalPoints} • Due: {assign.dueDate ? formatDate(assign.dueDate) : "No deadline"}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteAssignment(assign._id, assign.title)}
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  title="Delete Assignment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">No assignments attached.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENROLLED STUDENTS ROSTER */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Enrolled Course Roster ({enrollments.length} Students)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track student progress, monitor payment status, and manage participation.
                </p>
              </div>

              {/* Student Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter student name/email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {loadingEnrollments ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
                ))}
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Enrolled Students Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {studentSearch ? "No students matching your search." : "No students are currently enrolled in this course."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Progress</th>
                      <th className="px-5 py-4">Enrolled Date</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEnrollments.map((enr) => {
                      const u = enr.studentId?.userId || enr.studentId || {};
                      const studentName = u.name || "Enrolled Student";
                      const studentEmail = u.email || "No email";
                      const progressVal = enr.progress ?? enr.progressPercentage ?? 0;

                      return (
                        <tr key={enr._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {studentName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-white block">{studentName}</span>
                                <span className="text-[11px] text-slate-400 block">{studentEmail}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                enr.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : enr.status === "completed"
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {enr.status || "active"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                                enr.paymentStatus === "paid" || enr.paymentStatus === "free"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {enr.paymentStatus || "free"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1 w-28">
                              <div className="flex justify-between text-[10px] font-semibold">
                                <span className="text-slate-300">{progressVal}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(progressVal, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-400 text-xs">
                            {enr.enrolledAt || enr.createdAt ? formatDate(enr.enrolledAt || enr.createdAt!) : "-"}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Percent className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setSelectedEnrollmentForProgress(enr);
                                setNewProgressValue(progressVal);
                              }}
                            >
                              Update Progress
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lesson Create / Edit Modal */}
      {isLessonModalOpen && (
        <Modal
          isOpen={isLessonModalOpen}
          onClose={() => setIsLessonModalOpen(false)}
          title={editingLesson ? "Edit Lesson Module" : "Add Lesson Module"}
          description={`Add curriculum content for "${course?.title || "course"}".`}
        >
          <form onSubmit={handleSaveLesson} className="space-y-4">
            <Input
              label="Lesson Title"
              placeholder="e.g. Introduction to Asynchronous Programming in JS"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Lesson Content / Notes
              </label>
              <textarea
                rows={4}
                placeholder="Comprehensive text notes, reading material, or lecture overview..."
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Input
              label="Video / Stream / Material URL (Optional)"
              placeholder="https://www.youtube.com/watch?v=... or MP4 URL"
              value={lessonMaterialUrl}
              onChange={(e) => setLessonMaterialUrl(e.target.value)}
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPublishedCheck"
                checked={lessonIsPublished}
                onChange={(e) => setLessonIsPublished(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800 h-4 w-4"
              />
              <label htmlFor="isPublishedCheck" className="text-xs text-slate-300 font-medium">
                Publish immediately (Visible to enrolled students)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLessonModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isLessonSubmitting}>
                {editingLesson ? "Save Changes" : "Create Lesson"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Progress Update Modal */}
      {selectedEnrollmentForProgress && (
        <Modal
          isOpen={!!selectedEnrollmentForProgress}
          onClose={() => setSelectedEnrollmentForProgress(null)}
          title="Update Student Progress"
          description="Manually adjust student completion percentage."
        >
          <form onSubmit={handleUpdateStudentProgress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Progress Percentage (0 - 100%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={newProgressValue}
                onChange={(e) => setNewProgressValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedEnrollmentForProgress(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProgress}>
                Save Progress
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quiz Creator Modal */}
      {activeLessonForQuiz && (
        <QuizCreatorModal
          isOpen={!!activeLessonForQuiz}
          onClose={() => setActiveLessonForQuiz(null)}
          lessonId={activeLessonForQuiz._id}
          lessonTitle={activeLessonForQuiz.title}
          onSuccess={fetchCurriculum}
        />
      )}

      {/* Assignment Creator Modal */}
      {activeLessonForAssign && (
        <AssignmentCreatorModal
          isOpen={!!activeLessonForAssign}
          onClose={() => setActiveLessonForAssign(null)}
          lessonId={activeLessonForAssign._id}
          lessonTitle={activeLessonForAssign.title}
          onSuccess={fetchCurriculum}
        />
      )}
    </div>
  );
}

