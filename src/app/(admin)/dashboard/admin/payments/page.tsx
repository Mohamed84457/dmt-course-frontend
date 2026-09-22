"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PaymentLedger } from "@/components/dashboard/PaymentLedger";
import { Payment } from "@/types";
import { api } from "@/lib/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = () => {
    setLoading(true);
    api.get("/payments")
      .then((res) => {
        const list = res.data?.payments || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setPayments(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Financial Ledger & Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit manual receipts, record offline tuition payments, and track transactions.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : (
          <PaymentLedger payments={payments} onRefresh={loadPayments} />
        )}
      </main>
    </div>
  );
}
