"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, UserCheck, ShieldAlert } from "lucide-react";

interface AttendanceSheetProps {
  courses: Array<{ id: string; code: string; name: string }>;
  currentUser: { userId: string; role: string; email: string };
}

interface RosterStudent {
  studentId: string;
  name: string;
  status: "present" | "absent" | "leave";
  remarks: string;
}

export function AttendanceSheet({ courses, currentUser }: AttendanceSheetProps) {
  const isTeacher = currentUser.role === "teacher" || currentUser.role === "admin";
  const isStudent = currentUser.role === "student";

  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || "");
  const [classDate, setClassDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Demo student roster for faculty marking
  const [roster, setRoster] = useState<RosterStudent[]>([
    { studentId: "student-1", name: "Jordan Lee", status: "present", remarks: "" },
    { studentId: "student-2", name: "Samantha Reed", status: "present", remarks: "" },
    { studentId: "student-3", name: "Marcus Chen", status: "absent", remarks: "Illness" },
  ]);

  // Student own attendance state
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStudentAttendance = useCallback(async () => {
    if (!selectedCourse || !isStudent) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/academic/attendance/${selectedCourse}/${currentUser.userId}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setStudentRecords(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, isStudent, currentUser.userId]);

  useEffect(() => {
    if (isStudent) {
      fetchStudentAttendance();
    }
  }, [isStudent, fetchStudentAttendance]);

  const handleStatusChange = (index: number, newStatus: "present" | "absent" | "leave") => {
    setRoster((prev) =>
      prev.map((r, i) => (i === index ? { ...r, status: newStatus } : r))
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const batchPayload = {
        courseId: selectedCourse,
        classDate,
        records: roster.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        })),
      };

      const res = await fetch("/api/academic/mark-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchPayload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to record attendance");
      }

      setStatusMsg({
        type: "success",
        text: `Successfully recorded attendance for ${roster.length} students on ${classDate}.`,
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving attendance",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalClasses = studentRecords.length;
  const attended = studentRecords.filter((r) => r.status === "present").length;
  const attendanceRate = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Daily Attendance Tracking</h2>
          <p className="text-xs text-muted-foreground">
            Strict faculty class-assignment ownership and duplicate date prevention enforced.
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

      {/* TEACHER VIEW: MARKING ROSTER */}
      {isTeacher && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Faculty Attendance Marking Roster</CardTitle>
                <CardDescription>
                  Select class date and toggle student presence. Server prevents duplicate recordings.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sessionDate" className="text-xs">Date:</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="w-40 h-8 text-xs"
                  />
                </div>
                <Button size="sm" onClick={handleSaveAttendance} disabled={saving}>
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((student, idx) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-medium text-sm">{student.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {student.studentId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={student.status === "present" ? "default" : "outline"}
                            className="h-7 text-xs px-2.5"
                            onClick={() => handleStatusChange(idx, "present")}
                          >
                            Present
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={student.status === "absent" ? "destructive" : "outline"}
                            className="h-7 text-xs px-2.5"
                            onClick={() => handleStatusChange(idx, "absent")}
                          >
                            Absent
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={student.status === "leave" ? "secondary" : "outline"}
                            className="h-7 text-xs px-2.5"
                            onClick={() => handleStatusChange(idx, "leave")}
                          >
                            Leave
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Optional remarks"
                          value={student.remarks}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRoster((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, remarks: val } : r))
                            );
                          }}
                          className="h-7 text-xs w-48"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STUDENT VIEW: OWN ATTENDANCE STATS */}
      {isStudent && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Attendance Percentage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`text-2xl font-bold font-mono ${attendanceRate < 75 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {attendanceRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {attendanceRate < 75 ? "Below 75% minimum threshold" : "In good standing"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold font-mono">{totalClasses}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Classes conducted</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Attended
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {attended}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Sessions present</p>
              </CardContent>
            </Card>
          </div>

          {attendanceRate < 75 && (
            <div className="p-3.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Academic Risk Alert: Your current attendance ({attendanceRate}%) is below the university 75% eligibility rule. Please meet with your faculty advisor.
              </span>
            </div>
          )}

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Class Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-xs">
                      No attendance records for this course yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentRecords.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm font-medium">{r.classDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={r.status === "present" ? "default" : "destructive"}
                          className={r.status === "present" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : ""}
                        >
                          {r.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.remarks || "Regular"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
