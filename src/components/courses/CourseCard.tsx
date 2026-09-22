"use client";

import React from "react";
import Link from "next/link";
import { Course } from "@/types";
import { getImageUrl, formatCurrency } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { Clock, BookOpen, Star, UserCheck } from "lucide-react";

interface CourseCardProps {
  course: Course;
  progressPercentage?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, progressPercentage }) => {
  const categoryName =
    typeof course.category === "object" ? course.category?.name : "General";
  
  const teacherObj = typeof course.teacherId === "object" ? (course.teacherId as any) : null;
  const userObj = teacherObj && typeof teacherObj.userId === "object" ? teacherObj.userId : null;
  const teacherName = userObj?.name || teacherObj?.name || "Instructor";

  const imageSrc = course.image || course.thumbnail;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={getImageUrl(imageSrc)}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="purple" size="sm">
            {categoryName}
          </Badge>
          {course.level && (
            <Badge variant="secondary" size="sm" className="capitalize backdrop-blur-md">
              {course.level}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">{teacherName}</span>
          </div>

          <h3 className="line-clamp-2 text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
            {course.title}
          </h3>

          <p className="line-clamp-2 text-xs text-slate-400 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Enrolled Progress Bar OR Price & CTA */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          {progressPercentage !== undefined ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Progress</span>
                <span className="text-indigo-400">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Course Fee</span>
                <span className="text-lg font-bold text-white">
                  {course.price === 0 ? "Free" : formatCurrency(course.price)}
                </span>
              </div>

              <Link
                href={`/courses/${course._id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 px-3.5 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <span>View Details</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
