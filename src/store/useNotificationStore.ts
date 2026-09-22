import { create } from "zustand";
import { Notification } from "@/types";
import { api } from "@/lib/api";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/notifications");
      const list: Notification[] = res.data?.data || res.data?.notifications || [];
      const unread = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadCount: unread, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch (e) {}
  },

  markAllAsRead: async () => {
    try {
      await api.patch("/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (e) {}
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => {
        const filtered = state.notifications.filter((n) => n._id !== id);
        return {
          notifications: filtered,
          unreadCount: filtered.filter((n) => !n.isRead).length,
        };
      });
    } catch (e) {}
  },

  deleteAllNotifications: async () => {
    try {
      await api.delete("/notifications/all");
      set({ notifications: [], unreadCount: 0 });
    } catch (e) {}
  },
}));
