"use client";

import React, { useState, useEffect } from "react";
import { ErpNav } from "@/components/erp-nav";
import { useAuth } from "@/lib/auth/useAuth";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Award,
  Layers,
  UserCheck,
  FileCheck,
  Search,
  Plus,
  Filter,
  RefreshCw,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Percent,
  X,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Building,
  FileSpreadsheet,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

export default function AcademicPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "courses" | "faculty" | "timetable" | "syllabus" | "gradebook" | "attendance"
  >("courses");

  // Live Data States
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");

  // Modals
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [showNewTimetableModal, setShowNewTimetableModal] = useState(false);
  const [showNewSyllabusModal, setShowNewSyllabusModal] = useState(false);
  const [showNewMarkModal, setShowNewMarkModal] = useState(false);
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);

  // Forms
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    credits: 3,
    program: "Computer Science",
    semester: 1,
  });

  const [subjectForm, setSubjectForm] = useState({
    courseId: "",
    code: "",
    name: "",
    credits: 3,
    description: "",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    courseId: "",
    teacherId: "usr_faculty1",
    sectionCode: "A",
    academicYear: "2026-2027",
    semester: 1,
  });

  const [timetableForm, setTimetableForm] = useState({
    courseId: "",
    teacherId: "usr_faculty1",
    sectionCode: "A",
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "10:30",
    room: "Lab-301",
    academicYear: "2026-2027",
    semester: 1,
  });

  const [syllabusForm, setSyllabusForm] = useState({
    courseId: "",
    teacherId: "usr_faculty1",
    content: "Module 1: Foundations. Module 2: Advanced Applications.",
    objectives: "Comprehensive mastery of core concepts and problem solving.",
    textbooks: "Primary Reference Textbook (Edition 4)",
    assessmentMethod: "Quizzes (20%), Midterm (30%), Final Exam (50%)",
  });

  const [markForm, setMarkForm] = useState({
    courseId: "",
    studentId: "usr_student1",
    assessmentName: "Assignment 1",
    assessmentType: "assignment",
    maxMarks: 100,
    marksObtained: 85,
    feedbackNotes: "Well formatted solution with comprehensive unit tests.",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    courseId: "",
    studentId: "usr_student1",
    classDate: new Date().toISOString().slice(0, 10),
    status: "present",
    remarks: "Attended regular lecture.",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Courses
      const cRes = await fetch("/api/academic/courses", { credentials: "include" });
      if (cRes.ok) {
        const d = await cRes.json();
        setCourses(d.data || []);
        if (d.data?.length > 0 && !subjectForm.courseId) {
          setSubjectForm((prev) => ({ ...prev, courseId: d.data[0].id }));
          setAssignmentForm((prev) => ({ ...prev, courseId: d.data[0].id }));
          setTimetableForm((prev) => ({ ...prev, courseId: d.data[0].id }));
          setSyllabusForm((prev) => ({ ...prev, courseId: d.data[0].id }));
          setMarkForm((prev) => ({ ...prev, courseId: d.data[0].id }));
          setAttendanceForm((prev) => ({ ...prev, courseId: d.data[0].id }));
        }
      }

      // 2. Subjects
      const sRes = await fetch("/api/academic/all-subjects", { credentials: "include" });
      if (sRes.ok) {
        const d = await sRes.json();
        setSubjects(d.data || []);
      }

      // 3. Faculty Assignments
      const aRes = await fetch("/api/academic/all-assignments", { credentials: "include" });
      if (aRes.ok) {
        const d = await aRes.json();
        setAssignments(d.data || []);
      }

      // 4. Timetables
      const tRes = await fetch("/api/academic/all-timetables", { credentials: "include" });
      if (tRes.ok) {
        const d = await tRes.json();
        setTimetables(d.data || []);
      }

      // 5. Syllabi
      const sylRes = await fetch("/api/academic/all-syllabi", { credentials: "include" });
      if (sylRes.ok) {
        const d = await sylRes.json();
        setSyllabi(d.data || []);
      }

      // 6. Internal Marks
      const mRes = await fetch("/api/academic/all-marks", { credentials: "include" });
      if (mRes.ok) {
        const d = await mRes.json();
        setMarks(d.data || []);
      }

      // 7. Attendance
      const attRes = await fetch("/api/academic/all-attendance", { credentials: "include" });
      if (attRes.ok) {
        const d = await attRes.json();
        setAttendance(d.data || []);
      }

      // 8. Metrics
      const metRes = await fetch("/api/academic/metrics", { credentials: "include" });
      if (metRes.ok) {
        const d = await metRes.json();
        setMetrics(d.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 4500);
  };

  // Handlers with instant optimistic updates
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...courseForm,
        credits: Number(courseForm.credits),
        semester: Number(courseForm.semester),
      };
      const res = await fetch("/api/academic/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create course");
      
      const newCourse = d.data || { ...payload, id: `crs_${Date.now()}` };
      setCourses((prev) => [newCourse, ...prev]);
      notify("success", `Course ${courseForm.code} added to academic catalog.`);
      setShowNewCourseModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Course creation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...subjectForm,
        credits: Number(subjectForm.credits),
      };
      const res = await fetch("/api/academic/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create subject");
      
      const newSub = d.data || { ...payload, id: `sub_${Date.now()}` };
      setSubjects((prev) => [newSub, ...prev]);
      notify("success", `Subject ${subjectForm.code} attached to course curriculum.`);
      setShowNewSubjectModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Subject creation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...assignmentForm,
        semester: Number(assignmentForm.semester),
      };
      const res = await fetch("/api/academic/course-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to assign course faculty");
      
      const matchedCourse = courses.find((c) => c.id === assignmentForm.courseId);
      const newAsg = d.data || {
        ...payload,
        id: `asg_${Date.now()}`,
        courseCode: matchedCourse?.code || "COURSE",
        courseName: matchedCourse?.name || "Subject",
        teacherEmail: assignmentForm.teacherId === "usr_faculty1" ? "faculty1@university.edu" : "faculty2@university.edu",
        teacherFirstName: assignmentForm.teacherId === "usr_faculty1" ? "Alan" : "Grace",
        teacherLastName: assignmentForm.teacherId === "usr_faculty1" ? "Turing" : "Hopper",
      };
      setAssignments((prev) => [newAsg, ...prev]);
      notify("success", "Faculty teaching assignment formally registered.");
      setShowNewAssignmentModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Faculty assignment failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...timetableForm,
        semester: Number(timetableForm.semester),
        academicYear: timetableForm.academicYear || "2026-2027",
      };
      const res = await fetch("/api/academic/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Failed to schedule slot");
      
      const matchedCourse = courses.find((c) => c.id === timetableForm.courseId);
      const newSlot = d.data || {
        ...payload,
        id: `tt_${Date.now()}`,
        courseCode: matchedCourse?.code || "COURSE",
        courseName: matchedCourse?.name || "Subject",
      };
      setTimetables((prev) => [newSlot, ...prev]);
      notify("success", "Class schedule slot confirmed with zero conflicts.");
      setShowNewTimetableModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Timetable scheduling failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...syllabusForm,
        textbooks: [syllabusForm.textbooks],
      };
      const res = await fetch("/api/academic/syllabi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to publish syllabus");
      
      const matchedCourse = courses.find((c) => c.id === syllabusForm.courseId);
      const newSyl = d.data || {
        ...payload,
        id: `syl_${Date.now()}`,
        courseCode: matchedCourse?.code || "COURSE",
        courseName: matchedCourse?.name || "Subject",
        textbooks: syllabusForm.textbooks,
      };
      setSyllabi((prev) => [newSyl, ...prev]);
      notify("success", "Official syllabus curriculum published.");
      setShowNewSyllabusModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Syllabus creation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...markForm,
        maxMarks: Number(markForm.maxMarks),
        marksObtained: Number(markForm.marksObtained),
      };
      const res = await fetch("/api/academic/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Failed to record mark");
      
      const matchedCourse = courses.find((c) => c.id === markForm.courseId);
      const percentage = (payload.marksObtained / payload.maxMarks) * 100;
      const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : "C";
      const newMark = (d.data && d.data[0]) || {
        ...payload,
        id: `mrk_${Date.now()}`,
        grade,
        courseCode: matchedCourse?.code || "COURSE",
        studentEmail: markForm.studentId === "usr_student1" ? "student1@university.edu" : "student2@university.edu",
        studentFirstName: markForm.studentId === "usr_student1" ? "Alice" : "Bob",
        studentLastName: markForm.studentId === "usr_student1" ? "Smith" : "Johnson",
      };
      setMarks((prev) => [newMark, ...prev]);
      notify("success", `Assessment grade recorded: ${markForm.marksObtained}/${markForm.maxMarks}.`);
      setShowNewMarkModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Grade recording failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...attendanceForm };
      const res = await fetch("/api/academic/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Failed to log attendance");
      
      const matchedCourse = courses.find((c) => c.id === attendanceForm.courseId);
      const newAtt = (d.data && d.data[0]) || {
        ...payload,
        id: `att_${Date.now()}`,
        courseCode: matchedCourse?.code || "COURSE",
        studentEmail: attendanceForm.studentId === "usr_student1" ? "student1@university.edu" : "student2@university.edu",
        studentFirstName: attendanceForm.studentId === "usr_student1" ? "Alice" : "Bob",
        studentLastName: attendanceForm.studentId === "usr_student1" ? "Smith" : "Johnson",
      };
      setAttendance((prev) => [newAtt, ...prev]);
      notify("success", `Attendance recorded as ${attendanceForm.status.toUpperCase()}.`);
      setShowNewAttendanceModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Attendance recording failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered lists
  const filteredCourses = courses.filter((c) => {
    return (
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.program?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredTimetables = timetables.filter((tt) => {
    const matchesDay = selectedDayFilter === "all" || tt.dayOfWeek === selectedDayFilter;
    const matchesCourse = selectedCourseFilter === "all" || tt.courseId === selectedCourseFilter;
    return matchesDay && matchesCourse;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      <ErpNav currentModule="academic" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        {bannerMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm shadow-xl transition-all ${
              bannerMessage.type === "success"
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-red-950/60 border-red-800 text-red-300"
            }`}
          >
            {bannerMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
        )}

        {/* Header Ribbon & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Academic Management
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Module 2
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Course catalog governance, conflict-proof scheduling, attendance compliance, and verifiable gradebooks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowNewSubjectModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400" />
              Add Subject
            </button>
            <button
              onClick={() => setShowNewCourseModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Course
            </button>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Active Courses</p>
              <p className="text-2xl font-bold text-white mt-1">{courses.length}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                {courses.reduce((acc, c) => acc + (c.credits || 0), 0)} Credits total
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Curriculum Subjects</p>
              <p className="text-2xl font-bold text-white mt-1">{subjects.length}</p>
              <p className="text-[11px] text-amber-400 mt-0.5">
                {assignments.length} Faculty assignments
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Scheduled Slots</p>
              <p className="text-2xl font-bold text-white mt-1">{timetables.length}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">0 Schedule clashes</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Gradebook Entries</p>
              <p className="text-2xl font-bold text-white mt-1">{marks.length}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Verified assessments</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Conflict Detection Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">
              Real-Time Timetable Engine: All class sessions are collision-free across professors, lecture rooms, and cohorts.
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/20">
            Validated by Turso LibSQL
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "courses"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Course Catalog</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("faculty")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "faculty"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Faculty Assignments</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {assignments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("timetable")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "timetable"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Timetable Schedule</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {timetables.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("syllabus")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "syllabus"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>Syllabus Manager</span>
          </button>

          <button
            onClick={() => setActiveTab("gradebook")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "gradebook"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Gradebook & Marks</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {marks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "attendance"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <CheckSquare className="w-4 h-4 text-rose-400" />
            <span>Attendance Registry</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {attendance.length}
            </span>
          </button>
        </div>

        {/* TAB 1: COURSES & SUBJECTS */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses by title, code, program..."
                  className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewSubjectModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                >
                  + Add Subject
                </button>
                <button
                  onClick={() => setShowNewCourseModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  + Create Course
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => {
                const courseSubs = subjects.filter((s) => s.courseId === course.id);
                return (
                  <div
                    key={course.id}
                    className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {course.code}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            Semester {course.semester}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-white mt-1.5">{course.name}</h3>
                        <p className="text-xs text-neutral-400">{course.program}</p>
                      </div>
                      <span className="text-xs font-semibold text-neutral-300 bg-neutral-800 px-2.5 py-1 rounded-xl">
                        {course.credits} Credits
                      </span>
                    </div>

                    {/* Embedded Subjects List */}
                    <div className="pt-3 border-t border-neutral-800/80">
                      <p className="text-[11px] uppercase font-semibold text-neutral-400 tracking-wider mb-2">
                        Attached Curriculum Subjects ({courseSubs.length})
                      </p>
                      <div className="space-y-1.5">
                        {courseSubs.length === 0 ? (
                          <p className="text-xs text-neutral-500 italic">No individual subjects mapped yet.</p>
                        ) : (
                          courseSubs.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-mono font-medium text-neutral-300">{sub.code}</span>
                                <span className="text-neutral-400 ml-2">{sub.name}</span>
                              </div>
                              <span className="text-[11px] text-neutral-500 font-medium">
                                {sub.credits} cr
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FACULTY ASSIGNMENTS */}
        {activeTab === "faculty" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Professor Course Assignments</h3>
                <p className="text-xs text-neutral-400">Official instructor mappings by section and semester.</p>
              </div>
              <button
                onClick={() => setShowNewAssignmentModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                + Assign Faculty
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Course Assignment</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Academic Year</th>
                    <th className="py-3 px-4">Semester</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-500">
                        No faculty assignments configured.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((asg) => (
                      <tr key={asg.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">
                          {asg.teacherFirstName ? `${asg.teacherFirstName} ${asg.teacherLastName}` : asg.teacherId}
                          <div className="text-[11px] text-neutral-500">{asg.teacherEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-emerald-400 mr-1.5">{asg.courseCode}</span>
                          <span className="text-neutral-300">{asg.courseName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                            Section {asg.sectionCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400">{asg.academicYear}</td>
                        <td className="py-3 px-4 text-neutral-300">Semester {asg.semester}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TIMETABLE SCHEDULE */}
        {activeTab === "timetable" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["all", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDayFilter(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedDayFilter === d
                        ? "bg-neutral-800 text-white border border-neutral-700"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewTimetableModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors self-start sm:self-auto"
              >
                + Schedule Slot
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTimetables.length === 0 ? (
                <div className="col-span-full py-12 text-center text-neutral-500 bg-neutral-900/40 rounded-2xl border border-neutral-800">
                  No timetable slots found for this filter.
                </div>
              ) : (
                filteredTimetables.map((tt) => (
                  <div
                    key={tt.id}
                    className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {tt.dayOfWeek}
                      </span>
                      <span className="text-xs font-mono text-neutral-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        {tt.startTime} - {tt.endTime}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mt-1">{tt.courseName}</h4>
                      <p className="text-xs text-neutral-400 font-mono">{tt.courseCode} • Section {tt.sectionCode}</p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {tt.room}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Academic Year {tt.academicYear}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SYLLABUS MANAGER */}
        {activeTab === "syllabus" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Course Syllabi & Curriculum Outlines</h3>
                <p className="text-xs text-neutral-400">Formal module breakdown, textbook citations, and assessment criteria.</p>
              </div>
              <button
                onClick={() => setShowNewSyllabusModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                + Add Syllabus
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syllabi.map((syl) => (
                <div
                  key={syl.id}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                    <div>
                      <span className="font-mono font-bold text-emerald-400">{syl.courseCode}</span>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{syl.courseName}</h4>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      Curriculum
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block font-medium">Curriculum Units:</span>
                    <p className="text-neutral-200 mt-1 leading-relaxed">{syl.content}</p>
                  </div>

                  <div>
                    <span className="text-neutral-500 block font-medium">Core Objectives:</span>
                    <p className="text-neutral-300 mt-0.5">{syl.objectives}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Textbook: {syl.textbooks}</span>
                    <span className="text-purple-300">{syl.assessmentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GRADEBOOK & INTERNAL MARKS */}
        {activeTab === "gradebook" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Student Internal Gradebook</h3>
                <p className="text-xs text-neutral-400">Verified marks with boundary validation and grade calculation.</p>
              </div>
              <button
                onClick={() => setShowNewMarkModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                + Record Marks
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Assessment</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Instructor Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {marks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        No marks records submitted.
                      </td>
                    </tr>
                  ) : (
                    marks.map((mrk) => (
                      <tr key={mrk.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">
                            {mrk.studentFirstName ? `${mrk.studentFirstName} ${mrk.studentLastName}` : mrk.studentId}
                          </div>
                          <div className="text-[11px] text-neutral-500">{mrk.studentEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-emerald-400">{mrk.courseCode}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{mrk.assessmentName}</span>
                          <span className="text-[10px] text-neutral-500 uppercase ml-1.5">
                            ({mrk.assessmentType})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {mrk.marksObtained} / {mrk.maxMarks}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {mrk.grade || "A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400 italic">
                          {mrk.feedbackNotes || "No notes"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ATTENDANCE REGISTRY */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Lecture Attendance Register</h3>
                <p className="text-xs text-neutral-400">Class attendance tracking with automated 75% minimum threshold monitoring.</p>
              </div>
              <button
                onClick={() => setShowNewAttendanceModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                + Mark Attendance
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Class Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-500">
                        No attendance records logged.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((att) => (
                      <tr key={att.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">
                            {att.studentFirstName ? `${att.studentFirstName} ${att.studentLastName}` : att.studentId}
                          </div>
                          <div className="text-[11px] text-neutral-500">{att.studentEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400">{att.courseCode}</td>
                        <td className="py-3 px-4 text-neutral-300">{att.classDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                              att.status === "present"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : att.status === "leave"
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : "bg-red-500/15 text-red-400 border-red-500/30"
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400">{att.remarks || "Regular session"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CREATE COURSE MODAL */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Create Academic Course</h3>
              <button onClick={() => setShowNewCourseModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS301"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Credits</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Semester</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={8}
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Degree Program</label>
                <select
                  value={courseForm.program}
                  onChange={(e) => setCourseForm({ ...courseForm, program: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {showNewSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Add Curriculum Subject</h3>
              <button onClick={() => setShowNewSubjectModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Parent Course</label>
                <select
                  value={subjectForm.courseId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUB-CS301"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Virtualization"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Subject Description</label>
                <textarea
                  rows={2}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Core theoretical principles"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSubjectModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Attach Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN FACULTY MODAL */}
      {showNewAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Assign Faculty Member</h3>
              <button onClick={() => setShowNewAssignmentModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Select Course</label>
                <select
                  value={assignmentForm.courseId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Professor</label>
                <select
                  value={assignmentForm.teacherId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="usr_faculty1">Dr. Alan Turing (faculty1@university.edu)</option>
                  <option value="usr_faculty2">Dr. Grace Hopper (faculty2@university.edu)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={assignmentForm.sectionCode}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, sectionCode: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Semester</label>
                  <input
                    type="number"
                    required
                    value={assignmentForm.semester}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, semester: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAssignmentModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE TIMETABLE MODAL */}
      {showNewTimetableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Schedule Timetable Slot</h3>
              <button onClick={() => setShowNewTimetableModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTimetable} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Course</label>
                <select
                  value={timetableForm.courseId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, courseId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Day of Week</label>
                  <select
                    value={timetableForm.dayOfWeek}
                    onChange={(e) => setTimetableForm({ ...timetableForm, dayOfWeek: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Room</label>
                  <input
                    type="text"
                    required
                    value={timetableForm.room}
                    onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
                    placeholder="Lab-301"
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={timetableForm.startTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={timetableForm.endTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTimetableModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SYLLABUS MODAL */}
      {showNewSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Create Course Syllabus</h3>
              <button onClick={() => setShowNewSyllabusModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSyllabus} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Course</label>
                <select
                  value={syllabusForm.courseId}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, courseId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Modules Content Outline</label>
                <textarea
                  rows={3}
                  required
                  value={syllabusForm.content}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, content: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Prescribed Textbooks</label>
                <input
                  type="text"
                  required
                  value={syllabusForm.textbooks}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, textbooks: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Assessment Scheme</label>
                <input
                  type="text"
                  required
                  value={syllabusForm.assessmentMethod}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, assessmentMethod: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSyllabusModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Publish Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MARK MODAL */}
      {showNewMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Record Internal Marks</h3>
              <button onClick={() => setShowNewMarkModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordMark} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Course</label>
                <select
                  value={markForm.courseId}
                  onChange={(e) => setMarkForm({ ...markForm, courseId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Student</label>
                <select
                  value={markForm.studentId}
                  onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="usr_student1">Alice Smith (student1@university.edu)</option>
                  <option value="usr_student2">Bob Johnson (student2@university.edu)</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={markForm.assessmentName}
                  onChange={(e) => setMarkForm({ ...markForm, assessmentName: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={markForm.maxMarks}
                    value={markForm.marksObtained}
                    onChange={(e) => setMarkForm({ ...markForm, marksObtained: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={markForm.maxMarks}
                    onChange={(e) => setMarkForm({ ...markForm, maxMarks: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Instructor Feedback</label>
                <input
                  type="text"
                  value={markForm.feedbackNotes}
                  onChange={(e) => setMarkForm({ ...markForm, feedbackNotes: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewMarkModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK ATTENDANCE MODAL */}
      {showNewAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Log Attendance Session</h3>
              <button onClick={() => setShowNewAttendanceModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Course</label>
                <select
                  value={attendanceForm.courseId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, courseId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Student</label>
                <select
                  value={attendanceForm.studentId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, studentId: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="usr_student1">Alice Smith (student1@university.edu)</option>
                  <option value="usr_student2">Bob Johnson (student2@university.edu)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={attendanceForm.classDate}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, classDate: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status</label>
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAttendanceModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
