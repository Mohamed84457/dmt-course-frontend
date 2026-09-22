"use client";

import React, { useState } from "react";
import { Organization } from "@/types";
import { api } from "@/lib/api";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { useUIStore } from "@/store/useUIStore";
import { getImageUrl, formatDate } from "@/lib/utils";
import { Building2, Plus, Users, Trash2, Upload } from "lucide-react";

interface OrganizationManagerProps {
  organizations: Organization[];
  onRefresh: () => void;
}

export const OrganizationManager: React.FC<OrganizationManagerProps> = ({
  organizations,
  onRefresh,
}) => {
  const { addToast } = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/organization", { name, description });
      addToast({
        type: "success",
        title: "Organization Registered",
        message: `Created ${name} organization profile.`,
      });
      setModalOpen(false);
      setName("");
      setDescription("");
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Registration Failed",
        message: err.response?.data?.message || "Could not create organization",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;
    try {
      await api.delete(`/organization/${id}`);
      addToast({
        type: "success",
        title: "Organization Deleted",
        message: "Organization removed successfully.",
      });
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Delete Error",
        message: err.response?.data?.message || "Failed to delete organization",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Partner Institutions & Organizations</h3>
          <p className="text-xs text-slate-400">Manage educational hubs, university portals, and corporate groups.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
        >
          Add Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <div
            key={org._id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                  {org.logo ? (
                    <img
                      src={getImageUrl(org.logo)}
                      alt={org.name}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{org.name}</h4>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Active Partner
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteOrg(org._id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400 line-clamp-2">
              {org.description || "No description provided."}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Created {formatDate(org.createdAt)}</span>
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Enrolled Students
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Organization"
        description="Establish an organizational portal for bulk course assignments."
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <Input
            label="Organization Name"
            placeholder="Stanford Tech Institute"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief background about this institution..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Register Organization
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
