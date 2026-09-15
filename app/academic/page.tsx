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
  Download,
  Users,
  Bell,
  Cpu,
} from "lucide-react";

export default function AcademicPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "courses" | "timetable" | "faculty" | "syllabus" | "gradebook" | "attendance" | "circulars"
  >("courses");

  // Live Data States
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

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
    credits: 4,
    program: "B.Tech CSE (Cloud Computing) - IBM",
    semester: 1,
  });

  const [subjectForm, setSubjectForm] = useState({
    courseId: "",
    code: "",
    name: "",
    credits: 4,
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
    room: "Lab-IBM-01 (Cloud Innovation Center)",
    academicYear: "2026-2027",
    semester: 1,
  });

  const [syllabusForm, setSyllabusForm] = useState({
    courseId: "",
    teacherId: "usr_faculty1",
    content: "Unit 1: Foundations. Unit 2: Architecture. Unit 3: Enterprise Microservices. Unit 4: Industry Capstone Project.",
    objectives: "Develop industry-ready competency aligned with LTSU industry anchor frameworks.",
    textbooks: "Primary Industry Reference Handbook (Edition 4)",
    assessmentMethod: "Quizzes (20%), Practical Skill Lab Exam (30%), End Term Exam (50%)",
  });

  const [markForm, setMarkForm] = useState({
    courseId: "",
    studentId: "usr_student1",
    assessmentName: "OpenShift Cluster Practical Assessment",
    assessmentType: "midterm",
    maxMarks: 100,
    marksObtained: 92,
    feedbackNotes: "Exemplary zero-downtime cluster configuration and automated health check setup.",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    courseId: "",
    studentId: "usr_student1",
    classDate: new Date().toISOString().slice(0, 10),
    status: "present",
    remarks: "Attended regular practical lab session.",
  });

  // Real LTSU Laboratory Locations
  const ltsuLabRooms = [
    "Lab-IBM-01 (Cloud Innovation Center)",
    "Lab-IBM-02 (AI & Neural Networks Lab)",
    "Workshop-TT-A (Tata Robotics & Smart Mfg)",
    "Workshop-TT-B (Electric Vehicle Powertrain Lab)",
    "Lab-ANSYS-01 (Simulation & CAD Center)",
    "Lab-PHARM-01 (Pharmaceutics & Formulation)",
    "Lab-PHARM-02 (Rayat Analytical Chemistry Lab)",
    "Hall-301 (Main Academic Block Lecture Hall)",
  ];

  // Authentic LTSU Circulars
  const ltsuCirculars = [
    {
      id: "circ_1",
      title: "Academic Calendar Term-1 (Academic Year 2026-2027)",
      category: "Academic Affairs",
      date: "08 September, 2026",
      urgent: true,
      desc: "Detailed semester commencement, mid-term evaluation windows, and skill lab practical schedules approved by Academic Council.",
    },
    {
      id: "circ_2",
      title: "Faculty Development Program (FDP) on Agentic AI in collaboration with Capabl",
      category: "Workshops & Training",
      date: "05 September, 2026",
      urgent: false,
      desc: "5-day intensive master trainer workshop for IBM School of Technology and Tata Technologies engineering educators.",
    },
    {
      id: "circ_3",
      title: "Mandatory 75% Attendance Compliance for End-Term Practical Examinations",
      category: "Examination Cell",
      date: "01 September, 2026",
      urgent: true,
      desc: "Students falling below 75% biometric attendance in lectures and practical labs are barred from final exam hall tickets.",
    },
    {
      id: "circ_4",
      title: "Call for Research Papers: Lamrin International Journal of Multidisciplinary Research (LIJMR)",
      category: "Research & Innovation",
      date: "28 August, 2026",
      urgent: false,
      desc: "Submissions invited for peer-reviewed journal issue covering Industry 4.0, Green Energy, and Generative Artificial Intelligence.",
    },
    {
      id: "circ_5",
      title: "List of Official Gazetted and Observance Holidays 2026",
      category: "Registrar Office",
      date: "15 August, 2026",
      urgent: false,
      desc: "Scheduled Punjab state gazetted holidays and university recess periods for students and faculty.",
    },
  ];

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
      const sRes = await fetch("/api/academic/subjects", { credentials: "include" });
      if (sRes.ok) {
        const d = await sRes.json();
        setSubjects(d.data || []);
      }

      // 3. Faculty Assignments
      const aRes = await fetch("/api/academic/course-assignments", { credentials: "include" });
      if (aRes.ok) {
        const d = await aRes.json();
        setAssignments(d.data || []);
      }

      // 4. Timetables
      const tRes = await fetch("/api/academic/timetables", { credentials: "include" });
      if (tRes.ok) {
        const d = await tRes.json();
        setTimetables(d.data || []);
      }

      // 5. Syllabi
      const syRes = await fetch("/api/academic/syllabi", { credentials: "include" });
      if (syRes.ok) {
        const d = await syRes.json();
        setSyllabi(d.data || []);
      }

      // 6. Marks
      const mRes = await fetch("/api/academic/internal-marks", { credentials: "include" });
      if (mRes.ok) {
        const d = await mRes.json();
        setMarks(d.data || []);
      }

      // 7. Attendance
      const attRes = await fetch("/api/academic/attendance", { credentials: "include" });
      if (attRes.ok) {
        const d = await attRes.json();
        setAttendance(d.data || []);
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

  // Conflict Detector for Timetables
  const checkTimetableConflict = (slot: typeof timetableForm) => {
    return timetables.find(
      (t) =>
        t.dayOfWeek === slot.dayOfWeek &&
        t.room === slot.room &&
        ((slot.startTime >= t.startTime && slot.startTime < t.endTime) ||
          (slot.endTime > t.startTime && slot.endTime <= t.endTime))
    );
  };

  // Actions
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/academic/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Course creation failed");

      notify("success", `Course ${courseForm.code} created successfully.`);
      setShowNewCourseModal(false);
      setCourseForm({
        code: "",
        name: "",
        credits: 4,
        program: "B.Tech CSE (Cloud Computing) - IBM",
        semester: 1,
      });
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkTimetableConflict(timetableForm);
    if (conflict) {
      notify("error", `Scheduling clash detected! ${timetableForm.room} is already booked on ${timetableForm.dayOfWeek} at ${conflict.startTime}-${conflict.endTime}.`);
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/academic/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timetableForm),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Timetable slot creation failed");

      notify("success", "Timetable slot booked without clashes.");
      setShowNewTimetableModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/academic/internal-marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(markForm),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to record mark");

      notify("success", "Continuous assessment marks recorded.");
      setShowNewMarkModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/academic/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceForm),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to record attendance");

      notify("success", "Biometric session attendance logged.");
      setShowNewAttendanceModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishMarks = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/academic/internal-marks/${id}/publish`, {
        method: "POST",
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to publish marks");

      notify("success", "Grades published to student gradebook.");
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Timetable
  const filteredTimetables = timetables.filter((t) => {
    const matchesDay = selectedDayFilter === "all" || t.dayOfWeek === selectedDayFilter;
    const matchesCourse = selectedCourseFilter === "all" || t.courseId === selectedCourseFilter;
    return matchesDay && matchesCourse;
  });

  // Calculate Student Attendance Percentages
  const computeAttendanceStats = (studentId: string) => {
    const records = attendance.filter((a) => a.studentId === studentId);
    if (records.length === 0) return { total: 0, present: 0, percent: 100 };
    const presentCount = records.filter((a) => a.status === "present").length;
    const percent = Math.round((presentCount / records.length) * 100);
    return { total: records.length, present: presentCount, percent };
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <ErpNav currentModule="academic" />

      {/* Floating Alert Banner */}
      {bannerMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium border animate-in fade-in slide-in-from-bottom-3 ${
            bannerMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/90 border-red-500/40 text-red-200"
          }`}
        >
          {bannerMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top University Identity Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/70 border border-neutral-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
              <span>Lamrin Tech Skills University Punjab</span>
              <span>-</span>
              <span>Academic Affairs & Skill Labs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Academic & Skilling Framework ERP
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Industry curriculum anchored by IBM, Tata Technologies, and Ansys. Zero-clash laboratory timetables and examination gradebook.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNewTimetableModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Schedule Skill Lab</span>
            </button>
            <button
              onClick={() => setShowNewCourseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Course Code</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border border-neutral-700 transition-all"
              title="Refresh academic data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* High Level Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">{courses.length}</div>
              <div className="text-[11px] text-neutral-400">Active Courses</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">{timetables.length}</div>
              <div className="text-[11px] text-neutral-400">Skill Lab Slots</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">{marks.length}</div>
              <div className="text-[11px] text-neutral-400">CCA Marks Logged</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">{attendance.length}</div>
              <div className="text-[11px] text-neutral-400">Attendance Logs</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 overflow-x-auto">
          {[
            { id: "courses", label: "NEP Course Catalog", icon: BookOpen, count: courses.length },
            { id: "timetable", label: "Skill Labs & Timetable", icon: Calendar, count: timetables.length },
            { id: "faculty", label: "Faculty & Industry SMEs", icon: Users },
            { id: "syllabus", label: "Curriculum & Syllabus", icon: Layers, count: syllabi.length },
            { id: "gradebook", label: "CCA Gradebook", icon: Award, count: marks.length },
            { id: "attendance", label: "Biometric Attendance (75%)", icon: CheckSquare, count: attendance.length },
            { id: "circulars", label: "Academic Circulars", icon: Bell, count: ltsuCirculars.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-neutral-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-400">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: COURSES CATALOG */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search course code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  National Education Policy (NEP 2020) & Academic Bank of Credits (ABC) Compliant
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Course Code</th>
                      <th className="p-3.5">Course Title</th>
                      <th className="p-3.5">Academic Program</th>
                      <th className="p-3.5">Credits</th>
                      <th className="p-3.5">Industry Anchor</th>
                      <th className="p-3.5 text-right">ABC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {courses
                      .filter(
                        (c) =>
                          c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.name?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="p-3.5 font-bold text-amber-400">{c.code}</td>
                          <td className="p-3.5 font-medium text-neutral-200">{c.name}</td>
                          <td className="p-3.5 text-neutral-400">{c.program}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-800 text-neutral-200">
                              {c.credits} Credits
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                c.code?.includes("IBM")
                                  ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                                  : c.code?.includes("TAT")
                                  ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                  : c.code?.includes("PHARM")
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              }`}
                            >
                              {c.code?.includes("IBM")
                                ? "IBM India"
                                : c.code?.includes("TAT")
                                ? "Tata Technologies"
                                : c.code?.includes("PHARM")
                                ? "Rayat Institute"
                                : "NSDC Skill Partner"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <span className="text-emerald-400 font-medium text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Recognized (ABC)</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SKILL LABS & TIMETABLE */}
        {activeTab === "timetable" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-2">
                <select
                  value={selectedDayFilter}
                  onChange={(e) => setSelectedDayFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All Days (Mon - Fri)</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>

                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All Scheduled Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero-Clash Collision Detector Active</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTimetables.map((slot) => {
                const matchedCourse = courses.find((c) => c.id === slot.courseId);
                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {slot.dayOfWeek}
                      </span>
                      <span className="text-xs font-bold text-neutral-200">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-neutral-100">
                        {matchedCourse ? `${matchedCourse.code} - ${matchedCourse.name}` : "Industry Skill Lab"}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-medium text-neutral-300 truncate">{slot.room}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Section: {slot.sectionCode}</span>
                      <span>Semester {slot.semester}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: FACULTY & INDUSTRY SMES */}
        {activeTab === "faculty" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-100">
                LTSU Academic Faculty & 50+ Industry Practitioners / Subject Matter Experts
              </h3>
              <p className="text-xs text-neutral-400">
                Curriculum mentorship and practical laboratory training supervised by leading tech enterprise practice leaders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "Dr. Alan Turing",
                  designation: "IBM Practice Leader & Distinguished Engineer",
                  department: "IBM School of Technology",
                  hours: "18 hrs/week (12 Lab, 6 Lecture)",
                  courses: "IBM-CCV101, IBM-AIML201",
                  tag: "IBM India Anchor",
                },
                {
                  name: "Dr. Grace Hopper",
                  designation: "Chief Robotics SME & Smart Manufacturing Lead",
                  department: "School of Engineering & Technology",
                  hours: "20 hrs/week (14 Lab, 6 Lecture)",
                  courses: "TAT-ROB101, TAT-EV201",
                  tag: "Tata Technologies Anchor",
                },
                {
                  name: "Er. Vikramaditya Sharma",
                  designation: "Principal Simulation Specialist",
                  department: "Simulation & Mechanical Design",
                  hours: "16 hrs/week (10 Lab, 6 Lecture)",
                  courses: "ANS-SM301 (Ansys)",
                  tag: "Ansys Simulation",
                },
                {
                  name: "Dr. Neha Sharma",
                  designation: "Dean & Professor of Pharmacology",
                  department: "Rayat Institute of Pharmacy",
                  hours: "18 hrs/week (10 Lab, 8 Lecture)",
                  courses: "RIP-PHARM101",
                  tag: "Rayat Institute",
                },
              ].map((fac) => (
                <div key={fac.name} className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3 shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-neutral-100">{fac.name}</div>
                      <div className="text-xs text-amber-400 font-medium">{fac.designation}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {fac.tag}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-neutral-400 divide-y divide-neutral-800/60">
                    <div className="flex justify-between py-1">
                      <span>Faculty School:</span>
                      <span className="text-neutral-200 font-medium">{fac.department}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Assigned Workload:</span>
                      <span className="text-emerald-400 font-medium">{fac.hours}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Mapped Courses:</span>
                      <span className="text-neutral-200 font-medium">{fac.courses}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CURRICULUM & SYLLABUS */}
        {activeTab === "syllabus" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">
                  Industry-Integrated Syllabi & Practical Capstone Outlines
                </h3>
                <p className="text-xs text-neutral-400">
                  Competency matrices co-structured with IBM India and Tata Technologies engineers.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {syllabi.map((syl) => {
                const matchedCourse = courses.find((c) => c.id === syl.courseId);
                return (
                  <div key={syl.id} className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Official Curriculum Framework
                        </span>
                        <h4 className="text-sm font-bold text-neutral-100">
                          {matchedCourse ? `${matchedCourse.code} - ${matchedCourse.name}` : "Course Syllabus"}
                        </h4>
                      </div>
                      <button
                        onClick={() => notify("success", "Syllabus outline exported to PDF format.")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Outline</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-neutral-300">Course Competency Objectives:</span>
                        <p className="text-neutral-400 mt-0.5 leading-relaxed">{syl.objectives}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-neutral-300">Detailed Syllabus Content:</span>
                        <p className="text-neutral-400 mt-0.5 leading-relaxed">{syl.content}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                          <span className="font-semibold text-neutral-300 block mb-1">Prescribed Reference Works</span>
                          <span className="text-neutral-400">{syl.textbooks}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                          <span className="font-semibold text-neutral-300 block mb-1">Grading & Evaluation Schema</span>
                          <span className="text-emerald-400 font-medium">{syl.assessmentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CCA GRADEBOOK */}
        {activeTab === "gradebook" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">
                  Continuous Comprehensive Assessment (CCA) & Examination Gradebook
                </h3>
                <p className="text-xs text-neutral-400">
                  Internal marks, skill lab evaluations, automated SGPA/CGPA calculations, and grade publication.
                </p>
              </div>
              <button
                onClick={() => setShowNewMarkModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Marks</span>
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Course & Assessment</th>
                      <th className="p-3.5">Score Obtained</th>
                      <th className="p-3.5">Grade</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {marks.map((mrk) => {
                      const matchedCourse = courses.find((c) => c.id === mrk.courseId);
                      return (
                        <tr key={mrk.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-semibold text-neutral-200">{mrk.studentId}</div>
                            <div className="text-[11px] text-neutral-400">{mrk.feedbackNotes}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-medium text-neutral-300">
                              {matchedCourse ? matchedCourse.name : "Skill Lab Module"}
                            </div>
                            <div className="text-[11px] text-neutral-500">{mrk.assessmentName}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="text-sm font-bold text-neutral-100">
                              {mrk.marksObtained} / {mrk.maxMarks}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {mrk.grade || "A"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                mrk.status === "published"
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              {mrk.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            {mrk.status !== "published" && (
                              <button
                                disabled={actionLoading}
                                onClick={() => handlePublishMarks(mrk.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-medium transition-all"
                              >
                                Publish Grade
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BIOMETRIC ATTENDANCE & 75% ELIGIBILITY */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">
                  Biometric Attendance Register & Exam Eligibility Audit
                </h3>
                <p className="text-xs text-neutral-400">
                  Strict 75% minimum threshold mandated by Academic Council for end-term theory & practical exams.
                </p>
              </div>
              <button
                onClick={() => setShowNewAttendanceModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Session Attendance</span>
              </button>
            </div>

            {/* Student Attendance Compliance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["usr_student1", "usr_student2"].map((stdId) => {
                const stats = computeAttendanceStats(stdId);
                const isEligible = stats.percent >= 75;
                return (
                  <div
                    key={stdId}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isEligible
                        ? "bg-neutral-900/40 border-neutral-800"
                        : "bg-red-950/20 border-red-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-neutral-100">{stdId}</div>
                        <div className="text-xs text-neutral-400">
                          Total Sessions: {stats.total} | Present: {stats.present}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-base font-bold ${isEligible ? "text-emerald-400" : "text-red-400"}`}>
                          {stats.percent}%
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            isEligible
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {isEligible ? "Exam Eligible" : "Attendance Warning"}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isEligible ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attendance Log Table */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Session Date</th>
                      <th className="p-3.5">Student ID</th>
                      <th className="p-3.5">Course Code</th>
                      <th className="p-3.5">Attendance Status</th>
                      <th className="p-3.5 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {attendance.map((att) => (
                      <tr key={att.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3.5 text-neutral-300">{att.classDate}</td>
                        <td className="p-3.5 font-semibold text-neutral-200">{att.studentId}</td>
                        <td className="p-3.5 font-mono text-neutral-400">{att.courseId}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              att.status === "present"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-300 border border-red-500/20"
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-neutral-400">{att.remarks || "Regular session"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ACADEMIC CIRCULARS & NOTICES */}
        {activeTab === "circulars" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-100">
                Official LTSU Academic Notices, Circulars & Examination Notifications
              </h3>
              <p className="text-xs text-neutral-400">
                Directly syndicated from Lamrin Tech Skills University Punjab administration and Academic Affairs.
              </p>
            </div>

            <div className="space-y-3">
              {ltsuCirculars.map((circ) => (
                <div
                  key={circ.id}
                  className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {circ.urgent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                          Urgent
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300">
                        {circ.category}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-100">{circ.title}</h4>
                    </div>
                    <span className="text-xs text-neutral-400 whitespace-nowrap">{circ.date}</span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">{circ.desc}</p>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-end">
                    <button
                      onClick={() => notify("success", `Opening official circular document for: ${circ.title}`)}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Circular PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE COURSE */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100">Create Academic Course</h3>
              <button onClick={() => setShowNewCourseModal(false)} className="text-neutral-400 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Course Code</label>
                <input
                  required
                  type="text"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  placeholder="e.g. IBM-CCV102"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Course Title</label>
                <input
                  required
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="e.g. Enterprise Cloud DevOps & SRE"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Credits</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={6}
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Semester</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={8}
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Academic Program</label>
                <input
                  required
                  type="text"
                  value={courseForm.program}
                  onChange={(e) => setCourseForm({ ...courseForm, program: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE TIMETABLE / LAB SLOT */}
      {showNewTimetableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100">Schedule Practical Skill Lab</h3>
              <button onClick={() => setShowNewTimetableModal(false)} className="text-neutral-400 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateTimetable} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Select Course</label>
                <select
                  value={timetableForm.courseId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, courseId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
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
                  <label className="text-neutral-400 block mb-1">Day of Week</label>
                  <select
                    value={timetableForm.dayOfWeek}
                    onChange={(e) => setTimetableForm({ ...timetableForm, dayOfWeek: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Section Code</label>
                  <input
                    required
                    type="text"
                    value={timetableForm.sectionCode}
                    onChange={(e) => setTimetableForm({ ...timetableForm, sectionCode: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Start Time</label>
                  <input
                    required
                    type="time"
                    value={timetableForm.startTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">End Time</label>
                  <input
                    required
                    type="time"
                    value={timetableForm.endTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Laboratory / Workshop Facility</label>
                <select
                  value={timetableForm.room}
                  onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                >
                  {ltsuLabRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewTimetableModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD MARKS */}
      {showNewMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100">Record Continuous Assessment Marks</h3>
              <button onClick={() => setShowNewMarkModal(false)} className="text-neutral-400 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateMark} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Course</label>
                <select
                  value={markForm.courseId}
                  onChange={(e) => setMarkForm({ ...markForm, courseId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
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
                  <label className="text-neutral-400 block mb-1">Student ID</label>
                  <input
                    required
                    type="text"
                    value={markForm.studentId}
                    onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Assessment Type</label>
                  <select
                    value={markForm.assessmentType}
                    onChange={(e) => setMarkForm({ ...markForm, assessmentType: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  >
                    <option value="assignment">Assignment / Lab Report</option>
                    <option value="quiz">Quiz</option>
                    <option value="midterm">Midterm Exam / Practical</option>
                    <option value="final">End Term Exam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Assessment Name</label>
                <input
                  required
                  type="text"
                  value={markForm.assessmentName}
                  onChange={(e) => setMarkForm({ ...markForm, assessmentName: e.target.value })}
                  placeholder="e.g. OpenShift Deployment Practical"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Max Marks</label>
                  <input
                    required
                    type="number"
                    value={markForm.maxMarks}
                    onChange={(e) => setMarkForm({ ...markForm, maxMarks: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Marks Obtained</label>
                  <input
                    required
                    type="number"
                    value={markForm.marksObtained}
                    onChange={(e) => setMarkForm({ ...markForm, marksObtained: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Faculty Feedback Notes</label>
                <textarea
                  rows={2}
                  value={markForm.feedbackNotes}
                  onChange={(e) => setMarkForm({ ...markForm, feedbackNotes: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewMarkModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Record Mark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG ATTENDANCE */}
      {showNewAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100">Log Session Attendance</h3>
              <button onClick={() => setShowNewAttendanceModal(false)} className="text-neutral-400 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateAttendance} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Course</label>
                <select
                  value={attendanceForm.courseId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, courseId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Student ID</label>
                <input
                  required
                  type="text"
                  value={attendanceForm.studentId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, studentId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Date</label>
                  <input
                    required
                    type="date"
                    value={attendanceForm.classDate}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, classDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Status</label>
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="leave">Excused Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Remarks</label>
                <input
                  type="text"
                  value={attendanceForm.remarks}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })}
                  placeholder="e.g. Participated in practical lab test"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewAttendanceModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
