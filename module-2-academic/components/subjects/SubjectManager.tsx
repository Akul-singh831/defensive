"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SubjectItem {
  id: string;
  courseId: string;
  code: string;
  name: string;
  credits: number;
  description?: string | null;
}

interface SubjectManagerProps {
  subjects: SubjectItem[];
  courseId: string;
  isAdmin: boolean;
  onRefresh?: () => void;
}

export function SubjectManager({ subjects, courseId, isAdmin, onRefresh }: SubjectManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    credits: 3,
    description: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/academic/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courseId }),
        credentials: "include",
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ code: "", name: "", credits: 3, description: "" });
        if (onRefresh) onRefresh();
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Course Subjects & Modules</CardTitle>
            <CardDescription>Distinct curricular components mapped to accredited degree courses.</CardDescription>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? "Cancel" : "Add Subject"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && isAdmin && (
          <form onSubmit={handleAdd} className="p-4 rounded-lg bg-muted/40 border grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Subject Code</Label>
              <Input
                placeholder="CS201-T"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subject Name</Label>
              <Input
                placeholder="Algorithms Theory"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Credits</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 3 })}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? "Saving..." : "Save Subject"}
              </Button>
            </div>
          </form>
        )}

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Subject Title</TableHead>
                <TableHead>Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-xs text-muted-foreground">
                    No subjects mapped to this course yet.
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs font-semibold">{s.code}</TableCell>
                    <TableCell className="text-sm font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs">{s.credits} cr</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
