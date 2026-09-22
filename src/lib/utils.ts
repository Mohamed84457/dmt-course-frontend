import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.replace(/^public[/\\]/, "").replace(/\\/g, "/");
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const baseUrl = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  return `${baseUrl}/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
}

export function hasAnyRole(userRoles: UserRole[] | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return allowedRoles.some((role) => userRoles.includes(role));
}

export function getRoleBadgeColor(role: UserRole): { bg: string; text: string; border: string } {
  switch (role) {
    case "owner":
      return { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" };
    case "admin":
      return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" };
    case "manager":
      return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" };
    case "instructor":
    case "teacher":
      return { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" };
    case "student":
    default:
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
  }
}
