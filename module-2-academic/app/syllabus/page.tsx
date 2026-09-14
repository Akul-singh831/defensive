"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SyllabusPage() {
  const { user } = useAuth(["admin", "teacher", "student"]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [syllabus, setSyllabus] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    content: "",
    objectives: "",
    textbooks: "",
    assessmentMethod: "30% Continuous Assessment, 70% Final Exam",
  });

  const canEdit = user?.role === "teacher" || user?.role === "admin";

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

  const fetchSyllabus = useCallback(async () => {
    if (!selectedCourse) return;
    const res = await fetch(`/api/academic/syllabus/${selectedCourse}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setSyllabus(data.data);
      if (data.data) {
        setForm({
          content: data.data.content || "",
          objectives: data.data.objectives || "",
          textbooks: data.data.textbooks ? JSON.parse(data.data.textbooks).join(", ") : "",
          assessmentMethod: data.data.assessmentMethod || "",
        });
      } else {
        setForm({ content: "", objectives: "", textbooks: "", assessmentMethod: "" });
      }
    } else {
      setSyllabus(null);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        courseId: selectedCourse,
        content: form.content,
        objectives: form.objectives,
        textbooks: form.textbooks.split(",").map((s) => s.trim()).filter(Boolean),
        assessmentMethod: form.assessmentMethod,
      };

      const res = await fetch("/api/academic/create-syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        setMsg("Syllabus successfully saved and authenticated.");
        setIsEditing(false);
        fetchSyllabus();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
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

      {msg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <Card className="border border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">Course Syllabus & Curriculum</CardTitle>
              <CardDescription>Official learning objectives, recommended reading, and evaluation methods.</CardDescription>
            </div>
            {canEdit && !isEditing && (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                {syllabus ? "Edit Syllabus" : "Create Syllabus"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sylContent">Detailed Syllabus Content (Markdown or Text)</Label>
                <Textarea
                  id="sylContent"
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Unit 1: Fundamentals of Algorithm Complexity..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sylObj">Course Objectives</Label>
                <Input
                  id="sylObj"
                  value={form.objectives}
                  onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                  placeholder="Understand asymptotic bounds, recursion, dynamic programming"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sylText">Textbooks (Comma separated)</Label>
                <Input
                  id="sylText"
                  value={form.textbooks}
                  onChange={(e) => setForm({ ...form, textbooks: e.target.value })}
                  placeholder="Introduction to Algorithms (CLRS), Data Structures in C"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sylEval">Assessment Breakdown</Label>
                <Input
                  id="sylEval"
                  value={form.assessmentMethod}
                  onChange={(e) => setForm({ ...form, assessmentMethod: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving..." : "Save Syllabus"}
                </Button>
              </div>
            </form>
          ) : syllabus ? (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Curriculum Units
                </h3>
                <div className="p-3.5 rounded-lg bg-muted/40 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {syllabus.content}
                </div>
              </div>

              {syllabus.objectives && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Learning Objectives
                  </h3>
                  <p className="text-muted-foreground">{syllabus.objectives}</p>
                </div>
              )}

              {syllabus.assessmentMethod && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Evaluation Weightage
                  </h3>
                  <p className="text-muted-foreground">{syllabus.assessmentMethod}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
              No syllabus published for this course yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
