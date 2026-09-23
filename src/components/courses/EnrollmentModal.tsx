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
import { useAppPreferences } from "@/components/providers/AppPreferences";

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
  const { t } = useAppPreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnroll = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/enrollments", { courseId: course._id });
      addToast({
        type: "success",
        title: t("enrollmentSuccessful"),
        message: t("enrollmentSuccessMessage").replace(
          "{course}",
          course.title,
        ),
      });
      onClose();
      router.push(`/dashboard/student`);
    } catch (err: any) {
      addToast({
        type: "error",
        title: t("enrollmentFailed"),
        message: err.response?.data?.message || t("enrollmentError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("confirmEnrollment")}
      description={t("enrollmentDescription")}
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">{course.title}</h4>
            <span className="text-xs text-slate-400">{t("lifetimePass")}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">{t("total")}</span>
            <span className="text-lg font-bold text-indigo-400">
              {course.price === 0 ? t("free") : formatCurrency(course.price)}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t("fullLessonAccess")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t("practicalReview")}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>{t("verifiedCredential")}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-800">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            isLoading={isSubmitting}
            onClick={handleEnroll}
            icon={<CreditCard className="w-4 h-4" />}
          >
            {t("confirmEnrollNow")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
