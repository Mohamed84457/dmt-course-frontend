"use client";

import React, { useState, useEffect } from "react";
import { Quiz, QuizSubmission, QuizQuestion } from "@/types";
import { api } from "@/lib/api";
import { Button } from "../ui/Button";
import { useUIStore } from "@/store/useUIStore";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete?: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz: initialQuiz,
  onComplete,
}) => {
  const { addToast } = useUIStore();
  const { t } = useAppPreferences();
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmission | null>(null);

  // Fetch complete quiz questions if missing from summary
  useEffect(() => {
    let isMounted = true;
    const loadFullQuiz = async () => {
      if (!initialQuiz?._id) return;
      if (initialQuiz.questions && initialQuiz.questions.length > 0) {
        setQuiz(initialQuiz);
        return;
      }

      setIsLoadingQuiz(true);
      try {
        const res = await api.get(`/quiz/${initialQuiz._id}`);
        if (isMounted && res.data?.quiz) {
          setQuiz(res.data.quiz);
        }
      } catch (err: any) {
        console.error("Failed to fetch full quiz", err);
      } finally {
        if (isMounted) setIsLoadingQuiz(false);
      }
    };

    loadFullQuiz();
    return () => {
      isMounted = false;
    };
  }, [initialQuiz]);

  const questions: QuizQuestion[] = quiz.questions || [];
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (result) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const answersPayload = questions.map((q, idx) => {
        const selectedIdx = selectedAnswers[idx];
        const selectedOpt = q.options?.[selectedIdx ?? -1] ?? null;

        const payloadItem: {
          questionId: string;
          selectedOptionId?: string;
          answerText?: string;
        } = {
          questionId: String(q._id),
        };

        if (selectedOpt?._id) {
          payloadItem.selectedOptionId = String(selectedOpt._id);
        }
        if (essayAnswers[idx]) {
          payloadItem.answerText = String(essayAnswers[idx]);
        }

        return payloadItem;
      });

      const res = await api.post(`/quiz-submissions/${quiz._id}`, {
        answers: answersPayload,
      });

      const submission: QuizSubmission =
        res.data?.submission || res.data?.submit || res.data?.data || res.data;
      setResult(submission);

      const isPassed = Boolean(submission.isPassed ?? submission.passed);
      const finalScore = submission.totalScore ?? submission.score ?? 0;

      addToast({
        type: isPassed ? "success" : "info",
        title: isPassed ? t("assessmentPassed") : t("quizSubmitted"),
        message: `${t("yourScore")}: ${finalScore} ${t("points")}.`,
      });

      if (onComplete) onComplete();
    } catch (err: any) {
      addToast({
        type: "error",
        title: t("submissionError"),
        message: err.response?.data?.message || t("failedSubmitQuiz"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm font-medium">{t("loadingQuestions")}</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 space-y-3">
        <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
        <h4 className="text-base font-bold text-white">{t("noQuestions")}</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {t("noPublishedQuestions")}
        </p>
      </div>
    );
  }

  const isQuizPassed = result
    ? Boolean(result.isPassed ?? result.passed)
    : false;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {t("interactiveAssessment")}
          </span>
          <h3 className="text-xl font-bold text-white mt-1">{quiz.title}</h3>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
          {t("questionOf")
            .replace("{current}", String(currentQuestionIndex + 1))
            .replace("{total}", String(questions.length))}
        </div>
      </div>

      {/* Results View */}
      {result ? (
        <div className="space-y-6 text-center py-4">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Award className="w-12 h-12" />
          </div>

          <div>
            <h4 className="text-2xl font-bold text-white">
              {t("quizCompleted")}
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              {t("finalScore")}:{" "}
              <span className="font-bold text-indigo-400">
                {result.totalScore ?? result.score ?? 0}
              </span>{" "}
              {t("points")}
            </p>
          </div>

          <div className="inline-block rounded-xl px-4 py-2 border bg-slate-950/60 text-sm font-semibold">
            {isQuizPassed ? (
              <span className="text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> {t("passedAssessment")}
              </span>
            ) : (
              <span className="text-rose-400 flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> {t("needsReview")}
              </span>
            )}
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
                setEssayAnswers({});
                setCurrentQuestionIndex(0);
              }}
            >
              {t("tryAgain")}
            </Button>
          </div>
        </div>
      ) : (
        /* Active Question View */
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold text-white leading-snug">
              {currentQ.questionText}
            </h4>
            {currentQ.points ? (
              <span className="text-[11px] text-slate-400 mt-1 block">
                {t("worth")}: {currentQ.points} {t("points")}
              </span>
            ) : null}
          </div>

          {/* Options for MCQ / True False */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected =
                  selectedAnswers[currentQuestionIndex] === optIdx;

                return (
                  <button
                    key={opt._id || optIdx}
                    onClick={() =>
                      handleSelectOption(currentQuestionIndex, optIdx)
                    }
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                        : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    <span>{opt.optionText}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500 text-white"
                          : "border-slate-700"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Short answer text area */
            <div>
              <textarea
                value={essayAnswers[currentQuestionIndex] || ""}
                onChange={(e) =>
                  setEssayAnswers((prev) => ({
                    ...prev,
                    [currentQuestionIndex]: e.target.value,
                  }))
                }
                rows={4}
                placeholder={t("typeResponse")}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            >
              {t("previous")}
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                {t("nextQuestion")}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleSubmitQuiz}
              >
                {t("submitAssessment")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
