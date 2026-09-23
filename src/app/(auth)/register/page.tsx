"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { api } from "@/lib/api";
import { Organization } from "@/types";
import { useAppPreferences } from "@/components/providers/AppPreferences";
import { PreferenceControls } from "@/components/layout/PreferenceControls";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  UserCheck,
  MapPin,
  School,
  Building2,
} from "lucide-react";

type EducationLevel =
  | "Primary"
  | "Preparatory"
  | "Secondary"
  | "University"
  | "Graduate"
  | "Other";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const { addToast } = useUIStore();
  const { t } = useAppPreferences();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [phone, setPhone] = useState("");

  // Student specific required & optional fields
  const [educationLevel, setEducationLevel] =
    useState<EducationLevel>("Primary");
  const [school, setSchool] = useState("");
  const [address, setAddress] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [organizationsLoading, setOrganizationsLoading] = useState(true);
  const [organizationsError, setOrganizationsError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    api
      .get("/organization")
      .then((res) => {
        const list =
          res.data?.organizations ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        setOrganizations(
          list.filter(
            (organization: Organization) => organization.isactive !== false,
          ),
        );
      })
      .catch(() => setOrganizationsError(true))
      .finally(() => setOrganizationsLoading(false));
  }, []);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!organizationId) {
      addToast({
        type: "error",
        title: t("chooseOrganization"),
        message: t("chooseOrganization"),
      });
      return;
    }
    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        gender,
        phone: phone || undefined,
        educationLevel,
        school: school || undefined,
        address: address || undefined,
        parentName: parentName || undefined,
        parentPhone: parentPhone || undefined,
        organizationId,
        role: ["student"],
      });

      addToast({
        type: "success",
        title: t("registrationSuccess"),
        message: t("verifyInstruction"),
      });

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      addToast({
        type: "error",
        title: t("registrationFailed"),
        message: err instanceof Error ? err.message : t("registrationError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] px-4 py-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl justify-end">
        <PreferenceControls />
      </div>
      <div className="mx-auto mt-4 w-full max-w-xl space-y-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-500 text-white mb-4 shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-7 w-7" />
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="mb-3 flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t("chooseOrganization")}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {t("organizationHint")}
                </p>
              </div>
            </div>
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              required
              disabled={organizationsLoading || organizations.length === 0}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                {organizationsLoading
                  ? t("loadingOrganizations")
                  : t("chooseOrganization")}
              </option>
              {organizations.map((organization) => (
                <option key={organization._id} value={organization._id}>
                  {organization.name}
                </option>
              ))}
            </select>
            {organizationsError && (
              <p className="mt-2 text-xs text-rose-400">
                {t("loadOrganizationsError")}
              </p>
            )}
            {!organizationsLoading &&
              !organizationsError &&
              organizations.length === 0 && (
                <p className="mt-2 text-xs text-amber-400">
                  {t("noOrganizations")}
                </p>
              )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {t("registrationTitle")}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t("registrationSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Basics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("fullName")}
              placeholder={t("fullName")}
              icon={<UserIcon className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label={t("emailAddress")}
              type="email"
              placeholder="student@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label={t("password")}
                type="password"
                placeholder="Min 8 chars, 1 Upper, 1 Special"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                {t("passwordHint")}
              </span>
            </div>

            <Input
              label={t("personalPhone")}
              placeholder="01012345678"
              icon={<Phone className="w-4 h-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Educational Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="education-level"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
              >
                {t("educationLevel")} *
              </label>
              <select
                id="education-level"
                value={educationLevel}
                onChange={(e) =>
                  setEducationLevel(e.target.value as EducationLevel)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="Primary">{t("primary")}</option>
                <option value="Preparatory">{t("preparatory")}</option>
                <option value="Secondary">{t("secondary")}</option>
                <option value="University">{t("university")}</option>
                <option value="Graduate">{t("graduate")}</option>
                <option value="Other">{t("other")}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
              >
                {t("gender")}
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="male">{t("male")}</option>
                <option value="female">{t("female")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("school")}
              placeholder="e.g. Cairo Modern Academy"
              icon={<School className="w-4 h-4" />}
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />

            <Input
              label={t("address")}
              placeholder="e.g. Nasr City, Cairo"
              icon={<MapPin className="w-4 h-4" />}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Guardian / Parent Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("parentName")}
              placeholder="e.g. Ahmed Eldamaty"
              icon={<UserCheck className="w-4 h-4" />}
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
            />

            <Input
              label={t("parentPhone")}
              placeholder="01909090909"
              icon={<Phone className="w-4 h-4" />}
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              icon={<UserCheck className="w-4 h-4" />}
            >
              {t("createStudentAccount")}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-400">
          {t("alreadyRegistered")}{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-400 hover:underline"
          >
            {t("signInHere")}
          </Link>
        </div>
      </div>
    </div>
  );
}
