"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseList, type CourseItem } from "@/module-2-academic/components/courses/CourseList";
import { TimetableSchedule } from "@/module-2-academic/components/timetable/TimetableSchedule";
import { AttendanceSheet } from "@/module-2-academic/components/attendance/AttendanceSheet";
import { MarksGradebook } from "@/module-2-academic/components/assessments/MarksGradebook";
import { BookOpen, Calendar, Clock, Award, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AcademicDashboard() {
  const { user, loading } = useAuth(["admin", "teacher", "student"]);
  const [activeTab, setActiveTab] = useState("courses");
  const [metrics, setMetrics] = useState<any>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const loadData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch courses
      const courseRes = await fetch("/api/academic/courses", { credentials: "include" });
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourses(courseData.data || []);
      }

      // 2. Fetch metrics
      const metRes = await fetch("/api/academic/metrics", { credentials: "include" });
      if (metRes.ok) {
        const metData = await metRes.json();
        setMetrics(metData.data);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Authenticating academic portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Academic Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-primary/10 text-primary border border-primary/20">
              Module 2
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Course catalogs, conflict-proof scheduling, attendance control, and gradebook security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admissions">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Admissions Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Role Notice */}
      <div className="bg-muted/40 rounded-lg p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Authenticated as <strong className="font-semibold">{user?.email}</strong> ({user?.role?.toUpperCase()})
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Faculty Class Isolation & Student Privacy Controls Active
        </div>
      </div>

      {/* Academic Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{metrics.activeCoursesCount}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {metrics.totalCoursesCount} total accredited
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Overall Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {metrics.overallAttendanceRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Institution aggregate</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Class Average Score
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono text-primary">
                {metrics.gradeStats?.averagePct || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Across recorded assessments</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Evaluated Students
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">
                {metrics.gradeStats?.totalStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Total grades logged</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="marks">Assessments & Marks</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <CourseList courses={courses} isAdmin={isAdmin} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="timetable">
          <TimetableSchedule courses={courses} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="attendance">
          {user && (
            <AttendanceSheet
              courses={courses}
              currentUser={{ userId: user.userId, role: user.role, email: user.email }}
            />
          )}
        </TabsContent>

        <TabsContent value="marks">
          {user && (
            <MarksGradebook
              courses={courses}
              currentUser={{ userId: user.userId, role: user.role, email: user.email }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
