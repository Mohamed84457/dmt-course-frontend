"use client";

import React, { useEffect, useState } from "react";
import { Organization } from "@/types";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { JoinOrganizationModal } from "@/components/organizations/JoinOrganizationModal";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import { Building2, Users, KeyRound, Sparkles } from "lucide-react";

export default function OrganizationsPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useAppPreferences();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    api
      .get("/organization")
      .then((res) => {
        const list =
          res.data?.organizations ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        setOrgs(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-slate-100 space-y-10">
      {/* Header and Join CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {t("institutionalDirectory")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            {t("partnerOrganizations")}
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            {t("exploreOrganizations")}
          </p>
        </div>

        {isAuthenticated && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsJoinModalOpen(true)}
            icon={<KeyRound className="w-4 h-4" />}
          >
            {t("joinWithCode")}
          </Button>
        )}
      </div>

      {/* Join Invitation Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {t("organizationJoinCode")}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              {t("joinCodeHint")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsJoinModalOpen(true)}
          icon={<KeyRound className="w-4 h-4" />}
        >
          {t("enterJoinCode")}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
          {t("noOrganizationsListed")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((org) => (
            <div
              key={org._id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  {org.logo ? (
                    <img
                      src={getImageUrl(org.logo)}
                      alt={org.name}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{org.name}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {org.description ||
                    "Partner institution delivering certified training."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />{" "}
                  {t("activeHub")}
                </span>
                <span className="text-indigo-400 font-semibold">
                  {t("verifiedPartner")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <JoinOrganizationModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
