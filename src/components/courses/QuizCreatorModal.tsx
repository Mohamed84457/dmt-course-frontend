"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useUIStore } from "@/store/useUIStore";
import { api } from "@/lib/api";
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  Layers,
} from "lucide-react";

interface OptionItem {
  optionText: string;
  isCorrect: boolean;
}

interface QuestionDraft {
  questionText: string;
  questionType: "mcq" | "true_false" | "short_answer";
  points: number;
  explanation: string;
  options: OptionItem[];
}

interface QuizCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle?: string;
  onSuccess: () => void;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  onSuccess,
}) => {
  const { addToast } = useUIStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("15");
  const [passingMarks, setPassingMarks] = useState("60");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      questionText: "",
      questionType: "mcq",
      points: 1,
      explanation: "",
      options: [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
      ],
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        questionType: "mcq",
        points: 1,
        explanation: "",
        options: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length === 1) {
      addToast({
        type: "warning",
        message: "Quiz must have at least one question.",
      });
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (
    idx: number,
    field: keyof QuestionDraft,
    value: any
  ) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };

    // If type changed to true_false, configure standard options
    if (field === "questionType" && value === "true_false") {
      updated[idx].options = [
        { optionText: "True", isCorrect: true },
        { optionText: "False", isCorrect: false },
      ];
    } else if (field === "questionType" && value === "short_answer") {
      updated[idx].options = [];
    } else if (field === "questionType" && value === "mcq" && updated[idx].options.length === 0) {
      updated[idx].options = [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
      ];
    }

    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push({ optionText: "", isCorrect: false });
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].options.length <= 2) {
      addToast({
        type: "warning",
        message: "Multiple choice questions require at least 2 options.",
      });
      return;
    }
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== optIdx);
    setQuestions(updated);
  };

  const handleOptionTextChange = (
    qIdx: number,
    optIdx: number,
    text: string
  ) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].optionText = text;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIdx,
    }));
    setQuestions(updated);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((acc, q) => acc + (Number(q.points) || 1), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({ type: "warning", message: "Please enter a quiz title." });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        addToast({
          type: "warning",
          message: `Question #${i + 1} text cannot be empty.`,
        });
        return;
      }

      if (q.questionType === "mcq" || q.questionType === "true_false") {
        const emptyOption = q.options.some((o) => !o.optionText.trim());
        if (emptyOption) {
          addToast({
            type: "warning",
            message: `Please fill in all options for Question #${i + 1}.`,
          });
          return;
        }

        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          addToast({
            type: "warning",
            message: `Please mark at least one correct answer for Question #${i + 1}.`,
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const totalMarks = calculateTotalMarks();

      const payload = {
        lessonId,
        title,
        description: description || undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 15,
        totalMarks,
        passingMarks: passingMarks ? Number(passingMarks) : Math.round(totalMarks * 0.6),
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: Number(q.points) || 1,
          explanation: q.explanation || undefined,
          options:
            q.questionType !== "short_answer"
              ? q.options.map((o) => ({
                  optionText: o.optionText,
                  isCorrect: o.isCorrect,
                }))
              : undefined,
        })),
      };

      await api.post("/quiz", payload);

      addToast({
        type: "success",
        title: "Quiz Created!",
        message: `Quiz "${title}" attached to lesson successfully.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      let errorMsg = err.response?.data?.message || "Could not create quiz";
      if (serverErrors && typeof serverErrors === "object") {
        errorMsg = Object.entries(serverErrors)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join(" | ");
      }

      addToast({
        type: "error",
        title: "Creation Error",
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Interactive Lesson Quiz"
      description={
        lessonTitle
          ? `Attaching new quiz module to: "${lessonTitle}"`
          : "Design quiz questions, answers, and time parameters."
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz General Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Quiz Title"
              placeholder="e.g. Module 1 Knowledge Check & Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Instructions / Description
            </label>
            <textarea
              rows={2}
              placeholder="Instructions for students (e.g. You have 15 minutes to complete this quiz)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Input
            label="Duration (Minutes)"
            type="number"
            placeholder="15"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />

          <Input
            label="Passing Marks / Score"
            type="number"
            placeholder="60"
            value={passingMarks}
            onChange={(e) => setPassingMarks(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Publish Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="published">Published (Visible to Enrolled Students)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Questions Header */}
        <div className="border-t border-slate-800 pt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Questions ({questions.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Total Score Calculated: {calculateTotalMarks()} Points
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddQuestion}
            >
              Add Question
            </Button>
          </div>

          {/* Question Cards */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="h-6 w-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {qIdx + 1}
                  </span>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder={`Question #${qIdx + 1} Prompt...`}
                        value={q.questionText}
                        onChange={(e) =>
                          handleQuestionChange(qIdx, "questionText", e.target.value)
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={q.questionType}
                        onChange={(e) =>
                          handleQuestionChange(qIdx, "questionType", e.target.value)
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>

                      <input
                        type="number"
                        placeholder="Pts"
                        value={q.points}
                        onChange={(e) =>
                          handleQuestionChange(qIdx, "points", Number(e.target.value))
                        }
                        className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-100 text-center"
                        min="1"
                        title="Points awarded"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Options section for MCQ or True/False */}
                {q.questionType !== "short_answer" && (
                  <div className="pl-9 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Options & Correct Answer:
                    </span>

                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetCorrectOption(qIdx, optIdx)}
                          className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                            opt.isCorrect
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : "border-slate-700 bg-slate-900 text-transparent hover:border-slate-500"
                          }`}
                          title="Mark as correct answer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="text"
                          placeholder={`Option ${optIdx + 1}...`}
                          value={opt.optionText}
                          onChange={(e) =>
                            handleOptionTextChange(qIdx, optIdx, e.target.value)
                          }
                          className={`flex-1 bg-slate-900 border rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none ${
                            opt.isCorrect
                              ? "border-emerald-500/40 bg-emerald-950/10"
                              : "border-slate-800"
                          }`}
                          required
                        />

                        {q.questionType === "mcq" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, optIdx)}
                            className="text-slate-600 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}

                    {q.questionType === "mcq" && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3 h-3" /> Add Choice
                      </button>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <div className="pl-9">
                  <input
                    type="text"
                    placeholder="Optional explanation shown after quiz grading..."
                    value={q.explanation}
                    onChange={(e) =>
                      handleQuestionChange(qIdx, "explanation", e.target.value)
                    }
                    className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-400 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save & Attach Quiz
          </Button>
        </div>
      </form>
    </Modal>
  );
};
