"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getImageUrl } from "@/lib/utils";
import { User, Mail, Lock, Upload, Camera, ShieldCheck } from "lucide-react";

export default function UserProfilePage() {
  const { user, uploadProfileImage } = useAuthStore();
  const { addToast } = useUIStore();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await uploadProfileImage(formData);

      addToast({
        type: "success",
        title: "Avatar Updated",
        message: "Your profile image has been saved.",
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Upload Failed",
        message: err.response?.data?.message || "Could not upload image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPass(true);

    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      addToast({
        type: "success",
        title: "Password Updated",
        message: "Your password has been changed successfully.",
      });

      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Update Failed",
        message: err.response?.data?.message || "Could not update password",
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-slate-100 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Account Settings & Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage personal details, avatar photo, and security password.</p>
      </div>

      {/* Avatar & Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={getImageUrl(user.profileImage)}
            alt={user.name}
            className="h-24 w-24 rounded-2xl object-cover border-2 border-indigo-500/30 bg-slate-950"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60";
            }}
          />
          <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold text-white gap-1">
            <Camera className="w-4 h-4" /> Change
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-xs text-slate-400">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {user.role.map((r) => (
              <span
                key={r}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Password Security Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Security & Password</span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="sm" isLoading={isChangingPass}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
