"use client";

import React, { useState, useEffect } from "react";
import { AssignmentSubmission, QuizSubmission, Quiz, QuizQuestion } from "@/types";
import { api } from "@/lib/api";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { useUIStore } from "@/store/useUIStore";
import { formatDate } from "@/lib/utils";
import {
  FileCheck,
  ExternalLink,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Clock,
  User,
  Check,
  X,
  Sparkles,
  Loader2,
  Save,
} from "lucide-react";

interface GradingPortalProps {
  submissions: AssignmentSubmission[];
  quizSubmissions?: QuizSubmission[];
  onRefresh: () => void;
}

export const GradingPortal: React.FC<GradingPortalProps> = ({
  submissions,
  quizSubmissions = [],
  onRefresh,
}) => {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<"assignments" | "quizzes">("assignments");

  // Assignment Modal
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz Modal (View & Grade student answers)
  const [selectedQuizSub, setSelectedQuizSub] = useState<QuizSubmission | null>(null);
  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);
  const [isLoadingQuizDetails, setIsLoadingQuizDetails] = useState(false);
  const [questionScores, setQuestionScores] = useState<Record<string, { pointsObtained: number; isCorrect: boolean }>>({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [isSavingOverall, setIsSavingOverall] = useState(false);

  // Fetch full quiz details when opening a quiz submission
  useEffect(() => {
    if (!selectedQuizSub) {
      setQuizDetails(null);
      setQuestionScores({});
      return;
    }

    const quizId =
      typeof selectedQuizSub.quizId === "object"
        ? (selectedQuizSub.quizId as Quiz)._id
        : selectedQuizSub.quizId;

    if (!quizId) return;

    setIsLoadingQuizDetails(true);
    api
      .get(`/quiz/${quizId}`)
      .then((res) => {
        if (res.data?.quiz) {
          setQuizDetails(res.data.quiz);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingQuizDetails(false));

    // Initialize question scores map
    const initialScores: Record<string, { pointsObtained: number; isCorrect: boolean }> = {};
    selectedQuizSub.answers?.forEach((ans) => {
      initialScores[ans.questionId] = {
        pointsObtained: ans.pointsObtained ?? ans.scoreAwarded ?? 0,
        isCorrect: Boolean(ans.isCorrect),
      };
    });
    setQuestionScores(initialScores);
    setBonusPoints(selectedQuizSub.bonusPoints ?? 0);
  }, [selectedQuizSub]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setIsSubmitting(true);

    try {
      await api.patch(`/submission-assignment/${selectedSub._id}`, {
        grade: Number(grade),
        feedback,
      });

      addToast({
        type: "success",
        title: "Submission Graded",
        message: `Grade of ${grade} saved successfully.`,
      });

      setSelectedSub(null);
      setGrade("");
      setFeedback("");
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Grading Error",
        message: err.response?.data?.message || "Could not save grade",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Grade a single question in a quiz submission
  const handleSaveQuestionGrade = async (questionId: string) => {
    if (!selectedQuizSub) return;
    const qState = questionScores[questionId];
    if (!qState) return;

    setSavingQuestionId(questionId);
    try {
      const res = await api.patch(`/quiz-submissions/answer/${selectedQuizSub._id}`, {
        questionId,
        pointsObtained: Number(qState.pointsObtained),
        isCorrect: Boolean(qState.isCorrect),
      });

      if (res.data?.submission) {
        setSelectedQuizSub(res.data.submission);
      }

      addToast({
        type: "success",
        title: "Answer Graded",
        message: "Question score and correction updated successfully.",
      });
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Grading Error",
        message: err.response?.data?.message || "Failed to update answer grade",
      });
    } finally {
      setSavingQuestionId(null);
    }
  };

  // Update overall quiz submission (bonus points, passed status)
  const handleSaveOverallQuiz = async () => {
    if (!selectedQuizSub) return;
    setIsSavingOverall(true);
    try {
      const currentScore = selectedQuizSub.score ?? selectedQuizSub.totalScore ?? 0;
      const totalScore = currentScore + Number(bonusPoints);
      const passingMarks = quizDetails?.passingMarks ?? 60;
      const isPassed = totalScore >= passingMarks;

      const res = await api.patch(`/quiz-submissions/${selectedQuizSub._id}`, {
        bonusPoints: Number(bonusPoints),
        totalScore,
        isPassed,
      });

      if (res.data?.submission) {
        setSelectedQuizSub(res.data.submission);
      }

      addToast({
        type: "success",
        title: "Quiz Submission Updated",
        message: `Total score updated to ${totalScore} points (${isPassed ? "Passed" : "Failed"}).`,
      });
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Update Error",
        message: err.response?.data?.message || "Failed to update quiz submission",
      });
    } finally {
      setIsSavingOverall(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "assignments"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Assignment Submissions ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab("quizzes")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "quizzes"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Quiz Submissions & Grading ({quizSubmissions.length})
        </button>
      </div>

      {/* Tab 1: Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Student Assignment Submissions</h3>
            <p className="text-xs text-slate-400">Review solutions, provide feedback, and record marks.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Assignment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Grade</th>
                  <th className="px-5 py-3.5">Submitted Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No assignment submissions awaiting review.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const studentName =
                      typeof sub.studentId === "object" ? sub.studentId?.name : "Student";
                    const assignmentTitle =
                      typeof sub.assignmentId === "object"
                        ? sub.assignmentId?.title
                        : "Assignment";

                    return (
                      <tr key={sub._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">{studentName}</td>
                        <td className="px-5 py-4 text-indigo-400 font-medium">{assignmentTitle}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] border ${
                              sub.status === "graded"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {sub.status || "Submitted"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-white">
                          {sub.grade !== undefined ? sub.grade : "Not Graded"}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {sub.createdAt ? formatDate(sub.createdAt) : "-"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<FileCheck className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setSelectedSub(sub);
                              setGrade(sub.grade?.toString() || "");
                              setFeedback(sub.feedback || "");
                            }}
                          >
                            Grade & Feedback
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Quizzes */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Student Quiz Attempts & Assessment Grading</h3>
            <p className="text-xs text-slate-400">
              Inspect student answers, grade short-answer questions, and adjust scores.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Quiz Title</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Result</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {quizSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No quiz submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  quizSubmissions.map((qSub) => {
                    const studentName =
                      typeof qSub.studentId === "object" ? qSub.studentId?.name : "Student";
                    const quizTitle =
                      typeof qSub.quizId === "object" ? qSub.quizId?.title : "Quiz";
                    const isPassed = Boolean(qSub.isPassed ?? qSub.passed);

                    return (
                      <tr key={qSub._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">{studentName}</td>
                        <td className="px-5 py-4 text-purple-400 font-medium">{quizTitle}</td>
                        <td className="px-5 py-4 font-bold text-white">
                          {qSub.totalScore !== undefined ? qSub.totalScore : qSub.score ?? "-"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${
                              isPassed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {isPassed ? "Passed" : "Failed / Review"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {qSub.submittedAt || qSub.createdAt ? formatDate(qSub.submittedAt || qSub.createdAt!) : "-"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Award className="w-3.5 h-3.5 text-indigo-400" />}
                            onClick={() => setSelectedQuizSub(qSub)}
                          >
                            Correct & Grade
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title="Grade Assignment Submission"
          description="Review student's answer & enter score."
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Student Solution Text:
              </span>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">
                {selectedSub.submissionText || "No text provided"}
              </p>

              {selectedSub.fileUrl && (
                <div className="pt-2">
                  <a
                    href={selectedSub.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Submitted File / Project
                  </a>
                </div>
              )}
            </div>

            <Input
              label="Numerical Score / Grade"
              type="number"
              placeholder="95"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Instructor Feedback
              </label>
              <textarea
                rows={3}
                placeholder="Great job on the design! Make sure to optimize query performance."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSub(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Save Grade
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quiz Submission Breakdown & Question Grading Modal */}
      {selectedQuizSub && (
        <Modal
          isOpen={!!selectedQuizSub}
          onClose={() => setSelectedQuizSub(null)}
          title="Quiz Grading & Answer Correction"
          description="Review student responses, correct short answers & assign marks."
        >
          <div className="space-y-5 max-h-[550px] overflow-y-auto pr-1">
            {/* Overview Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Auto/Base Score</span>
                <p className="font-bold text-white text-base mt-0.5">
                  {selectedQuizSub.score ?? 0} pts
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Final Score</span>
                <p className="font-bold text-indigo-400 text-base mt-0.5">
                  {selectedQuizSub.totalScore ?? selectedQuizSub.score ?? 0} pts
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
                <p
                  className={`font-bold text-base mt-0.5 ${
                    Boolean(selectedQuizSub.isPassed ?? selectedQuizSub.passed)
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {Boolean(selectedQuizSub.isPassed ?? selectedQuizSub.passed) ? "Passed" : "Needs Review / Failed"}
                </p>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-white block">
                Submitted Questions & Answers:
              </span>

              {isLoadingQuizDetails ? (
                <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Loading assessment questions...</span>
                </div>
              ) : selectedQuizSub.answers && selectedQuizSub.answers.length > 0 ? (
                selectedQuizSub.answers.map((ans, idx) => {
                  const qMeta = quizDetails?.questions?.find(
                    (q) => String(q._id) === String(ans.questionId)
                  );
                  const currentScoreState = questionScores[ans.questionId] || {
                    pointsObtained: ans.pointsObtained ?? ans.scoreAwarded ?? 0,
                    isCorrect: Boolean(ans.isCorrect),
                  };

                  const isSavingThis = savingQuestionId === ans.questionId;

                  return (
                    <div
                      key={ans.questionId || idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                    >
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white">
                            Question #{idx + 1}: {qMeta?.questionText || `Question ID: ${ans.questionId}`}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="capitalize">Type: {qMeta?.questionType || "Standard"}</span>
                            <span>•</span>
                            <span>Max Points: {qMeta?.points || 1}</span>
                          </div>
                        </div>

                        <span
                          className={`self-start sm:self-auto px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            currentScoreState.isCorrect
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {currentScoreState.isCorrect ? "✓ Marked Correct" : "✗ Marked Incorrect"}
                        </span>
                      </div>

                      {/* Student Response Display */}
                      <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Student Response:
                        </span>
                        {ans.answerText ? (
                          <p className="text-white text-xs leading-relaxed whitespace-pre-wrap">
                            "{ans.answerText}"
                          </p>
                        ) : ans.selectedOptionId || ans.selectedOptionIndex !== undefined ? (
                          <div className="space-y-1">
                            <p className="text-white text-xs">
                              Option Selected:{" "}
                              <span className="font-semibold text-indigo-400">
                                {qMeta?.options?.find((o) => String(o._id) === String(ans.selectedOptionId))?.optionText ||
                                  (ans.selectedOptionIndex !== undefined ? `Choice #${ans.selectedOptionIndex + 1}` : ans.selectedOptionId)}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic text-xs">No response provided</p>
                        )}
                      </div>

                      {/* Teacher Grading & Correction Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Points Awarded
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={qMeta?.points || 100}
                              value={currentScoreState.pointsObtained}
                              onChange={(e) =>
                                setQuestionScores((prev) => ({
                                  ...prev,
                                  [ans.questionId]: {
                                    ...prev[ans.questionId],
                                    pointsObtained: Number(e.target.value),
                                  },
                                }))
                              }
                              className="w-20 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Mark Outcome
                            </label>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuestionScores((prev) => ({
                                    ...prev,
                                    [ans.questionId]: {
                                      ...prev[ans.questionId],
                                      isCorrect: true,
                                      pointsObtained: prev[ans.questionId]?.pointsObtained || qMeta?.points || 1,
                                    },
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                  currentScoreState.isCorrect
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-slate-900 text-slate-400 hover:text-white"
                                }`}
                              >
                                <Check className="w-3 h-3" /> Correct
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setQuestionScores((prev) => ({
                                    ...prev,
                                    [ans.questionId]: {
                                      ...prev[ans.questionId],
                                      isCorrect: false,
                                      pointsObtained: 0,
                                    },
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                  !currentScoreState.isCorrect
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : "bg-slate-900 text-slate-400 hover:text-white"
                                }`}
                              >
                                <X className="w-3 h-3" /> Incorrect
                              </button>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={isSavingThis}
                          icon={<Save className="w-3.5 h-3.5" />}
                          onClick={() => handleSaveQuestionGrade(ans.questionId)}
                        >
                          Save Question Grade
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500">No individual questions logged.</p>
              )}
            </div>

            {/* Overall Adjustments & Bonus Points */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 space-y-3 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Overall Assessment Bonus & Finalization</span>
              </span>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-slate-300 font-medium">Bonus Points:</label>
                  <input
                    type="number"
                    min={0}
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(Number(e.target.value))}
                    className="w-20 rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSavingOverall}
                  onClick={handleSaveOverallQuiz}
                >
                  Recalculate & Finalize Submission
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedQuizSub(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

