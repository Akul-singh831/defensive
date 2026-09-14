"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, CalendarCheck, ShieldCheck } from "lucide-react";

export interface TimetableSlot {
  id: string;
  courseId: string;
  teacherId: string;
  sectionCode: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  academicYear: string;
  semester: number;
}

interface TimetableScheduleProps {
  courses: Array<{ id: string; code: string; name: string }>;
  isAdmin: boolean;
}

export function TimetableSchedule({ courses, isAdmin }: TimetableScheduleProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || "");
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New slot form
  const [form, setForm] = useState({
    courseId: courses[0]?.id || "",
    teacherId: "teacher-1",
    sectionCode: "A",
    dayOfWeek: "Monday" as const,
    startTime: "09:00",
    endTime: "10:30",
    room: "Lab-301",
    academicYear: "2026-2027",
    semester: 1,
  });

  const fetchSlots = useCallback(async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/academic/timetable/${selectedCourse}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSlots(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
      setForm((f) => ({ ...f, courseId: courses[0].id }));
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    setConflictError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/academic/create-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setConflictError(data.message || data.error || "Timetable collision detected");
        } else {
          setConflictError(data.error || "Failed to schedule slot");
        }
        return;
      }

      setSuccessMsg("Class session successfully scheduled. Verified collision-free.");
      fetchSlots();
    } finally {
      setScheduling(false);
    }
  };

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Master Timetable & Conflict Defense</h2>
          <p className="text-xs text-muted-foreground">
            Server-side collision verification prevents faculty double-booking, classroom overlap, and section clash.
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

      {isAdmin && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Schedule Class Session</CardTitle>
            <CardDescription>
              Any attempt to double-book instructor, room, or section will be blocked by server-side validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conflictError && (
              <div className="mb-4 p-3.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold">Security Alert (Conflict Defense):</strong> {conflictError}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSchedule} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slotCourse">Target Course</Label>
                <Select
                  value={form.courseId}
                  onValueChange={(val) => { if (val) setForm({ ...form, courseId: val }); }}
                >
                  <SelectTrigger id="slotCourse">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slotDay">Day of Week</Label>
                <Select
                  value={form.dayOfWeek}
                  onValueChange={(val: any) => setForm({ ...form, dayOfWeek: val })}
                >
                  <SelectTrigger id="slotDay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="startTime">Start Time (HH:MM)</Label>
                <Input
                  id="startTime"
                  placeholder="09:00"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime">End Time (HH:MM)</Label>
                <Input
                  id="endTime"
                  placeholder="10:30"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slotRoom">Classroom / Hall</Label>
                <Input
                  id="slotRoom"
                  placeholder="Room 304"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slotTeacher">Instructor User ID</Label>
                <Input
                  id="slotTeacher"
                  placeholder="teacher-1"
                  value={form.teacherId}
                  onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slotSection">Section Code</Label>
                <Input
                  id="slotSection"
                  placeholder="A"
                  value={form.sectionCode}
                  onChange={(e) => setForm({ ...form, sectionCode: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" size="sm" className="w-full" disabled={scheduling}>
                  {scheduling ? "Verifying..." : "Add Session Slot"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.dayOfWeek === day);
          return (
            <div key={day} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold text-sm">{day}</h3>
                <span className="text-xs text-muted-foreground">{daySlots.length} sessions</span>
              </div>

              {daySlots.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground italic">No sessions</div>
              ) : (
                daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-2.5 rounded-md bg-muted/60 border text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span>Section {slot.sectionCode}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {slot.room}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      Faculty: {slot.teacherId}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
