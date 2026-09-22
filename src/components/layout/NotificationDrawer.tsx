"use client";

import React, { useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUIStore } from "@/store/useUIStore";
import { formatDate } from "@/lib/utils";
import { Bell, CheckCheck, Trash2, X, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";

export const NotificationDrawer: React.FC = () => {
  const { notificationDrawerOpen, toggleNotificationDrawer } = useUIStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotificationStore();

  useEffect(() => {
    if (notificationDrawerOpen) {
      fetchNotifications();
    }
  }, [notificationDrawerOpen, fetchNotifications]);

  if (!notificationDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={toggleNotificationDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            onClick={toggleNotificationDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800/60 bg-slate-950/40 text-xs">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <button
              onClick={deleteAllNotifications}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bell className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No notifications yet</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                You will receive alerts here when assignments are graded, courses are published, or payments update.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`group relative p-4 rounded-xl border transition-all duration-200 ${
                  item.isRead
                    ? "bg-slate-950/40 border-slate-800/60 text-slate-400"
                    : "bg-indigo-950/20 border-indigo-500/30 text-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item._id)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(item._id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
