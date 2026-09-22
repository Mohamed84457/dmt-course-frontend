"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  UserCheck,
  Building,
  MapPin,
  School,
  BookOpen,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const { addToast } = useUIStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [phone, setPhone] = useState("");

  // Student specific required & optional fields
  const [educationLevel, setEducationLevel] = useState<
    "Primary" | "Preparatory" | "Secondary" | "University" | "Graduate" | "Other"
  >("Primary");
  const [school, setSchool] = useState("");
  const [address, setAddress] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        role: ["student"],
      });

      addToast({
        type: "success",
        title: "Registration Successful!",
        message: "Please check your email to verify and activate your account.",
      });

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Registration Failed",
        message: err.message || "Could not register account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white mb-4 shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Join EduSphere Today</h2>
          <p className="text-xs text-slate-400 mt-1">Create your student profile and start learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Basics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Mohamed Eldamaty"
              icon={<UserIcon className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars, 1 Upper, 1 Special"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Must include Upper, Lower, Number & Symbol (e.g. Pass@123)
              </span>
            </div>

            <Input
              label="Personal Phone Number"
              placeholder="01012345678"
              icon={<Phone className="w-4 h-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Educational Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Education Level *
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="Primary">Primary</option>
                <option value="Preparatory">Preparatory</option>
                <option value="Secondary">Secondary</option>
                <option value="University">University</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="School / University"
              placeholder="e.g. Cairo Modern Academy"
              icon={<School className="w-4 h-4" />}
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />

            <Input
              label="Address / City"
              placeholder="e.g. Nasr City, Cairo"
              icon={<MapPin className="w-4 h-4" />}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Guardian / Parent Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              placeholder="e.g. Ahmed Eldamaty"
              icon={<UserCheck className="w-4 h-4" />}
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
            />

            <Input
              label="Parent Phone Number"
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
              Create Student Account
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-indigo-400 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
