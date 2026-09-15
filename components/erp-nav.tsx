"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  LogOut,
  User,
  Shield,
  CheckCircle2,
  Database,
  ArrowRightLeft,
  ChevronDown,
} from "lucide-react";

interface ErpNavProps {
  currentModule: "admissions" | "academic";
}

export function ErpNav({ currentModule }: ErpNavProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switching, setSwitching] = useState(false);

  const quickSwitch = async (email: string, pass: string) => {
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
        credentials: "include",
      });
      if (res.ok) {
        setShowSwitchModal(false);
        window.location.reload();
      }
    } finally {
      setSwitching(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "teacher":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "student":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <>
      {/* Top Institutional Notification Bar */}
      <div className="w-full bg-neutral-900 border-b border-neutral-800 text-[11px] py-1 px-4 text-neutral-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              LTSU NOTICE
            </span>
            <span className="truncate text-neutral-300">
              Scholarship Entrance Test LTSU-SET 2026 active. Industry admissions in progress for IBM CSE and Tata Technologies Mechatronics.
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              UGC Act 1956 Sec 2(f) Approved
            </span>
            <span>Punjab State Act No. 22 of 2021</span>
            <a
              href="https://erp.ltsu.in/student-portal/login"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium underline-offset-2 hover:underline"
            >
              Public Student Portal
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo & University Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-neutral-950 shadow-md shadow-amber-500/20 font-black text-sm">
                LTSU
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-100">
                    Lamrin Tech Skills University
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Punjab, Ropar
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 hidden sm:flex">
                  <span className="font-semibold text-neutral-300">Industry Anchors:</span>
                  <span className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-sky-400">IBM</span>
                  <span className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-blue-400">Tata Technologies</span>
                  <span className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-amber-400">Ansys</span>
                  <span className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-emerald-400">NSDC</span>
                </div>
              </div>
            </div>

            {/* Module Switcher Tabs */}
            <nav className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
              <Link
                href="/admissions"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentModule === "admissions"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Admissions ERP</span>
              </Link>
              <Link
                href="/academic"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentModule === "academic"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Academic ERP</span>
              </Link>
            </nav>

            {/* User Session & Actions */}
            <div className="flex items-center gap-2">
              {/* Database indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Turso SQLite</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>

              {/* User profile dropdown button */}
              <button
                type="button"
                onClick={() => setShowSwitchModal(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 text-xs text-neutral-200 transition-colors"
                title="Switch role or inspect session"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-medium truncate max-w-[130px]">
                    {user?.email || "Guest Session"}
                  </div>
                </div>
                {user?.role && (
                  <span
                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Sign out of current session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-100">
                  Enterprise Role Switcher
                </h3>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-neutral-500 hover:text-neutral-300 text-xs"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Switch test accounts to inspect role-based access permissions across Admissions and Academic modules.
            </p>

            <div className="space-y-2">
              <button
                disabled={switching}
                onClick={() => quickSwitch("admin@university.edu", "AdminPass123!")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 hover:border-amber-500/40 bg-neutral-950 hover:bg-neutral-800/40 text-left transition-all"
              >
                <div>
                  <div className="text-xs font-medium text-neutral-200">System Administrator</div>
                  <div className="text-[11px] text-neutral-500">admin@university.edu</div>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Admin
                </span>
              </button>

              <button
                disabled={switching}
                onClick={() => quickSwitch("faculty1@university.edu", "FacultyPass123!")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 hover:border-blue-500/40 bg-neutral-950 hover:bg-neutral-800/40 text-left transition-all"
              >
                <div>
                  <div className="text-xs font-medium text-neutral-200">Dr. Alan Turing (Faculty)</div>
                  <div className="text-[11px] text-neutral-500">faculty1@university.edu</div>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Faculty
                </span>
              </button>

              <button
                disabled={switching}
                onClick={() => quickSwitch("student1@university.edu", "StudentPass123!")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 hover:border-emerald-500/40 bg-neutral-950 hover:bg-neutral-800/40 text-left transition-all"
              >
                <div>
                  <div className="text-xs font-medium text-neutral-200">Alice Smith (Student)</div>
                  <div className="text-[11px] text-neutral-500">student1@university.edu</div>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Student
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
