"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Award, Send } from "lucide-react";

interface MarksGradebookProps {
  courses: Array<{ id: string; code: string; name: string }>;
  currentUser: { userId: string; role: string; email: string };
}

export function MarksGradebook({ courses, currentUser }: MarksGradebookProps) {
  const isTeacher = currentUser.role === "teacher" || currentUser.role === "admin";
  const isStudent = currentUser.role === "student";

  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || "");
  const [assessmentName, setAssessmentName] = useState("Midterm Examination");
  const [assessmentType, setAssessmentType] = useState<"assignment" | "quiz" | "midterm" | "final">("midterm");
  const [maxMarks, setMaxMarks] = useState(100);

  // Demo student roster for grade recording
  const [roster, setRoster] = useState([
    { studentId: "student-1", name: "Jordan Lee", marksObtained: 85, feedback: "Strong analytical breakdown" },
    { studentId: "student-2", name: "Samantha Reed", marksObtained: 92, feedback: "Exemplary solution architecture" },
    { studentId: "student-3", name: "Marcus Chen", marksObtained: 74, feedback: "Good effort, review pointer math" },
  ]);

  // Student own marks
  const [studentMarks, setStudentMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStudentMarks = useCallback(async () => {
    if (!selectedCourse || !isStudent) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/academic/marks/${selectedCourse}/${currentUser.userId}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setStudentMarks(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, isStudent, currentUser.userId]);

  useEffect(() => {
    if (isStudent) {
      fetchStudentMarks();
    }
  }, [isStudent, fetchStudentMarks]);

  const calculateGrade = (obtained: number, max: number) => {
    if (max <= 0) return "F";
    const pct = (obtained / max) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  };

  const handleSaveMarks = async () => {
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const payload = {
        courseId: selectedCourse,
        assessmentName,
        assessmentType,
        maxMarks,
        records: roster.map((r) => ({
          studentId: r.studentId,
          marksObtained: r.marksObtained,
          feedbackNotes: r.feedback,
        })),
      };

      const res = await fetch("/api/academic/record-marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to record marks");
      }

      setStatusMsg({
        type: "success",
        text: `Successfully recorded assessment marks for ${roster.length} students.`,
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving marks",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishResults = async () => {
    setPublishing(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/academic/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse, assessmentName }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");

      setStatusMsg({
        type: "success",
        text: `Results for '${assessmentName}' have been published and are now visible to enrolled students.`,
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error publishing marks",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Assessments & Gradebook</h2>
          <p className="text-xs text-muted-foreground">
            Strict score validation (0 to maxMarks) prevents unauthorized grade tampering or negative marks.
          </p>
        </div>

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

      {statusMsg && (
        <div
          className={`p-3.5 rounded-lg text-sm flex items-start gap-2.5 ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TEACHER VIEW: GRADE ENTRY */}
      {isTeacher && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Faculty Grade Entry</CardTitle>
                <CardDescription>
                  Enter marks within allowed boundaries. Computed letter grades update automatically.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handlePublishResults} disabled={publishing}>
                  <Send className="w-4 h-4 mr-1.5" />
                  {publishing ? "Publishing..." : "Publish Results"}
                </Button>
                <Button size="sm" onClick={handleSaveMarks} disabled={submitting}>
                  <Award className="w-4 h-4 mr-1.5" />
                  {submitting ? "Saving..." : "Submit Marks"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
              <div className="space-y-1.5">
                <Label htmlFor="assessmentName" className="text-xs">Assessment Title</Label>
                <Input
                  id="assessmentName"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assessmentType" className="text-xs">Assessment Category</Label>
                <Select
                  value={assessmentType}
                  onValueChange={(val: any) => setAssessmentType(val)}
                >
                  <SelectTrigger id="assessmentType" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="midterm">Midterm Exam</SelectItem>
                    <SelectItem value="final">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxMarks" className="text-xs">Maximum Allowable Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  min="1"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead className="w-32">Marks Obtained</TableHead>
                    <TableHead className="w-24">Grade</TableHead>
                    <TableHead>Instructor Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((r, idx) => {
                    const grade = calculateGrade(r.marksObtained, maxMarks);
                    return (
                      <TableRow key={r.studentId}>
                        <TableCell className="font-medium text-sm">{r.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {r.studentId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={r.marksObtained}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setRoster((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, marksObtained: val } : item
                                  )
                                );
                              }}
                              className="h-7 text-xs font-mono w-20"
                            />
                            <span className="text-xs text-muted-foreground">/ {maxMarks}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono font-semibold text-primary">
                            {grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Feedback comments"
                            value={r.feedback}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRoster((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, feedback: val } : item))
                              );
                            }}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STUDENT VIEW: OWN PUBLISHED GRADES */}
      {isStudent && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Your Official Gradebook</CardTitle>
            <CardDescription>
              Published grades and faculty feedback for your enrolled coursework.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentMarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No marks or assessments have been published for this course yet.
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Letter Grade</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentMarks.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium text-sm">{m.assessmentName}</TableCell>
                        <TableCell className="capitalize text-xs text-muted-foreground">
                          {m.assessmentType}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold">
                          {m.marksObtained} / {m.maxMarks}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary font-mono">
                            {m.grade || calculateGrade(m.marksObtained, m.maxMarks)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {m.feedbackNotes || "No notes provided"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
