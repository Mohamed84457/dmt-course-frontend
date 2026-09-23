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
import { useAuthStore } from "@/store/useAuthStore";
import { useAppPreferences } from "@/components/providers/AppPreferences";
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

type EnrollmentStatus =
  | "pending"
  | "active"
  | "completed"
  | "dropped"
  | "cancelled";

export default function TeacherCourseCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const { t } = useAppPreferences();
  const currentUserId = user?._id;

  const [activeTab, setActiveTab] = useState<"syllabus" | "students">(
    "syllabus",
  );
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonFull[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonMaterialUrl, setLessonMaterialUrl] = useState("");
  const [lessonIsPublished, setLessonIsPublished] = useState(true);
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false);

  // Progress Update Modal
  const [selectedEnrollmentForProgress, setSelectedEnrollmentForProgress] =
    useState<Enrollment | null>(null);
  const [newProgressValue, setNewProgressValue] = useState<number>(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Quiz Creator Modal State
  const [activeLessonForQuiz, setActiveLessonForQuiz] = useState<Lesson | null>(
    null,
  );

  // Assignment Creator Modal State
  const [activeLessonForAssign, setActiveLessonForAssign] =
    useState<Lesson | null>(null);

  // Load Course & Curriculum
  const fetchCurriculum = useCallback(async (): Promise<boolean> => {
    if (!courseId) return false;
    setLoading(true);
    try {
      const cRes = await api.get(`/courses/${courseId}`);
      const courseData: Course =
        cRes.data?.course || cRes.data?.data || cRes.data;
      const teacherReference = courseData?.teacherId;
      const teacherObject =
        teacherReference && typeof teacherReference === "object"
          ? teacherReference
          : null;
      const linkedTeacherId =
        teacherObject && "userId" in teacherObject
          ? teacherObject.userId
          : null;
      const ownerIds = [
        typeof teacherReference === "string" ? teacherReference : null,
        teacherObject?._id,
        typeof linkedTeacherId === "string" ? linkedTeacherId : null,
        linkedTeacherId && typeof linkedTeacherId === "object"
          ? linkedTeacherId._id
          : null,
      ].filter((id): id is string => Boolean(id));

      if (!currentUserId || !ownerIds.includes(currentUserId)) {
        setAccessDenied(true);
        setCourse(null);
        setLessons([]);
        return false;
      }

      setAccessDenied(false);
      setCourse(courseData);

      const lRes = await api.get(`/lessons/course/${courseId}`);
      const rawLessons: Lesson[] =
        lRes.data?.lessons ||
        lRes.data?.data ||
        (Array.isArray(lRes.data) ? lRes.data : []);

      // Fetch assessments for each lesson in parallel
      const enrichedLessons: LessonFull[] = await Promise.all(
        rawLessons.map(async (l) => {
          const [qRes, aRes] = await Promise.all([
            api.get(`/quiz/lesson/${l._id}`).catch(() => ({ data: [] })),
            api.get(`/assignments/lesson/${l._id}`).catch(() => ({ data: [] })),
          ]);

          const qList: Quiz[] =
            qRes.data?.quizzes ||
            qRes.data?.data ||
            (Array.isArray(qRes.data) ? qRes.data : []);
          const aList: Assignment[] =
            aRes.data?.assignments ||
            aRes.data?.data ||
            (Array.isArray(aRes.data) ? aRes.data : []);

          return {
            ...l,
            quizzes: qList,
            assignments: aList,
          };
        }),
      );

      setLessons(enrichedLessons);
      return true;
    } catch (err: any) {
      if ([401, 403, 404].includes(err.response?.status)) {
        setAccessDenied(true);
        setCourse(null);
        setLessons([]);
        setEnrollments([]);
        return false;
      }
      console.error(err);
      addToast({
        type: "error",
        title: "Load Error",
        message: "Failed to load course curriculum.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [courseId, currentUserId, addToast]);

  // Load Course Enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!courseId) return;
    setLoadingEnrollments(true);
    try {
      const res = await api.get(`/enrollments/course/${courseId}`);
      const list: Enrollment[] =
        res.data?.enrollments ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      setEnrollments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCurriculum().then((hasAccess) => {
      if (hasAccess) fetchEnrollments();
    });
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
    if (
      !confirm(
        `Are you sure you want to delete lesson "${title}" and all its attached assessments?`,
      )
    ) {
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
    if (!confirm(`Are you sure you want to delete assignment "${aTitle}"?`))
      return;
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
      await api.patch(
        `/enrollments/${selectedEnrollmentForProgress._id}/progress`,
        {
          progress: Number(newProgressValue),
        },
      );

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

  const handleUpdateEnrollmentStatus = async (
    enrollment: Enrollment,
    status: EnrollmentStatus,
  ) => {
    const previousStatus = enrollment.status;
    if (status === previousStatus) return;
    setUpdatingStatusId(enrollment._id);
    setEnrollments((current) =>
      current.map((item) =>
        item._id === enrollment._id ? { ...item, status } : item,
      ),
    );

    try {
      await api.patch(`/enrollments/${enrollment._id}/status`, { status });
      addToast({
        type: "success",
        title: t("statusUpdated"),
        message: `${t("enrollmentStatus")}: ${t(status)}`,
      });
    } catch (err: any) {
      setEnrollments((current) =>
        current.map((item) =>
          item._id === enrollment._id
            ? { ...item, status: previousStatus }
            : item,
        ),
      );
      addToast({
        type: "error",
        title: t("statusUpdateFailed"),
        message: err.response?.data?.message || t("statusUpdateError"),
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filtered student list
  const filteredEnrollments = enrollments.filter((enr) => {
    const student = enr.studentId;
    const studentObject =
      typeof student === "object" && student !== null ? student : null;
    const linkedUser =
      studentObject && "userId" in studentObject
        ? studentObject.userId
        : studentObject;
    const name = (
      linkedUser &&
      typeof linkedUser === "object" &&
      "name" in linkedUser &&
      typeof linkedUser.name === "string"
        ? linkedUser.name
        : ""
    ).toLowerCase();
    const email = (
      linkedUser &&
      typeof linkedUser === "object" &&
      "email" in linkedUser &&
      typeof linkedUser.email === "string"
        ? linkedUser.email
        : ""
    ).toLowerCase();
    const q = studentSearch.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if (accessDenied) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center p-6 lg:pl-72">
          <div className="w-full max-w-lg rounded-3xl border border-rose-500/20 bg-slate-900 p-8 text-center shadow-2xl sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <Eye className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t("courseAccessDenied")}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {t("courseAccessDeniedHint")}
            </p>
            <Link
              href="/dashboard/teacher"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <ArrowLeft className="h-4 w-4" /> {t("backToTeacherDashboard")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
            <ArrowLeft className="w-4 h-4" /> {t("backToInstructorDashboard")}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                  {course?.title || t("courseDetails")}
                </h1>
                {course?.level && (
                  <Badge variant="primary" size="sm">
                    {course.level}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {t("manageCurriculum")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleOpenCreateLesson}
              >
                {t("addLessonModule")}
              </Button>
              {lessons.length > 0 && (
                <Link href={`/learn/${courseId}/${lessons[0]._id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                  >
                    {t("studentView")}
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
                {t("totalModules")}
              </span>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">
                {lessons.length} {t("lessons")}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t("courseFee")}
              </span>
              <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
                {course.price ? formatCurrency(course.price) : t("free")}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t("enrolledCourses")} {t("students")}
              </span>
              <p className="text-base sm:text-lg font-bold text-indigo-400 mt-0.5">
                {enrollments.length || course.enrolledStudentsCount || 0}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t("assessments")}
              </span>
              <p className="text-base sm:text-lg font-bold text-purple-400 mt-0.5">
                {lessons.reduce(
                  (acc, l) =>
                    acc +
                    (l.quizzes?.length || 0) +
                    (l.assignments?.length || 0),
                  0,
                )}{" "}
                {t("items")}
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
            {t("curriculumSyllabus")} ({lessons.length})
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
            {t("enrolledCourseRoster")} ({enrollments.length} {t("students")})
          </button>
        </div>

        {/* TAB 1: CURRICULUM SYLLABUS */}
        {activeTab === "syllabus" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>
                  {t("curriculumSyllabus")} ({lessons.length} {t("modules")})
                </span>
              </h2>

              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleOpenCreateLesson}
              >
                {t("addLesson")}
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
                <h3 className="text-base font-bold text-white">
                  {t("noLessonsCreated")}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {t("buildCurriculumHint")}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreateLesson}
                >
                  {t("createFirstLesson")}
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
                            <h3 className="text-base font-bold text-white">
                              {lesson.title}
                            </h3>
                            {lesson.isPublished ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                                {t("published")}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                                {t("draft")}
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
                          icon={
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                          }
                          onClick={() => setActiveLessonForQuiz(lesson)}
                        >
                          + {t("addQuiz")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={
                            <Upload className="w-3.5 h-3.5 text-purple-400" />
                          }
                          onClick={() => setActiveLessonForAssign(lesson)}
                        >
                          + {t("addAssignment")}
                        </Button>
                        <button
                          onClick={() => handleOpenEditLesson(lesson)}
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title={t("editLesson")}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteLesson(lesson._id, lesson.title)
                          }
                          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title={t("deleteLesson")}
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
                            <span>
                              {t("quizzes")} ({lesson.quizzes?.length || 0})
                            </span>
                          </span>
                          <button
                            onClick={() => setActiveLessonForQuiz(lesson)}
                            className="text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> {t("newQuiz")}
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
                                  <span className="font-semibold text-white block">
                                    {quiz.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {quiz.questions?.length || 0}{" "}
                                    {t("questions")} •{" "}
                                    {quiz.durationMinutes || 15} {t("mins")} •{" "}
                                    {t("pass")}: {quiz.passingMarks || 60}%
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteQuiz(quiz._id, quiz.title)
                                  }
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  title="Delete Quiz"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            {t("noQuizzesAttached")}
                          </p>
                        )}
                      </div>

                      {/* Assignments List */}
                      <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Upload className="w-4 h-4 text-purple-400" />
                            <span>
                              {t("assignments")} (
                              {lesson.assignments?.length || 0})
                            </span>
                          </span>
                          <button
                            onClick={() => setActiveLessonForAssign(lesson)}
                            className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> {t("newAssignment")}
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
                                  <span className="font-semibold text-white block">
                                    {assign.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {t("totalPoints")}: {assign.totalPoints} •{" "}
                                    {t("dueDate")}:{" "}
                                    {assign.dueDate
                                      ? formatDate(assign.dueDate)
                                      : t("noDeadline")}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteAssignment(
                                      assign._id,
                                      assign.title,
                                    )
                                  }
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  title="Delete Assignment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            {t("noAssignmentsAttached")}
                          </p>
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
                  <span>
                    {t("enrolledCourseRoster")} ({enrollments.length}{" "}
                    {t("students")})
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("trackStudentProgress")}
                </p>
              </div>

              {/* Student Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={t("filterStudent")}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {loadingEnrollments ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {t("noEnrolledStudents")}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {studentSearch
                    ? t("noMatchingStudents")
                    : t("noStudentsCourse")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">{t("students")}</th>
                      <th className="px-5 py-4">{t("status")}</th>
                      <th className="px-5 py-4">{t("payment")}</th>
                      <th className="px-5 py-4">{t("progress")}</th>
                      <th className="px-5 py-4">{t("enrolledDate")}</th>
                      <th className="px-5 py-4 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEnrollments.map((enr) => {
                      const student = enr.studentId;
                      const studentObject =
                        typeof student === "object" && student !== null
                          ? student
                          : null;
                      const linkedUser =
                        studentObject && "userId" in studentObject
                          ? studentObject.userId
                          : studentObject;
                      const studentName =
                        linkedUser &&
                        typeof linkedUser === "object" &&
                        "name" in linkedUser &&
                        typeof linkedUser.name === "string"
                          ? linkedUser.name
                          : "Enrolled Student";
                      const studentEmail =
                        linkedUser &&
                        typeof linkedUser === "object" &&
                        "email" in linkedUser &&
                        typeof linkedUser.email === "string"
                          ? linkedUser.email
                          : "No email";
                      const progressVal =
                        enr.progress ?? enr.progressPercentage ?? 0;

                      return (
                        <tr
                          key={enr._id}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {studentName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-white block">
                                  {studentName}
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                  {studentEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <label
                              className="sr-only"
                              htmlFor={`status-${enr._id}`}
                            >
                              {t("updateStatus")}
                            </label>
                            <select
                              id={`status-${enr._id}`}
                              value={
                                (enr.status || "pending") as EnrollmentStatus
                              }
                              disabled={updatingStatusId === enr._id}
                              onChange={(event) =>
                                handleUpdateEnrollmentStatus(
                                  enr,
                                  event.target.value as EnrollmentStatus,
                                )
                              }
                              title={t("updateStatus")}
                              className="max-w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-semibold text-slate-200 outline-none transition-colors focus:border-indigo-500 disabled:opacity-60"
                            >
                              {(
                                [
                                  "pending",
                                  "active",
                                  "completed",
                                  "dropped",
                                  "cancelled",
                                ] as EnrollmentStatus[]
                              ).map((status) => (
                                <option key={status} value={status}>
                                  {t(status)}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                                enr.paymentStatus === "paid" ||
                                enr.paymentStatus === "free"
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
                                <span className="text-slate-300">
                                  {progressVal}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(progressVal, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-400 text-xs">
                            {enr.enrolledAt || enr.createdAt
                              ? formatDate(enr.enrolledAt || enr.createdAt!)
                              : "-"}
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
                              {t("updateProgress")}
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
          title={
            editingLesson ? t("editLessonModule") : t("addLessonModuleTitle")
          }
          description={t("addCurriculumContent").replace(
            "{course}",
            course?.title || t("course"),
          )}
        >
          <form onSubmit={handleSaveLesson} className="space-y-4">
            <Input
              label={t("lessonTitle")}
              placeholder={t("lessonTitlePlaceholder")}
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                {t("lessonContentNotes")}
              </label>
              <textarea
                rows={4}
                placeholder={t("lessonContentPlaceholder")}
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Input
              label={t("materialUrl")}
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
              <label
                htmlFor="isPublishedCheck"
                className="text-xs text-slate-300 font-medium"
              >
                {t("publishImmediately")}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLessonModalOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLessonSubmitting}
              >
                {editingLesson ? t("saveChanges") : t("createLesson")}
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
          title={t("updateStudentProgress")}
          description={t("adjustCompletion")}
        >
          <form onSubmit={handleUpdateStudentProgress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                {t("progressPercentage")}
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
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdatingProgress}
              >
                {t("saveProgress")}
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
