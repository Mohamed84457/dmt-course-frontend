"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useUIStore } from "@/store/useUIStore";
import { Course } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Banknote,
  Building,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourse?: Course | null;
  defaultStudent?: any | null;
  courses?: Course[];
  students?: any[];
  onPaymentSuccess?: (payment: any) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultCourse,
  defaultStudent,
  courses = [],
  students = [],
  onPaymentSuccess,
}) => {
  const { addToast } = useUIStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer">("cash");
  const [month, setMonth] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync defaults on open or prop change
  useEffect(() => {
    if (isOpen) {
      const initialCourse = defaultCourse || (courses.length > 0 ? courses[0] : null);
      const initialStudent = defaultStudent || (students.length > 0 ? students[0] : null);

      const courseId = initialCourse?._id || "";
      const studentId = initialStudent?._id || initialStudent?.studentId?._id || initialStudent?.studentId || "";

      setSelectedCourseId(courseId);
      setSelectedStudentId(studentId);
      setAmount(initialCourse?.price || 0);

      // Default month to current month & year
      const now = new Date();
      const currentMonth = now.toLocaleString("default", { month: "long", year: "numeric" });
      setMonth(currentMonth);
      setPaymentMethod("cash");
      setNotes("");
      setError(null);
    }
  }, [isOpen, defaultCourse, defaultStudent, courses, students]);

  // When selected course changes, update amount default
  const handleCourseChange = (cId: string) => {
    setSelectedCourseId(cId);
    const found = courses.find((c) => c._id === cId);
    if (found && typeof found.price === "number") {
      setAmount(found.price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedStudentId) {
      setError("Please select both a student and a course.");
      return;
    }

    if (amount < 0) {
      setError("Payment amount must be 0 or greater.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        studentId: selectedStudentId,
        courseId: selectedCourseId,
        amount: Number(amount),
        paymentMethod,
        paymentStatus: "completed",
        month: month || undefined,
        notes: notes || undefined,
      };

      const res = await api.post("/payments", payload);
      const paymentData = res.data?.payment || res.data?.data || res.data;

      addToast({
        type: "success",
        title: "Payment Recorded!",
        message: `Successfully recorded ${formatCurrency(amount)} payment. Student enrollment activated.`,
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(paymentData);
      }

      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to record payment.";
      setError(msg);
      addToast({
        type: "error",
        title: "Payment Error",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Student Enrollment Payment"
      description="Manually confirm and mark a student's course fee as paid."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student selection or info */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Student
          </label>
          {defaultStudent ? (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {defaultStudent?.userId?.name || defaultStudent?.name || "Student"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {defaultStudent?.userId?.email || defaultStudent?.email || defaultStudent?.studentCode || ""}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                {defaultStudent?.studentCode || "Enrolled Student"}
              </span>
            </div>
          ) : (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Student...</option>
              {students.map((st: any) => {
                const sId = st._id || st.studentId?._id || st.studentId;
                const sName = st.userId?.name || st.name || st.studentCode || `Student (${sId})`;
                const sEmail = st.userId?.email || st.email ? ` - ${st.userId?.email || st.email}` : "";
                return (
                  <option key={sId} value={sId}>
                    {sName} {sEmail}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {/* Course selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Target Course
          </label>
          {defaultCourse ? (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{defaultCourse.title}</div>
                  <div className="text-xs text-slate-400">Course Fee: {formatCurrency(defaultCourse.price)}</div>
                </div>
              </div>
            </div>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Course...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({formatCurrency(c.price)})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount & Month */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Paid Amount (EGP / $)"
            type="number"
            min={0}
            step="any"
            placeholder="0"
            icon={<DollarSign className="w-4 h-4" />}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />

          <Input
            label="Billing Period / Month"
            placeholder="e.g. October 2026"
            icon={<Calendar className="w-4 h-4" />}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cash", label: "Cash In-Person", icon: Banknote },
              { id: "card", label: "Credit / Debit Card", icon: CreditCard },
              { id: "bank_transfer", label: "Bank Transfer / Vodafone Cash", icon: Building },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all text-xs ${
                    isSelected
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 font-semibold shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                  <span className="text-[11px]">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Receipt Notes / Transaction Ref (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Paid in cash at reception. Receipt #10492"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-1/2"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-1/2"
            isLoading={loading}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Activate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
