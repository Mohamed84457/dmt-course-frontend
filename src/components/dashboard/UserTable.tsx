"use client";

import React, { useState } from "react";
import { User, UserRole } from "@/types";
import { api } from "@/lib/api";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useUIStore } from "@/store/useUIStore";
import { formatDate, getRoleBadgeColor } from "@/lib/utils";
import { Shield, ToggleLeft, ToggleRight, UserCheck, Search } from "lucide-react";

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onRefresh }) => {
  const { addToast } = useUIStore();
  const [filterQuery, setFilterQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleRoleChange = async (userId: string, currentRoles: UserRole[], newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: [newRole] });
      addToast({
        type: "success",
        title: "Role Updated",
        message: `User role changed to ${newRole}`,
      });
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Update Error",
        message: err.response?.data?.message || "Failed to update role",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}/status`, { isactive: !currentStatus });
      addToast({
        type: "success",
        title: "Status Updated",
        message: `User status changed to ${!currentStatus ? "Active" : "Inactive"}`,
      });
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Update Error",
        message: err.response?.data?.message || "Failed to update status",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Filter users by name or email..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          Total Users: {filteredUsers.length}
        </span>
      </div>

      {/* Datatable */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">User Details</th>
              <th className="px-5 py-3.5">Roles</th>
              <th className="px-5 py-3.5">Active Status</th>
              <th className="px-5 py-3.5">Joined Date</th>
              <th className="px-5 py-3.5 text-right">Role Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.map((u) => {
              const primaryRole = u.role[0] || "student";
              const badgeColors = getRoleBadgeColor(primaryRole);

              return (
                <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                  {/* User Name & Email */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>

                  {/* Role Pills */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.role.map((r) => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleStatusToggle(u._id, u.isactive)}
                      disabled={updatingId === u._id}
                      className="inline-flex items-center gap-1.5 focus:outline-none"
                    >
                      {u.isactive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <ToggleRight className="w-5 h-5 text-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                          <ToggleLeft className="w-5 h-5 text-rose-500" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Joined Date */}
                  <td className="px-5 py-4 text-slate-400">{formatDate(u.createdAt)}</td>

                  {/* Role Switcher Select */}
                  <td className="px-5 py-4 text-right">
                    <select
                      value={primaryRole}
                      disabled={updatingId === u._id}
                      onChange={(e) =>
                        handleRoleChange(u._id, u.role, e.target.value as UserRole)
                      }
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
