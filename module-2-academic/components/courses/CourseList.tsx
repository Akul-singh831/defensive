"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  program: string;
  semester: number;
  isActive: boolean;
}

interface CourseListProps {
  courses: CourseItem[];
  isAdmin: boolean;
  onRefresh?: () => void;
}

export function CourseList({ courses, isAdmin, onRefresh }: CourseListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    credits: 4,
    program: "B.Tech Computer Science",
    semester: 1,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/academic/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ code: "", name: "", credits: 4, program: "B.Tech Computer Science", semester: 1 });
        if (onRefresh) onRefresh();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (courseId: string) => {
    setTogglingId(courseId);
    try {
      const res = await fetch(`/api/academic/course/${courseId}/status`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Academic Courses & Curriculum</h2>
          <p className="text-xs text-muted-foreground">Certified degree courses with credit specifications.</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "Add Course"}
          </Button>
        )}
      </div>

      {showCreate && isAdmin && (
        <Card className="border border-border shadow-sm mb-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Create New Course</CardTitle>
            <CardDescription>All course additions are strictly logged in the tamper-evident audit trail.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  placeholder="CS201"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="courseName">Course Title</Label>
                <Input
                  id="courseName"
                  placeholder="Data Structures & Algorithms"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="courseCredits">Credits (1-10)</Label>
                <Input
                  id="courseCredits"
                  type="number"
                  min="1"
                  max="10"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 4 })}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="courseProgram">Program</Label>
                <Input
                  id="courseProgram"
                  placeholder="B.Tech Computer Science"
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="courseSemester">Semester (1-8)</Label>
                <Input
                  id="courseSemester"
                  type="number"
                  min="1"
                  max="8"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Creating..." : "Save Course"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-28">Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No courses listed.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium text-sm">{c.code}</TableCell>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.program}</TableCell>
                  <TableCell className="text-sm font-mono">{c.credits} cr</TableCell>
                  <TableCell className="text-sm">Sem {c.semester}</TableCell>
                  <TableCell>
                    {c.isActive ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {c.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-destructive hover:bg-destructive/10"
                          disabled={togglingId === c.id}
                          onClick={() => handleToggleStatus(c.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
