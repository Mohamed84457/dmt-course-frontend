"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { useUIStore } from "@/store/useUIStore";
import { getImageUrl, formatDate } from "@/lib/utils";
import { GraduationCap, UserPlus, Mail, Phone, Trash2 } from "lucide-react";

interface TeacherRosterProps {
  teachers: User[];
  onRefresh: () => void;
}

export const TeacherRoster: React.FC<TeacherRosterProps> = ({ teachers, onRefresh }) => {
  const { addToast } = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHireTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/teacher", { name, email, password, phone });
      addToast({
        type: "success",
        title: "Teacher Added",
        message: `Hired ${name} as a new instructor`,
      });
      setModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Hiring Failed",
        message: err.response?.data?.message || "Failed to add teacher",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to remove this teacher?")) return;
    try {
      await api.delete(`/teacher/${teacherId}`);
      addToast({
        type: "success",
        title: "Teacher Removed",
        message: "Teacher account deleted from roster",
      });
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Delete Error",
        message: err.response?.data?.message || "Could not delete teacher",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Faculty & Instructor Roster</h3>
          <p className="text-xs text-slate-400">Manage all registered course teachers and instructors.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
        >
          Hire New Teacher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((item: any) => {
          const userObj = typeof item.userId === "object" ? item.userId : item;
          const name = userObj?.name || "Teacher";
          const email = userObj?.email || "";
          const phone = userObj?.phone || "";
          const isactive = userObj?.isactive ?? true;
          const createdAt = userObj?.createdAt || item.createdAt;
          const targetUserId = userObj?._id || item.userId || item._id;

          return (
            <div
              key={item._id || targetUserId}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{name}</h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Instructor
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTeacher(targetUserId)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Joined {formatDate(createdAt)}</span>
                <span className={isactive ? "text-emerald-400 font-semibold" : "text-rose-400"}>
                  {isactive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hire Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Hire New Teacher"
        description="Create an instructor account to start assigning course modules."
      >
        <form onSubmit={handleHireTeacher} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Dr. Sarah Connor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="sarah@institution.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Temporary Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            placeholder="+1 555-0192"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Hire Instructor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
