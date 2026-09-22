"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Enrollment, Payment, Organization, AssignmentSubmission, QuizSubmission } from "@/types";
import { api } from "@/lib/api";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { JoinOrganizationModal } from "@/components/organizations/JoinOrganizationModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BookOpen,
  Award,
  CreditCard,
  Building2,
  KeyRound,
  PlayCircle,
  ShieldCheck,
  Plus,
  FileCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  Upload,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user, fetchMe } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<"courses" | "grades">("courses");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [myAssignmentSubs, setMyAssignmentSubs] = useState<AssignmentSubmission[]>([]);
  const [myQuizSubs, setMyQuizSubs] = useState<QuizSubmission[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    setLoading(true);

    Promise.all([
      api.get("/enrollments/my-enrollments").catch(() => ({ data: [] })),
      user?._id
        ? api.get(`/payments/student/${user._id}`).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
      api.get("/submission-assignment/student/my-submissions").catch(() => ({ data: [] })),
      api.get("/quiz-submissions/student/my-submissions").catch(() => ({ data: [] })),
    ]).then(async ([enrollRes, payRes, subRes, qSubRes]) => {
      const rawEnrollList =
        enrollRes.data?.enrollments ||
        enrollRes.data?.data ||
        (Array.isArray(enrollRes.data) ? enrollRes.data : []);
      const payList =
        payRes.data?.payments ||
        payRes.data?.data ||
        (Array.isArray(payRes.data) ? payRes.data : []);
      const assignSubs =
        subRes.data?.submissions ||
        subRes.data?.data ||
        (Array.isArray(subRes.data) ? subRes.data : []);
      const quizSubs =
        qSubRes.data?.submissions ||
        qSubRes.data?.data ||
        (Array.isArray(qSubRes.data) ? qSubRes.data : []);

      // Populate course object if courseId is string ID
      const populatedEnrollments = await Promise.all(
        rawEnrollList.map(async (enr: Enrollment) => {
          if (typeof enr.courseId === "string") {
            try {
              const cRes = await api.get(`/courses/${enr.courseId}`);
              const courseObj = cRes.data?.course || cRes.data?.data || cRes.data;
              return { ...enr, courseId: courseObj };
            } catch (e) {
              return enr;
            }
          }
          return enr;
        })
      );

      setEnrollments(populatedEnrollments);
      setPayments(payList);
      setMyAssignmentSubs(assignSubs);
      setMyQuizSubs(quizSubs);
      setLoading(false);
    });

    // Fetch organization info if user belongs to one
    if (user?.organizationId) {
      if (typeof user.organizationId === "object") {
        setOrganization(user.organizationId as Organization);
      } else {
        api
          .get(`/organization/${user.organizationId}`)
          .then((res) => {
            const orgData = res.data?.organization || res.data?.data || res.data;
            setOrganization(orgData);
          })
          .catch(() => {});
      }
    } else {
      setOrganization(null);
    }
  }, [user, fetchNotifications]);

  const activeEnrollments = enrollments.filter((e) => e.status !== "cancelled");
  const completedCount = enrollments.filter(
    (e) => e.status === "completed" || (e.progressPercentage ?? e.progress ?? 0) >= 100
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        {/* Welcome Header & Organization Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track course progress, study materials, grades, and academy certifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {organization ? (
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>
                  Affiliation: <strong className="text-white">{organization.name}</strong>
                </span>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="text-[11px] underline text-indigo-400 hover:text-indigo-300 ml-1"
                  title="Switch or enter a new organization code"
                >
                  Change
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsJoinModalOpen(true)}
                icon={<KeyRound className="w-4 h-4" />}
              >
                Join Organization with Code
              </Button>
            )}
          </div>
        </div>

        {/* Organization Banner if Not Joined */}
        {!organization && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Have an Academy or School Join Code?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect your student account with your educational center to unlock private curriculum and group schedules.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsJoinModalOpen(true)}
              icon={<KeyRound className="w-4 h-4" />}
            >
              Enter Code
            </Button>
          </div>
        )}

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Enrolled Courses"
            value={activeEnrollments.length}
            icon={<BookOpen className="w-5 h-5 text-indigo-400" />}
          />
          <StatCard
            title="Submitted Solutions"
            value={myAssignmentSubs.length + myQuizSubs.length}
            icon={<Award className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/10 text-purple-400"
          />
          <StatCard
            title="Total Spend"
            value={formatCurrency(payments.reduce((acc, p) => acc + (p.amount || 0), 0))}
            icon={<CreditCard className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10 text-emerald-400"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "courses"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            My Courses ({activeEnrollments.length})
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "grades"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            My Submissions & Grades ({myAssignmentSubs.length + myQuizSubs.length})
          </button>
        </div>

        {/* Tab 1: Enrolled Courses */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">In-Progress Courses</h2>
              <Link href="/courses" className="text-xs text-indigo-400 hover:underline">
                Browse More Courses
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
                ))}
              </div>
            ) : activeEnrollments.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-200">No active enrollments yet</p>
                <p className="text-xs text-slate-500 mt-1">Explore our course catalog and enroll in your first course.</p>
                <Link href="/courses" className="mt-4 inline-block">
                  <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 text-white">
                    Explore Courses
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEnrollments.map((enr) => {
                  const courseObj = typeof enr.courseId === "object" ? enr.courseId : null;
                  if (!courseObj) return null;

                  return (
                    <div key={enr._id} className="relative group flex flex-col justify-between">
                      <CourseCard course={courseObj} progressPercentage={enr.progressPercentage} />
                      <div className="mt-3">
                        <Link
                          href={`/learn/${courseObj._id}/default`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                        >
                          <PlayCircle className="w-4 h-4" /> Continue Classroom
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Submissions & Grades */}
        {activeTab === "grades" && (
          <div className="space-y-6">
            {/* Assignment Submissions List */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Assignment Submissions & Feedback</span>
                </h3>
                <p className="text-xs text-slate-400">View graded homework, scores, and teacher comments.</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Assignment</th>
                      <th className="px-5 py-3.5">Course</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Grade</th>
                      <th className="px-5 py-3.5">Instructor Feedback</th>
                      <th className="px-5 py-3.5">Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myAssignmentSubs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                          No assignment solutions submitted yet.
                        </td>
                      </tr>
                    ) : (
                      myAssignmentSubs.map((sub) => {
                        const aTitle =
                          typeof sub.assignmentId === "object" ? sub.assignmentId?.title : "Assignment";
                        const cTitle =
                          typeof (sub as any).courseId === "object"
                            ? (sub as any).courseId?.title
                            : "Course";

                        return (
                          <tr key={sub._id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-4 font-semibold text-white">{aTitle}</td>
                            <td className="px-5 py-4 text-indigo-400">{cTitle}</td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                  sub.status === "graded"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {sub.status === "graded" ? "Graded" : "Under Review"}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-bold text-white">
                              {sub.grade !== undefined ? (
                                <span className="text-emerald-400 text-sm font-extrabold">{sub.grade} Pts</span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-slate-300 max-w-xs">
                              {sub.feedback ? (
                                <div className="p-2 rounded-lg bg-indigo-950/20 border border-indigo-500/30 italic text-[11px]">
                                  "{sub.feedback}"
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">No comments yet</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-slate-400">
                              {sub.createdAt ? formatDate(sub.createdAt) : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quiz Submissions List */}
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Quiz Attempts & Test Scores</span>
                </h3>
                <p className="text-xs text-slate-400">Summary of multiple choice and module quizzes completed.</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Quiz Title</th>
                      <th className="px-5 py-3.5">Score</th>
                      <th className="px-5 py-3.5">Result</th>
                      <th className="px-5 py-3.5">Completed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myQuizSubs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                          No quiz attempts recorded yet.
                        </td>
                      </tr>
                    ) : (
                      myQuizSubs.map((qSub) => {
                        const qTitle =
                          typeof qSub.quizId === "object" ? qSub.quizId?.title : "Quiz";

                        return (
                          <tr key={qSub._id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-4 font-semibold text-white">{qTitle}</td>
                            <td className="px-5 py-4 font-extrabold text-white text-sm">
                              {qSub.totalScore !== undefined ? qSub.totalScore : qSub.score} Pts
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                  qSub.passed
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {qSub.passed ? "Passed ✓" : "Needs Review ✗"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-400">
                              {qSub.submittedAt || qSub.createdAt ? formatDate(qSub.submittedAt || qSub.createdAt!) : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Join Organization Modal */}
      <JoinOrganizationModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoined={(org) => setOrganization(org)}
      />
    </div>
  );
}
