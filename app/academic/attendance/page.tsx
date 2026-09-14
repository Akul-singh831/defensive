"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useState, useEffect } from "react";
import { AttendanceSheet } from "@/module-2-academic/components/attendance/AttendanceSheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AttendancePage() {
  const { user, loading } = useAuth(["teacher", "student", "admin"]);
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/academic/courses", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCourses(data.data || []);
        }
      } finally {
        setCoursesLoading(false);
      }
    }
    if (user) {
      loadCourses();
    }
  }, [user]);

  if (loading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading attendance portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link href="/academic">
        <Button variant="outline" size="sm" className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Academic Hub
        </Button>
      </Link>

      {user && (
        <AttendanceSheet
          courses={courses}
          currentUser={{ userId: user.userId, role: user.role, email: user.email }}
        />
      )}
    </div>
  );
}
