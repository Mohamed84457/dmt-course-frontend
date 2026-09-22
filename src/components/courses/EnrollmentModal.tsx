"use client";

import React, { useState } from "react";
import { Course } from "@/types";
import { api } from "@/lib/api";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  course,
}) => {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnroll = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post("/enrollments", { courseId: course._id });
      addToast({
        type: "success",
        title: "Enrollment Successful!",
        message: `You are now enrolled in ${course.title}`,
      });
      onClose();
      router.push(`/dashboard/student`);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Enrollment Failed",
        message: err.response?.data?.message || "Could not complete enrollment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Course Enrollment"
      description="Instant access to all modules, quizzes, and certificate of completion."
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">{course.title}</h4>
            <span className="text-xs text-slate-400">Full Access Lifetime Pass</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total</span>
            <span className="text-lg font-bold text-indigo-400">
              {course.price === 0 ? "Free" : formatCurrency(course.price)}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Full video & text lesson access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Interactive quizzes & practical assignments</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Verified digital credential upon completion</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleEnroll}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Confirm & Enroll Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};
