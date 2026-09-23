import { create } from "zustand";
import { RegistrationData, User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: RegistrationData) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<User | null>;
  uploadProfileImage: (formData: FormData) => Promise<void>;
  setUser: (user: User | null) => void;
}

const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem("user");
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  return token && token !== "undefined" && token !== "null" ? token : null;
};

const isUserObject = (obj: any): boolean => {
  return !!(
    obj &&
    typeof obj === "object" &&
    (obj.email || obj._id || obj.id || obj.role || obj.name)
  );
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  isLoading: true,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", { email, password });

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.user?.accessToken ||
        res.data?.data?.user?.accessToken ||
        res.data?.data?.token ||
        res.data?.data?.accessToken;

      const refreshToken =
        res.data?.refreshToken ||
        res.data?.user?.refreshToken ||
        res.data?.data?.user?.refreshToken ||
        res.data?.data?.refreshToken;

      let user: User | null = null;
      if (isUserObject(res.data?.user)) {
        user = res.data.user;
      } else if (isUserObject(res.data?.data?.user)) {
        user = res.data.data.user;
      } else if (isUserObject(res.data?.data)) {
        user = res.data.data;
      } else if (isUserObject(res.data)) {
        user = res.data;
      }

      if (token && token !== "undefined") {
        localStorage.setItem("accessToken", token);
      }
      if (refreshToken && refreshToken !== "undefined") {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      set({
        user: user || getInitialUser(),
        token: token || null,
        isAuthenticated: !!user || !!token,
        isLoading: false,
      });

      // If user object wasn't in login payload, fetch profile immediately
      if (!user) {
        user ??= await get().fetchMe();
      }

      return user;
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || "Login failed");
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", data);
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Could not request password reset",
      );
    }
  },

  resetPassword: async (resetToken, newPassword) => {
    try {
      const res = await api.post("/auth/reset-password", {
        resetToken,
        newPassword,
      });
      return res.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Invalid or expired reset token",
      );
    }
  },

  verifyEmail: async (token: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post(`/auth/verify/${encodeURIComponent(token)}`);
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(
        err.response?.data?.message ||
          "Email verification failed or link has expired",
      );
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // clear locally anyway
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  fetchMe: async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token || token === "undefined" || token === "null") {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return null;
    }

    try {
      const res = await api.get("/auth/me");
      let fetchedUser: User | null = null;

      if (isUserObject(res.data?.data?.user)) {
        fetchedUser = res.data.data.user;
      } else if (isUserObject(res.data?.user)) {
        fetchedUser = res.data.user;
      } else if (isUserObject(res.data?.data)) {
        fetchedUser = res.data.data;
      } else if (isUserObject(res.data)) {
        fetchedUser = res.data;
      }

      if (fetchedUser) {
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        if ((fetchedUser as any).accessToken) {
          localStorage.setItem("accessToken", (fetchedUser as any).accessToken);
        }
      }

      set({
        user: fetchedUser,
        token: token || (fetchedUser as any)?.accessToken || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return fetchedUser;
    } catch (err) {
      // A failed profile request invalidates the local session and is handled by the caller.
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return null;
    }
  },

  uploadProfileImage: async (formData) => {
    const res = await api.post("/auth/image-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const updatedUser = res.data?.user || res.data?.data;
    if (updatedUser) {
      set((state) => {
        const newUser = state.user
          ? { ...state.user, ...updatedUser }
          : updatedUser;
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(newUser));
        }
        return { user: newUser };
      });
    }
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    }
    set({ user, isAuthenticated: !!user });
  },
}));
