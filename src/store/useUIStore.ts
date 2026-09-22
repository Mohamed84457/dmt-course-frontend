import { create } from "zustand";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  notificationDrawerOpen: boolean;
  activeModal: string | null;
  modalData: any;
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleNotificationDrawer: () => void;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  notificationDrawerOpen: false,
  activeModal: null,
  modalData: null,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleNotificationDrawer: () =>
    set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),

  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
