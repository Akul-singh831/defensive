"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { CourseList, type CourseItem } from "../../components/courses/CourseList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CoursesPage() {
  const { user } = useAuth(["admin", "teacher", "student"]);
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const fetchCourses = async () => {
    const res = await fetch("/api/academic/courses", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setCourses(data.data || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/academic">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Academic Hub
        </Button>
      </Link>

      <CourseList
        courses={courses}
        isAdmin={user?.role === "admin"}
        onRefresh={fetchCourses}
      />
    </div>
  );
}
