"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCourseStore } from "@/store/useCourseStore";
import { Lesson, Quiz, Assignment, AssignmentSubmission, QuizSubmission } from "@/types";
import { api } from "@/lib/api";
import { QuizPlayer } from "@/components/courses/QuizPlayer";
import { AssignmentSubmissionModal } from "@/components/courses/AssignmentSubmissionModal";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  PlayCircle,
  FileText,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Upload,
  Menu,
  X,
  ExternalLink,
  Globe,
  Award,
  BookOpen,
  MessageSquare,
} from "lucide-react";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".m4v")
  );
};

export default function InteractiveClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const currentLessonId = params.lessonId as string;

  const { fetchCourseById, fetchCourseLessons, activeCourse, activeLessons } = useCourseStore();

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Record<string, AssignmentSubmission>>({});
  const [quizSubmissions, setQuizSubmissions] = useState<Record<string, QuizSubmission>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
      fetchCourseLessons(courseId).then((lessons) => {
        if (lessons.length > 0) {
          const match =
            lessons.find((l) => l._id === currentLessonId) || lessons[0];
          setCurrentLesson(match);
        }
      });
    }
  }, [courseId, currentLessonId, fetchCourseById, fetchCourseLessons]);

  const loadLessonAssessments = useCallback(async () => {
    if (!currentLesson?._id) return;

    try {
      const [quizRes, assignRes] = await Promise.all([
        api.get(`/quiz/lesson/${currentLesson._id}`).catch(() => ({ data: [] })),
        api.get(`/assignments/lesson/${currentLesson._id}`).catch(() => ({ data: [] })),
      ]);

      const qList: Quiz[] =
        quizRes.data?.quizzes || quizRes.data?.data || (Array.isArray(quizRes.data) ? quizRes.data : []);
      const aList: Assignment[] =
        assignRes.data?.assignments || assignRes.data?.data || (Array.isArray(assignRes.data) ? assignRes.data : []);

      setQuizzes(qList);
      setAssignments(aList);

      // Fetch student submissions for assignments
      const subMap: Record<string, AssignmentSubmission> = {};
      await Promise.all(
        aList.map(async (assign) => {
          try {
            const sRes = await api.get(`/submission-assignment/my/${assign._id}`).catch(() => null);
            if (sRes?.data?.submission) {
              subMap[assign._id] = sRes.data.submission;
            }
          } catch (e) {}
        })
      );
      setAssignmentSubmissions(subMap);

      // Fetch student submissions for quizzes
      const qSubMap: Record<string, QuizSubmission> = {};
      await Promise.all(
        qList.map(async (quiz) => {
          try {
            const qsRes = await api.get(`/quiz-submissions/my/${quiz._id}`).catch(() => null);
            if (qsRes?.data?.submission) {
              qSubMap[quiz._id] = qsRes.data.submission;
            }
          } catch (e) {}
        })
      );
      setQuizSubmissions(qSubMap);
    } catch (err) {
      console.error(err);
    }
  }, [currentLesson]);

  useEffect(() => {
    loadLessonAssessments();
  }, [loadLessonAssessments]);

  if (!activeCourse || !currentLesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mediaUrl = currentLesson.materialUrl || currentLesson.videoUrl || "";
  const isVideo = isVideoUrl(mediaUrl);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar: Curriculum Navigation */}
      <aside
        className={`w-80 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-xs font-bold text-indigo-400 truncate max-w-[150px]">
            {activeCourse.title}
          </span>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Module Syllabus ({activeLessons.length})
          </span>

          {activeLessons.map((l, idx) => {
            const isActive = l._id === currentLesson._id;

            return (
              <button
                key={l._id}
                onClick={() => {
                  setCurrentLesson(l);
                  setActiveQuiz(null);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 border border-indigo-500/40 text-white font-semibold shadow-sm"
                    : "bg-slate-950/40 border border-slate-800/80 text-slate-300 hover:bg-slate-950"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                    isActive ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="block truncate">{l.title}</span>
                  <span className="text-[10px] text-slate-500">Lesson {idx + 1}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-bold text-white truncate max-w-md">
              {currentLesson.title}
            </h2>
          </div>
        </div>

        {/* Lesson View Area */}
        <div className="flex-1 p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Active Quiz Overlay */}
          {activeQuiz ? (
            <div>
              <button
                onClick={() => {
                  setActiveQuiz(null);
                  loadLessonAssessments();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Lesson Notes
              </button>
              <QuizPlayer quiz={activeQuiz} />
            </div>
          ) : (
            <>
              {/* Media Section: Video OR External Learning Resource Link */}
              {mediaUrl ? (
                isVideo ? (
                  <div className="aspect-video w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative flex items-center justify-center">
                    {mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be") ? (
                      <iframe
                        src={mediaUrl
                          .replace("watch?v=", "embed/")
                          .replace("youtu.be/", "youtube.com/embed/")}
                        title={currentLesson.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">
                          External Learning Material & Resource
                        </h3>
                        <p className="text-xs text-slate-300">
                          This lesson includes supplementary documentation, project repositories, or interactive study guides.
                        </p>
                        <p className="text-[11px] text-indigo-400 truncate max-w-lg pt-1">
                          {mediaUrl}
                        </p>
                      </div>
                    </div>

                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/25 shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Resource Link
                    </a>
                  </div>
                )
              ) : (
                <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 text-center">
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white">Interactive Reading Module</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Study the notes below and complete the module quizzes & assignments.
                  </p>
                </div>
              )}

              {/* Lesson Text Notes */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
                <h3 className="text-xl font-bold text-white">{currentLesson.title}</h3>
                <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentLesson.description ||
                    currentLesson.content ||
                    "No text notes provided for this lesson module."}
                </div>
              </div>

              {/* Lesson Assessment Widgets (Quizzes & Assignments) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quizzes Box */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <HelpCircle className="w-5 h-5" />
                    <h4 className="text-base font-bold text-white">Lesson Quizzes</h4>
                  </div>

                  {quizzes.length === 0 ? (
                    <p className="text-xs text-slate-400">No quizzes attached to this lesson.</p>
                  ) : (
                    quizzes.map((quiz) => {
                      const studentQuizSub = quizSubmissions[quiz._id];

                      return (
                        <div
                          key={quiz._id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-bold text-white">{quiz.title}</h5>
                              <span className="text-[10px] text-slate-400">
                                {quiz.questions?.length || 0} Questions • Pass: {quiz.passingMarks || 60}%
                              </span>
                            </div>

                            {studentQuizSub && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  studentQuizSub.passed
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {studentQuizSub.passed ? "Passed ✓" : "Failed ✗"} (Score: {studentQuizSub.totalScore || studentQuizSub.score})
                              </span>
                            )}
                          </div>

                          <div className="flex justify-end pt-1">
                            <Button
                              variant={studentQuizSub ? "outline" : "primary"}
                              size="sm"
                              onClick={() => setActiveQuiz(quiz)}
                            >
                              {studentQuizSub ? "Retake Quiz" : "Take Quiz"}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Assignments Box */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Upload className="w-5 h-5" />
                    <h4 className="text-base font-bold text-white">Lesson Assignments</h4>
                  </div>

                  {assignments.length === 0 ? (
                    <p className="text-xs text-slate-400">No assignments attached to this lesson.</p>
                  ) : (
                    assignments.map((assign) => {
                      const studentSub = assignmentSubmissions[assign._id];

                      return (
                        <div
                          key={assign._id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-bold text-white">{assign.title}</h5>
                              <span className="text-[10px] text-slate-400">
                                Total Points: {assign.totalPoints}
                              </span>
                            </div>

                            {studentSub ? (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  studentSub.status === "graded"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {studentSub.status === "graded"
                                  ? `Graded: ${studentSub.grade}/${assign.totalPoints}`
                                  : "Submitted (Pending Review)"}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                                Not Submitted
                              </span>
                            )}
                          </div>

                          {/* Instructor Feedback Display */}
                          {studentSub?.feedback && (
                            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-1">
                              <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-[11px]">
                                <MessageSquare className="w-3.5 h-3.5" /> Instructor Feedback:
                              </span>
                              <p className="text-slate-300 leading-relaxed italic">
                                "{studentSub.feedback}"
                              </p>
                            </div>
                          )}

                          <div className="flex justify-end pt-1">
                            <Button
                              variant={studentSub ? "outline" : "primary"}
                              size="sm"
                              onClick={() => {
                                setActiveAssignment(assign);
                                setAssignmentModalOpen(true);
                              }}
                            >
                              {studentSub ? "View / Update Submission" : "Submit Work"}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeAssignment && (
        <AssignmentSubmissionModal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          assignment={activeAssignment}
          existingSubmission={assignmentSubmissions[activeAssignment._id] || null}
          onSuccess={loadLessonAssessments}
        />
      )}
    </div>
  );
}
