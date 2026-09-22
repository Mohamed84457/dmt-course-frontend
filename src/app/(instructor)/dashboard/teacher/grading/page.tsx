"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AssignmentSubmission, QuizSubmission } from "@/types";
import { api } from "@/lib/api";
import { GradingPortal } from "@/components/dashboard/GradingPortal";

export default function TeacherGradingPage() {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const cRes = await api.get("/courses").catch(() => ({ data: [] }));
      const courses =
        cRes.data?.courses ||
        cRes.data?.data ||
        (Array.isArray(cRes.data) ? cRes.data : []);

      let allSubmissions: AssignmentSubmission[] = [];
      let allQuizSubs: QuizSubmission[] = [];

      for (const course of courses) {
        try {
          const lRes = await api
            .get(`/lessons/course/${course._id}`)
            .catch(() => ({ data: [] }));
          const lessons =
            lRes.data?.lessons ||
            lRes.data?.data ||
            (Array.isArray(lRes.data) ? lRes.data : []);

          for (const lesson of lessons) {
            try {
              // Fetch assignments & quizzes for this lesson
              const [aRes, qRes] = await Promise.all([
                api
                  .get(`/assignments/lesson/${lesson._id}`)
                  .catch(() => ({ data: [] })),
                api.get(`/quiz/lesson/${lesson._id}`).catch(() => ({ data: [] })),
              ]);

              const assignments =
                aRes.data?.assignments ||
                aRes.data?.data ||
                (Array.isArray(aRes.data) ? aRes.data : []);
              const quizzes =
                qRes.data?.quizzes ||
                qRes.data?.data ||
                (Array.isArray(qRes.data) ? qRes.data : []);

              // Fetch assignment submissions
              for (const assign of assignments) {
                try {
                  const sRes = await api.get(
                    `/submission-assignment/assignment/${assign._id}`
                  );
                  const subs =
                    sRes.data?.submissions ||
                    sRes.data?.data ||
                    (Array.isArray(sRes.data) ? sRes.data : []);
                  allSubmissions = [...allSubmissions, ...subs];
                } catch (e) {}
              }

              // Fetch quiz submissions
              for (const quiz of quizzes) {
                try {
                  const qsRes = await api.get(
                    `/quiz-submissions/quiz/${quiz._id}`
                  );
                  const qSubs =
                    qsRes.data?.submissions ||
                    qsRes.data?.data ||
                    (Array.isArray(qsRes.data) ? qsRes.data : []);
                  allQuizSubs = [...allQuizSubs, ...qSubs];
                } catch (e) {}
              }
            } catch (e) {}
          }
        } catch (e) {}
      }

      setSubmissions(allSubmissions);
      setQuizSubmissions(allQuizSubs);
    } catch (err) {
      setSubmissions([]);
      setQuizSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Submissions & Grading Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review assignment solutions and quiz results submitted by enrolled students.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : (
          <GradingPortal
            submissions={submissions}
            quizSubmissions={quizSubmissions}
            onRefresh={loadSubmissions}
          />
        )}
      </main>
    </div>
  );
}
