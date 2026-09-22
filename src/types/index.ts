export type UserRole = "owner" | "admin" | "manager" | "instructor" | "student" | "teacher";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole[];
  organizationId?: string | Organization | null;
  isactive: boolean;
  gender?: "male" | "female";
  phone?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  ownerId: string | User;
  logo?: string;
  joinCode?: string;
  isactive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string | Category;
  teacherId: string | User | { _id?: string; employeeCode?: string; specialization?: string; userId?: User | string; name?: string; email?: string };
  organizationId?: string | Organization;
  price: number;
  isPublished?: boolean;
  status?: string;
  image?: string;
  thumbnail?: string;
  level?: "beginner" | "intermediate" | "advanced";
  durationHours?: number;
  totalLessons?: number;
  enrolledStudentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content?: string;
  description?: string;
  videoUrl?: string;
  materialUrl?: string;
  courseId: string | Course;
  order?: number;
  orderIndex?: number;
  isPublished: boolean;
  durationMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestionOption {
  _id?: string;
  optionText: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  _id?: string;
  questionText: string;
  questionType?: "mcq" | "true_false" | "short_answer" | "multiple_choice" | "essay";
  options?: QuizQuestionOption[];
  points?: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  lessonId: string | Lesson;
  courseId?: string;
  questions: QuizQuestion[];
  totalMarks?: number;
  passingMarks?: number;
  passingScore?: number;
  durationMinutes?: number;
  timeLimitMinutes?: number;
  status?: "draft" | "published" | "closed";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizSubmissionAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  selectedOptionId?: string;
  essayAnswer?: string;
  isCorrect?: boolean;
  scoreAwarded?: number;
  pointsObtained?: number;
  answerText?: string;
}

export interface QuizSubmission {
  _id: string;
  quizId: string | Quiz;
  studentId: string | User | any;
  answers: QuizSubmissionAnswer[];
  totalScore?: number;
  score?: number;
  bonusPoints?: number;
  isPassed?: boolean;
  passed?: boolean;
  status?: "graded" | "pending_manual_grading" | "submitted" | "pending" | string;
  createdAt?: string;
  submittedAt?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  lessonId: string | Lesson;
  courseId?: string;
  dueDate?: string;
  totalPoints?: number;
  attachmentUrl?: string;
  fileAttachment?: string;
  status?: "draft" | "published" | "closed";
  createdAt?: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignmentId: string | Assignment;
  studentId: string | User | any;
  submissionText?: string;
  fileUrl?: string;
  grade?: number;
  feedback?: string;
  status?: "submitted" | "graded" | "late" | string;
  createdAt?: string;
}

export interface Enrollment {
  _id: string;
  studentId: string | User | any;
  courseId: string | Course | any;
  status: "active" | "cancelled" | "completed" | "pending" | "dropped" | string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded" | "free" | "unpaid" | string;
  progressPercentage?: number;
  progress?: number;
  completedLessons?: string[];
  enrolledAt?: string;
  createdAt?: string;
}

export interface Payment {
  _id: string;
  studentId: string | User;
  enrollmentId?: string | Enrollment;
  courseId?: string | Course;
  amount: number;
  paymentMethod: "cash" | "card" | "bank_transfer";
  status: "completed" | "pending" | "failed" | "refunded";
  month?: string;
  notes?: string;
  transactionId?: string;
  receiptUrl?: string;
  createdAt?: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  type?: "info" | "success" | "warning" | "error";
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}
