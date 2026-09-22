import { create } from "zustand";
import { Course, Category, Lesson } from "@/types";
import { api } from "@/lib/api";

interface CourseState {
  courses: Course[];
  categories: Category[];
  activeCourse: Course | null;
  activeLessons: Lesson[];
  searchQuery: string;
  selectedCategoryId: string | null;
  isLoading: boolean;
  fetchCourses: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<Course>;
  fetchCourseLessons: (courseId: string) => Promise<Lesson[]>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (catId: string | null) => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  categories: [],
  activeCourse: null,
  activeLessons: [],
  searchQuery: "",
  selectedCategoryId: null,
  isLoading: false,

  fetchCourses: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.get("/courses", { params });
      const list = res.data?.courses || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      set({ courses: list, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await api.get("/categories");
      const list = res.data?.categories || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      set({ categories: list });
    } catch (err) {}
  },

  fetchCourseById: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/courses/${id}`);
      const course = res.data?.course || res.data?.data || res.data;
      set({ activeCourse: course, isLoading: false });
      return course;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchCourseLessons: async (courseId: string) => {
    try {
      // attempt published first if student or public, or regular route
      let res;
      try {
        res = await api.get(`/lessons/course/${courseId}/published`);
      } catch {
        res = await api.get(`/lessons/course/${courseId}`);
      }
      const lessons = res.data?.lessons || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      set({ activeLessons: lessons });
      return lessons;
    } catch (err) {
      return [];
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (catId) => set({ selectedCategoryId: catId }),
}));
