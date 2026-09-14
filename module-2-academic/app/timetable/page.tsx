"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { TimetableSchedule } from "../../components/timetable/TimetableSchedule";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TimetablePage() {
  const { user } = useAuth(["admin", "teacher", "student"]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    async function loadCourses() {
      const res = await fetch("/api/academic/courses", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || []);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/academic">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Academic Hub
        </Button>
      </Link>

      <TimetableSchedule courses={courses} isAdmin={user?.role === "admin"} />
    </div>
  );
}
