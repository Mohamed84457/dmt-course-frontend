import React from "react";
import Link from "next/link";
import { GraduationCap, Globe, Share2, MessageSquare, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Edu<span className="text-indigo-400">Sphere</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              An enterprise-grade LMS platform empowering students, instructors, and organizations with modern digital learning experiences.
            </p>
          </div>

          {/* Nav Col 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Explore Courses
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/courses" className="hover:text-indigo-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-indigo-400 transition-colors">
                  Data Science & AI
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-indigo-400 transition-colors">
                  Business & Finance
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-indigo-400 transition-colors">
                  Design & UX
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform & Roles
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/organizations" className="hover:text-indigo-400 transition-colors">
                  Organizations
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Instructor Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-400 transition-colors">
                  Student Enrollment
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Connect & Social
            </h4>
            <div className="flex gap-3 mb-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} EduSphere Inc. All rights reserved.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" /> for next-generation digital education.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-400">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-400">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
