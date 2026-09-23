import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Globe,
  Share2,
  MessageSquare,
  Heart,
} from "lucide-react";
import { useAppPreferences } from "@/components/providers/AppPreferences";

export const Footer: React.FC = () => {
  const { t } = useAppPreferences();
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-purple-500 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Edu<span className="text-indigo-400">Sphere</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("platformDescription")}
            </p>
          </div>

          {/* Nav Col 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t("exploreCourses")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("webDevelopment")}
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("dataScience")}
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("businessFinance")}
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("designUx")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t("platformRoles")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/organizations"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("organizations")}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("instructorPortal")}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("studentEnrollment")}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t("adminDashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t("connectSocial")}
            </h4>
            <div className="flex gap-3 mb-4">
              <a
                href="/organizations"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="/courses"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="/profile"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} EduSphere Inc.{" "}
              {t("allRightsReserved")}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1">
            {t("builtForEducation")}{" "}
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" />{" "}
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-slate-400">
              {t("privacyPolicy")}
            </a>
            <a href="/terms" className="hover:text-slate-400">
              {t("termsService")}
            </a>
            <a href="/security" className="hover:text-slate-400">
              {t("security")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
