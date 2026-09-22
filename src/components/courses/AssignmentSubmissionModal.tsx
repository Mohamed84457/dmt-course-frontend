"use client";

import React, { useState } from "react";
import { Assignment, AssignmentSubmission } from "@/types";
import { api } from "@/lib/api";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useUIStore } from "@/store/useUIStore";
import { Upload, FileText, CheckCircle2, Clock } from "lucide-react";

interface AssignmentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  existingSubmission?: AssignmentSubmission | null;
  onSuccess?: () => void;
}

export const AssignmentSubmissionModal: React.FC<AssignmentSubmissionModalProps> = ({
  isOpen,
  onClose,
  assignment,
  existingSubmission,
  onSuccess,
}) => {
  const { addToast } = useUIStore();
  const [submissionText, setSubmissionText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText && !fileUrl) {
      addToast({
        type: "warning",
        title: "Missing Content",
        message: "Please provide submission text or a file link.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/submission-assignment/${assignment._id}`, {
        submissionText,
        fileUrl,
      });

      addToast({
        type: "success",
        title: "Assignment Submitted",
        message: "Your submission has been received by your instructor.",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Submission Error",
        message: err.response?.data?.message || "Failed to submit assignment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assignment.title}
      description={`Total Points: ${assignment.totalPoints}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Assignment Prompt */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            Assignment Instructions
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {assignment.description}
          </p>
        </div>

        {/* Existing Submission Status if graded/submitted */}
        {existingSubmission ? (
          <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-indigo-400">
                Current Submission Status
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {existingSubmission.status}
              </span>
            </div>

            {existingSubmission.grade !== undefined && (
              <div className="text-sm">
                <span className="text-slate-400">Grade: </span>
                <span className="font-bold text-white text-base">
                  {existingSubmission.grade} / {assignment.totalPoints}
                </span>
              </div>
            )}

            {existingSubmission.feedback && (
              <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-white block mb-1">Instructor Feedback:</span>
                {existingSubmission.feedback}
              </div>
            )}
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Your Answer / Notes
              </label>
              <textarea
                rows={4}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Write your assignment solution, summary, or response here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Input
              label="Document / Project Link (Optional)"
              placeholder="https://github.com/username/project or Google Drive link"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Submit Assignment
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
