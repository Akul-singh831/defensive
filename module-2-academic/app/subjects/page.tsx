"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { SubjectManager, type SubjectItem } from "../../components/subjects/SubjectManager";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubjectsPage() {
  const { user } = useAuth(["admin", "teacher", "student"]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  useEffect(() => {
    async function loadCourses() {
      const res = await fetch("/api/academic/courses", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || [];
        setCourses(list);
        if (list.length > 0) setSelectedCourse(list[0].id);
      }
    }
    loadCourses();
  }, []);

  const fetchSubjects = useCallback(async () => {
    if (!selectedCourse) return;
    const res = await fetch(`/api/academic/subjects/${selectedCourse}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setSubjects(data.data || []);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/academic">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Academic Hub
          </Button>
        </Link>

        {courses.length > 0 && (
          <div className="w-64">
            <Select value={selectedCourse} onValueChange={(val) => { if (val) setSelectedCourse(val); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <SubjectManager
        subjects={subjects}
        courseId={selectedCourse}
        isAdmin={user?.role === "admin"}
        onRefresh={fetchSubjects}
      />
    </div>
  );
}
