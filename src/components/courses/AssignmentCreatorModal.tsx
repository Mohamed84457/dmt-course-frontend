"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useUIStore } from "@/store/useUIStore";
import { api } from "@/lib/api";
import { Upload, Calendar, FileText, CheckSquare, Link2 } from "lucide-react";

interface AssignmentCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle?: string;
  onSuccess: () => void;
}

export const AssignmentCreatorModal: React.FC<AssignmentCreatorModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  onSuccess,
}) => {
  const { addToast } = useUIStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalPoints, setTotalPoints] = useState("100");
  const [dueDate, setDueDate] = useState(() => {
    // Default to 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({ type: "warning", message: "Please enter an assignment title." });
      return;
    }

    if (!dueDate) {
      addToast({ type: "warning", message: "Please specify a due date." });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        lessonId,
        title: title.trim(),
        description: description.trim() || undefined,
        totalPoints: totalPoints ? Number(totalPoints) : 100,
        dueDate: new Date(dueDate).toISOString(),
        attachmentUrl: attachmentUrl.trim() || undefined,
        status,
      };

      await api.post("/assignments", payload);

      addToast({
        type: "success",
        title: "Assignment Created!",
        message: `Assignment "${title}" attached to lesson successfully.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      let errorMsg = err.response?.data?.message || "Could not create assignment";
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
      title="Create Module Assignment"
      description={
        lessonTitle
          ? `Attaching assignment challenge to: "${lessonTitle}"`
          : "Define homework, coding exercises, or essay prompts for students."
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Assignment Title"
          placeholder="e.g. Practical Homework 1: Building a Next.js Server Component"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Assignment Prompt & Description
          </label>
          <textarea
            rows={4}
            placeholder="Detailed instructions, submission requirements, grading criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Points / Max Score"
            type="number"
            placeholder="100"
            value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Starter Project / Attachment URL (Optional)"
            placeholder="https://github.com/... or Google Drive link"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Publish Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="published">Published (Available immediately)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save & Publish Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
