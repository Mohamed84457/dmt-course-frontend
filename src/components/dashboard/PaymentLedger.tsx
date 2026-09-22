"use client";

import React, { useState } from "react";
import { Payment } from "@/types";
import { api } from "@/lib/api";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, PlusCircle, CheckCircle, Clock, XCircle, FileText } from "lucide-react";

interface PaymentLedgerProps {
  payments: Payment[];
  onRefresh: () => void;
}

export const PaymentLedger: React.FC<PaymentLedgerProps> = ({ payments, onRefresh }) => {
  const { addToast } = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().toLocaleString("en-US", { month: "long", year: "numeric" }));
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/payments", {
        studentId,
        courseId,
        amount: Number(amount),
        month,
        paymentMethod,
        paymentStatus: "completed",
        status: "completed",
      });

      addToast({
        type: "success",
        title: "Payment Recorded",
        message: `Successfully logged manual payment of ${formatCurrency(Number(amount))}`,
      });

      setModalOpen(false);
      setStudentId("");
      setCourseId("");
      setAmount("");
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Record Failed",
        message: err.response?.data?.message || "Could not log payment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Financial & Payment Ledger</h3>
          <p className="text-xs text-slate-400">Track course revenue, manual receipts, and transaction history.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
        >
          Record Manual Payment
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Student / Transaction</th>
              <th className="px-5 py-3.5">Course ID</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Method</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const studentName =
                  typeof p.studentId === "object" ? p.studentId?.name : p.studentId;

                return (
                  <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{studentName || "Student"}</div>
                      <div className="text-[10px] text-slate-500">ID: {p._id}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {typeof p.courseId === "object" ? p.courseId?.title : p.courseId || "Direct"}
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-5 py-4 uppercase text-[10px] font-semibold text-indigo-400">
                      {p.paymentMethod}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          p.status === "completed"
                            ? "text-emerald-400"
                            : p.status === "pending"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {p.status === "completed" ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{p.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(p.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Manual Payment"
        description="Log an offline cash or transfer receipt for student enrollment."
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Student Mongo ID"
            placeholder="64f9b..."
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
          <Input
            label="Course Mongo ID"
            placeholder="64f9c..."
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          />
          <Input
            label="Amount ($ USD)"
            type="number"
            placeholder="149.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Billing Period / Month"
            placeholder="e.g. September 2026"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="cash">Cash / In-Person</option>
              <option value="bank_transfer">Bank Wire Transfer</option>
              <option value="card">Credit Card / POS</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Log Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
