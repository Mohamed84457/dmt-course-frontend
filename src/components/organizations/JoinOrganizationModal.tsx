"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Building2, KeyRound, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

interface JoinOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined?: (org: any) => void;
}

export const JoinOrganizationModal: React.FC<JoinOrganizationModalProps> = ({
  isOpen,
  onClose,
  onJoined,
}) => {
  const { fetchMe } = useAuthStore();
  const { addToast } = useUIStore();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter a valid organization code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/organization/join", { joinCode: cleanCode });
      const orgInfo = res.data?.organization || res.data?.data || res.data;
      setSuccessData(orgInfo);
      
      addToast({
        type: "success",
        title: "Organization Joined!",
        message: res.data?.message || "You have successfully joined the organization.",
      });

      // Refresh current user data in store so organizationId is updated
      await fetchMe();

      if (onJoined) {
        onJoined(orgInfo);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to join organization. Please check the code.";
      setError(msg);
      addToast({
        type: "error",
        title: "Joining Failed",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJoinCode("");
    setError(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successData ? "Joined Successfully" : "Join Organization"}
      description={
        successData
          ? "You are now a registered member of this institution."
          : "Enter the unique code provided by your academy, school, or center."
      }
      maxWidth="md"
    >
      {successData ? (
        <div className="space-y-6 text-center py-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Affiliation Confirmed
            </div>
            <h3 className="text-xl font-bold text-white">
              {successData?.name || "Partner Organization"}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You now have access to exclusive courses, study groups, and institutional modules.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleClose}
          >
            Done & Return to Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Organization Join Code</h4>
                <p className="text-[11px] text-slate-400">
                  Ask your instructor or administrator for the join code.
                </p>
              </div>
            </div>

            <Input
              placeholder="e.g. ORG-78A9B or EDU-2026"
              icon={<KeyRound className="w-4 h-4 text-slate-400" />}
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setError(null);
              }}
              required
              className="font-mono uppercase tracking-wider text-center"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-1/2"
              onClick={handleClose}
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
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Join Now
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
