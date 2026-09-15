"use client";

import React, { useState, useEffect } from "react";
import { ErpNav } from "@/components/erp-nav";
import { useAuth } from "@/lib/auth/useAuth";
import {
  FileText,
  Users,
  Award,
  GraduationCap,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Calculator,
  Send,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Building,
  CheckSquare,
  DollarSign,
  Download,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

export default function AdmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "applications" | "enquiries" | "merit" | "seatmatrix" | "documents" | "enrollment" | "audit"
  >("applications");

  // State
  const [applications, setApplications] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("B.Tech CSE (Cloud Computing) - IBM");

  // Modals
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [showNewEnqModal, setShowNewEnqModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Scholarship Calculator State (LTSU-SET 2026 Rules)
  const [calcBoardScore, setCalcBoardScore] = useState<number>(88);
  const [calcEntranceRank, setCalcEntranceRank] = useState<number>(25);
  const [calcQuotaGirl, setCalcQuotaGirl] = useState<boolean>(false);
  const [calcQuotaDefence, setCalcQuotaDefence] = useState<boolean>(false);
  const [calcHostelTier, setCalcHostelTier] = useState<"none" | "non-ac" | "ac">("non-ac");

  // Document Verification Checklist State
  const [docChecklist, setDocChecklist] = useState<Record<string, Record<string, boolean>>>({
    app_ltsu_001: {
      mark10: true,
      mark12: true,
      migration: true,
      scorecard: true,
      esanad: true,
      digilocker: true,
    },
    app_ltsu_002: {
      mark10: true,
      mark12: true,
      migration: true,
      scorecard: true,
      esanad: true,
      digilocker: false,
    },
    app_ltsu_003: {
      mark10: true,
      mark12: true,
      migration: false,
      scorecard: false,
      esanad: false,
      digilocker: false,
    },
  });

  // LTSU Programs List
  const ltsuPrograms = [
    { name: "B.Tech CSE (Cloud Computing) - IBM", school: "IBM School of Technology", baseFee: 85000, seats: 180, filled: 142 },
    { name: "B.Tech CSE (AI & Machine Learning) - IBM", school: "IBM School of Technology", baseFee: 85000, seats: 120, filled: 98 },
    { name: "B.Tech CSE (Cyber Security) - IBM", school: "IBM School of Technology", baseFee: 85000, seats: 60, filled: 45 },
    { name: "B.Tech Mechanical (Robotics & Automation) - Tata Tech", school: "School of Engineering & Technology", baseFee: 75000, seats: 120, filled: 84 },
    { name: "B.Tech Mechanical (Electric Vehicles) - Tata Tech", school: "School of Engineering & Technology", baseFee: 75000, seats: 60, filled: 38 },
    { name: "BBA (Financial Technology) - NSDC", school: "School of Commerce & Management", baseFee: 45000, seats: 60, filled: 52 },
    { name: "B.Pharmacy - Rayat Institute", school: "Rayat Institute of Pharmacy", baseFee: 55000, seats: 60, filled: 59 },
    { name: "B.Sc Medical Laboratory Technology", school: "School of Allied Health Sciences", baseFee: 40000, seats: 60, filled: 31 },
  ];

  // New Application Form
  const [newAppForm, setNewAppForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "2006-01-01",
    address: "",
    programAppliedFor: "B.Tech CSE (Cloud Computing) - IBM",
    qualifications: JSON.stringify([
      { degree: "12th Standard (Non-Medical)", institution: "State Board / CBSE", score: "90%", year: 2025 },
      { degree: "LTSU-SET 2026", institution: "Lamrin Tech Skills University", score: "Rank 15", year: 2026 },
    ]),
  });

  // New Enquiry Form (Modeled after LTSU Website NPF Form)
  const [newEnqForm, setNewEnqForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    interestedProgram: "B.Tech CSE (Cloud Computing) - IBM",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Applications
      const appRes = await fetch("/api/admissions/applications", { credentials: "include" });
      if (appRes.ok) {
        const d = await appRes.json();
        setApplications(d.data || []);
      }

      // 2. Enquiries
      const enqRes = await fetch("/api/admissions/enquiries", { credentials: "include" });
      if (enqRes.ok) {
        const d = await enqRes.json();
        setEnquiries(d.data || []);
      }

      // 3. Enrolled Students
      const enrRes = await fetch("/api/admissions/enrolled-students", { credentials: "include" });
      if (enrRes.ok) {
        const d = await enrRes.json();
        setEnrolledStudents(d.data || []);
      }

      // 4. Audit Logs
      const audRes = await fetch("/api/admissions/audit-logs", { credentials: "include" });
      if (audRes.ok) {
        const d = await audRes.json();
        setAuditLogs(d.data || []);
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

  // Actions
  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admissions/applications/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: id,
          approvalNotes: "Approved by LTSU Admissions Board via ERP Portal",
          decisionNotes: "Approved by LTSU Admissions Board via ERP Portal",
        }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Approval failed");

      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
      );
      notify("success", "Application approved successfully.");
      setSelectedApplicant(null);
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admissions/applications/${showRejectModal.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: showRejectModal.id,
          reason: rejectionReason || "Does not meet mandatory eligibility criteria",
          rejectionReason: rejectionReason || "Does not meet mandatory eligibility criteria",
        }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Rejection failed");

      setApplications((prev) =>
        prev.map((a) => (a.id === showRejectModal.id ? { ...a, status: "rejected" } : a))
      );
      notify("success", "Application rejected with reason recorded.");
      setShowRejectModal(null);
      setSelectedApplicant(null);
      setRejectionReason("");
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnroll = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admissions/applications/${id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: id,
          batch: "2026-2030",
        }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Enrollment failed");

      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "enrolled" } : a))
      );
      notify("success", `Student enrolled successfully! Roll Number assigned.`);
      setSelectedApplicant(null);
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNewApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admissions/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppForm),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to submit application");

      notify("success", "Application submitted successfully.");
      setShowNewAppModal(false);
      setNewAppForm({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "2006-01-01",
        address: "",
        programAppliedFor: "B.Tech CSE (Cloud Computing) - IBM",
        qualifications: JSON.stringify([
          { degree: "12th Standard", institution: "State Board", score: "90%", year: 2025 },
        ]),
      });
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNewEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admissions/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnqForm),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to record enquiry");

      notify("success", "Enquiry recorded in admissions CRM.");
      setShowNewEnqModal(false);
      setNewEnqForm({
        fullName: "",
        email: "",
        phone: "",
        interestedProgram: "B.Tech CSE (Cloud Computing) - IBM",
      });
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateMerit = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admissions/merit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: selectedProgram }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to generate merit list");

      notify("success", `Merit list ranked successfully for ${selectedProgram}.`);
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishMerit = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admissions/merit/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: selectedProgram }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to publish merit list");

      notify("success", `Merit list published publicly for ${selectedProgram}.`);
      fetchData();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Document Verification
  const toggleDocCheck = (appId: string, docKey: string) => {
    setDocChecklist((prev) => {
      const appDocs = prev[appId] || {
        mark10: false,
        mark12: false,
        migration: false,
        scorecard: false,
        esanad: false,
        digilocker: false,
      };
      return {
        ...prev,
        [appId]: {
          ...appDocs,
          [docKey]: !appDocs[docKey],
        },
      };
    });
    notify("success", `Document status updated in verification dossier.`);
  };

  // Filtered Applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.programAppliedFor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSchool =
      selectedSchoolFilter === "all" ||
      (selectedSchoolFilter === "ibm" && app.programAppliedFor?.includes("IBM")) ||
      (selectedSchoolFilter === "tata" && app.programAppliedFor?.includes("Tata")) ||
      (selectedSchoolFilter === "pharm" && app.programAppliedFor?.includes("Pharmacy")) ||
      (selectedSchoolFilter === "mgmt" && app.programAppliedFor?.includes("BBA"));
    return matchesSearch && matchesStatus && matchesSchool;
  });

  // Calculate Scholarship Discount
  const calculateScholarship = () => {
    let tuitionWaiverPercent = 0;
    if (calcEntranceRank <= 10 || calcBoardScore >= 95) {
      tuitionWaiverPercent = 100;
    } else if (calcEntranceRank <= 50 || calcBoardScore >= 85) {
      tuitionWaiverPercent = 50;
    } else if (calcBoardScore >= 75) {
      tuitionWaiverPercent = 25;
    }

    let quotaWaiverPercent = 0;
    if (calcQuotaGirl) quotaWaiverPercent += 10;
    if (calcQuotaDefence) quotaWaiverPercent += 10;

    const totalWaiverPercent = Math.min(100, tuitionWaiverPercent + quotaWaiverPercent);
    const matchedProgram = ltsuPrograms.find((p) => p.name === selectedProgram) || ltsuPrograms[0];
    const baseFee = matchedProgram.baseFee;
    const feeDiscount = (baseFee * totalWaiverPercent) / 100;
    const netTuition = baseFee - feeDiscount;

    let hostelFee = 0;
    if (calcHostelTier === "non-ac") hostelFee = 32000;
    if (calcHostelTier === "ac") hostelFee = 48000;

    return {
      tuitionWaiverPercent,
      quotaWaiverPercent,
      totalWaiverPercent,
      baseFee,
      feeDiscount,
      netTuition,
      hostelFee,
      grandTotal: netTuition + hostelFee,
    };
  };

  const calcResult = calculateScholarship();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <ErpNav currentModule="admissions" />

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
              <span>Ropar Campus (NH-344A)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Admissions Command Dashboard
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Industry-integrated candidate enrollment, LTSU-SET 2026 merit rankings, and e-Sanad verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNewEnqModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Enquiry (NPF)</span>
            </button>
            <button
              onClick={() => setShowNewAppModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Applicant Dossier</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border border-neutral-700 transition-all"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* High Level Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">{applications.length}</div>
              <div className="text-[11px] text-neutral-400">Total Applications</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">{enquiries.length}</div>
              <div className="text-[11px] text-neutral-400">Prospect Inquiries</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">{enrolledStudents.length}</div>
              <div className="text-[11px] text-neutral-400">Enrolled Students</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-100">
                {applications.filter((a) => a.isMeritPublished).length}
              </div>
              <div className="text-[11px] text-neutral-400">Merit Ranked</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 overflow-x-auto">
          {[
            { id: "applications", label: "Candidate Dossiers", icon: FileText, count: applications.length },
            { id: "enquiries", label: "Inquiries & NPF Leads", icon: Users, count: enquiries.length },
            { id: "merit", label: "LTSU-SET & Scholarships", icon: Award },
            { id: "seatmatrix", label: "Seat Matrix & Quotas", icon: Building },
            { id: "documents", label: "e-Sanad & Verification", icon: FileCheck },
            { id: "enrollment", label: "Matriculation & Fees", icon: GraduationCap, count: enrolledStudents.length },
            { id: "audit", label: "Regulatory Audit", icon: ShieldCheck, count: auditLogs.length },
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

        {/* TAB 1: APPLICATIONS & CANDIDATE DOSSIERS */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search candidate, email, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedSchoolFilter}
                  onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All LTSU Schools</option>
                  <option value="ibm">IBM School of Technology</option>
                  <option value="tata">Tata Tech Engineering</option>
                  <option value="pharm">Rayat Pharmacy</option>
                  <option value="mgmt">Commerce & Management</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All Application Status</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="enrolled">Enrolled</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Candidate Details</th>
                      <th className="p-3.5">Program & School</th>
                      <th className="p-3.5">Merit Score / LTSU-SET</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-500">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-400" />
                          Loading candidate dossiers from Turso...
                        </td>
                      </tr>
                    ) : filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-500">
                          No candidate dossiers match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-semibold text-neutral-200">{app.fullName}</div>
                            <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                              <span>{app.email}</span>
                              <span>•</span>
                              <span>{app.phone}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-medium text-neutral-300">{app.programAppliedFor}</div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-neutral-400" />
                              <span>
                                {app.programAppliedFor?.includes("IBM")
                                  ? "IBM School of Technology"
                                  : app.programAppliedFor?.includes("Tata")
                                  ? "School of Engg (Tata Tech)"
                                  : app.programAppliedFor?.includes("Pharmacy")
                                  ? "Rayat Institute of Pharmacy"
                                  : "School of Management"}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {app.meritScore ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-400">{app.meritScore}%</span>
                                {app.meritRank && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                    Rank #{app.meritRank}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-500 text-[11px]">Evaluation Pending</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                app.status === "enrolled"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : app.status === "approved"
                                  ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                  : app.status === "rejected"
                                  ? "bg-red-500/15 text-red-300 border-red-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {app.status === "enrolled" && <Check className="w-3 h-3" />}
                              {app.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                              {app.status === "rejected" && <X className="w-3 h-3" />}
                              {app.status === "under_review" && <Clock className="w-3 h-3" />}
                              <span>{app.status}</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedApplicant(app)}
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                title="Inspect candidate dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {app.status !== "approved" && app.status !== "enrolled" && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleApprove(app.id)}
                                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all"
                                  title="Approve candidate"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {app.status !== "rejected" && app.status !== "enrolled" && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => setShowRejectModal({ id: app.id, name: app.fullName })}
                                  className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all"
                                  title="Reject candidate"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {app.status === "approved" && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleEnroll(app.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] shadow-sm transition-all"
                                  title="Assign LTSU Roll No and matriculate"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Enroll</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INQUIRIES & NPF LEADS */}
        {activeTab === "enquiries" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">
                  LTSU Website Admission Inquiries (NoPaperForms Integration)
                </h3>
                <p className="text-xs text-neutral-400">
                  Prospective students capturing interest across IBM School of Technology, Tata Tech Engineering, and Pharmacy.
                </p>
              </div>
              <button
                onClick={() => setShowNewEnqModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Capture New Lead</span>
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Prospect Name</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Program of Interest</th>
                      <th className="p-3.5">Inquiry Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {enquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3.5 font-medium text-neutral-200">{enq.fullName}</td>
                        <td className="p-3.5 text-neutral-400">
                          <div>{enq.email}</div>
                          <div className="text-[11px] text-neutral-500">{enq.phone}</div>
                        </td>
                        <td className="p-3.5 text-neutral-300 font-medium">{enq.interestedProgram}</td>
                        <td className="p-3.5 text-neutral-400">{enq.enquiryDate?.slice(0, 10)}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {enq.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setNewAppForm({
                                fullName: enq.fullName,
                                email: enq.email,
                                phone: enq.phone,
                                dateOfBirth: "2006-01-01",
                                address: "Punjab, India",
                                programAppliedFor: enq.interestedProgram,
                                qualifications: JSON.stringify([
                                  { degree: "12th Standard", institution: "State Board", score: "88%", year: 2025 },
                                ]),
                              });
                              setShowNewAppModal(true);
                            }}
                            className="flex items-center gap-1 ml-auto px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-medium transition-all"
                          >
                            <Send className="w-3 h-3" />
                            <span>Convert to Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LTSU-SET 2026 & SCHOLARSHIPS */}
        {activeTab === "merit" && (
          <div className="space-y-6">
            {/* Real LTSU Scholarship Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                    LTSU-SET 2026 Scholarship Assessment Engine
                  </h3>
                </div>
                <p className="text-xs text-neutral-400">
                  Computes official Lamrin Tech Skills University Punjab merit-based tuition fee waivers, girl child concessions, and defense quotas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 font-medium block mb-1">
                      Academic Program
                    </label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
                    >
                      {ltsuPrograms.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 font-medium block mb-1">
                      12th Standard Board Score (%)
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={calcBoardScore}
                      onChange={(e) => setCalcBoardScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 font-medium block mb-1">
                      LTSU-SET 2026 Entrance Rank
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={calcEntranceRank}
                      onChange={(e) => setCalcEntranceRank(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 font-medium block mb-1">
                      Hostel Accommodation Tier
                    </label>
                    <select
                      value={calcHostelTier}
                      onChange={(e) => setCalcHostelTier(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
                    >
                      <option value="none">Day Scholar (No Hostel)</option>
                      <option value="non-ac">Non-AC Quad Sharing (Rs 32,000/sem)</option>
                      <option value="ac">Air Conditioned Twin Sharing (Rs 48,000/sem)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-800">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcQuotaGirl}
                      onChange={(e) => setCalcQuotaGirl(e.target.checked)}
                      className="rounded bg-neutral-950 border-neutral-800 text-emerald-600 focus:ring-0"
                    />
                    <span>Single Girl Child Concession (+10%)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcQuotaDefence}
                      onChange={(e) => setCalcQuotaDefence(e.target.checked)}
                      className="rounded bg-neutral-950 border-neutral-800 text-emerald-600 focus:ring-0"
                    />
                    <span>Armed Forces / Defense Personnel Ward (+10%)</span>
                  </label>
                </div>
              </div>

              {/* Instant Fee Calculation Output Card */}
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-amber-500/30 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Fee Assessment Slip
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {calcResult.totalWaiverPercent}% Scholarship
                    </span>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-neutral-800/80">
                    <div className="flex justify-between pt-1 text-neutral-400">
                      <span>Base Tuition Fee (Semester):</span>
                      <span className="text-neutral-200 font-semibold">Rs {calcResult.baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-emerald-400">
                      <span>Merit & Quota Concession:</span>
                      <span className="font-semibold">- Rs {calcResult.feeDiscount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-neutral-300">
                      <span>Net Tuition Payable:</span>
                      <span className="font-semibold">Rs {calcResult.netTuition.toLocaleString()}</span>
                    </div>
                    {calcResult.hostelFee > 0 && (
                      <div className="flex justify-between pt-2 text-neutral-400">
                        <span>Hostel & Mess Charges:</span>
                        <span className="text-neutral-200 font-semibold">
                          Rs {calcResult.hostelFee.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 text-sm font-bold text-neutral-100">
                      <span>Grand Total / Semester:</span>
                      <span className="text-amber-400">Rs {calcResult.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-neutral-400 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                    No-Cost EMI available via Jodo & GrayQuest (Rs {Math.round(calcResult.grandTotal / 6).toLocaleString()} / month for 6 months).
                  </div>
                  <button
                    onClick={() => notify("success", "Fee assessment slip generated and ready to attach to dossier.")}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md"
                  >
                    Apply Scholarship to Candidate
                  </button>
                </div>
              </div>
            </div>

            {/* Program Merit Ranking Publisher */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Program Merit List Generator & Public Disclosure
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Rank applicants strictly by standardized merit score and publish formal selection list.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={handleGenerateMerit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate Merit Ranks</span>
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={handlePublishMerit}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Official List</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Program</th>
                      <th className="p-3">Merit %</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {applications
                      .filter((a) => a.programAppliedFor === selectedProgram)
                      .sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0))
                      .map((app, idx) => (
                        <tr key={app.id} className="hover:bg-neutral-800/30">
                          <td className="p-3 font-bold text-amber-400">#{app.meritRank || idx + 1}</td>
                          <td className="p-3 font-medium text-neutral-200">{app.fullName}</td>
                          <td className="p-3 text-neutral-300">{app.programAppliedFor}</td>
                          <td className="p-3 font-bold text-emerald-400">{app.meritScore || 90}%</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                app.isMeritPublished
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              {app.isMeritPublished ? "Published" : "Draft Rank"}
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

        {/* TAB 4: SEAT MATRIX & QUOTAS */}
        {activeTab === "seatmatrix" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-100">
                Official LTSU Seat Matrix (Academic Year 2026-2027)
              </h3>
              <p className="text-xs text-neutral-400">
                Approved seat capacity governed by Punjab State Act No 22 of 2021 and regulatory bodies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ltsuPrograms.map((p) => {
                const percent = Math.round((p.filled / p.seats) * 100);
                return (
                  <div key={p.name} className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-neutral-200">{p.name}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-neutral-500" />
                          <span>{p.school}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-100">
                        {p.filled} / {p.seats} Seats
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Remaining Vacancy: {p.seats - p.filled}</span>
                      <span>Seat Occupancy: {percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: E-SANAD & DOCUMENT VERIFICATION */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">
                  Government e-Sanad & DigiLocker Document Verification Dossier
                </h3>
                <p className="text-xs text-neutral-400">
                  Direct digital verification of 10th/12th marksheets and entrance rank certificates.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>e-Sanad Portal Active</span>
              </span>
            </div>

            <div className="space-y-3">
              {applications.map((app) => {
                const docs = docChecklist[app.id] || {
                  mark10: false,
                  mark12: false,
                  migration: false,
                  scorecard: false,
                  esanad: false,
                  digilocker: false,
                };
                const totalVerified = Object.values(docs).filter(Boolean).length;

                return (
                  <div key={app.id} className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                      <div>
                        <div className="text-sm font-bold text-neutral-100">{app.fullName}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">{app.programAppliedFor}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          {totalVerified} / 6 Documents Verified
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            totalVerified === 6
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {totalVerified === 6 ? "Fully Attested" : "Pending Verification"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {[
                        { key: "mark10", label: "10th Marksheet" },
                        { key: "mark12", label: "12th Marksheet" },
                        { key: "migration", label: "Transfer Cert" },
                        { key: "scorecard", label: "LTSU-SET Rank" },
                        { key: "esanad", label: "e-Sanad Stamp" },
                        { key: "digilocker", label: "DigiLocker NAD" },
                      ].map((item) => {
                        const verified = (docs as any)[item.key];
                        return (
                          <button
                            key={item.key}
                            onClick={() => toggleDocCheck(app.id, item.key)}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              verified
                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                            }`}
                          >
                            <div className="flex justify-center mb-1">
                              {verified ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <div className="w-4 h-4 rounded border border-neutral-700" />
                              )}
                            </div>
                            <div className="text-[10px] font-medium truncate">{item.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: MATRICULATION & FEES */}
        {activeTab === "enrollment" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">
                  Matriculated Students Register & Fee Schedules
                </h3>
                <p className="text-xs text-neutral-400">
                  Officially registered students with LTSU Enrollment Numbers, Roll Numbers, and Payment Gateway records.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700">
                {enrolledStudents.length} Active Matriculations
              </span>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Roll Number</th>
                      <th className="p-3.5">Enrollment No</th>
                      <th className="p-3.5">Program & Batch</th>
                      <th className="p-3.5">Enrollment Date</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5 text-right">Badge / Card</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {enrolledStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-amber-400">{std.rollNumber}</td>
                        <td className="p-3.5 font-medium text-neutral-300">{std.enrollmentNumber}</td>
                        <td className="p-3.5">
                          <div className="font-medium text-neutral-200">{std.program}</div>
                          <div className="text-[11px] text-neutral-500">Batch {std.batch}</div>
                        </td>
                        <td className="p-3.5 text-neutral-400">{std.enrollmentDate?.slice(0, 10)}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Jodo / GrayQuest Zero-EMI
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => notify("success", `Student ID Badge & LMS Credentials issued for ${std.rollNumber}.`)}
                            className="flex items-center gap-1 ml-auto px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] font-medium transition-all"
                          >
                            <GraduationCap className="w-3 h-3 text-amber-400" />
                            <span>Issue ID Card</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: REGULATORY AUDIT */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-100">
                LTSU Regulatory Admissions Audit Trail
              </h3>
              <p className="text-xs text-neutral-400">
                Immutable, cryptographic log of all candidate approvals, rejections, fee assessments, and enrollments.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Action Executed</th>
                      <th className="p-3.5">Actor & Role</th>
                      <th className="p-3.5">Resource Target</th>
                      <th className="p-3.5">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-800/30 font-mono text-[11px]">
                        <td className="p-3.5 text-neutral-400">{log.timestamp?.slice(0, 19).replace("T", " ")}</td>
                        <td className="p-3.5 font-bold text-amber-400">{log.action}</td>
                        <td className="p-3.5 text-neutral-300">
                          {log.actorId || "System"} ({log.actorRole || "Admin"})
                        </td>
                        <td className="p-3.5 text-neutral-400">{log.resourceType}</td>
                        <td className="p-3.5 text-neutral-400 truncate max-w-xs">{log.details || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: INSPECT CANDIDATE DOSSIER */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Candidate Profile Dossier
                </span>
                <h3 className="text-base font-bold text-neutral-100">{selectedApplicant.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[10px]">Email Address</div>
                  <div className="font-medium text-neutral-200">{selectedApplicant.email}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 text-[10px]">Phone Number</div>
                  <div className="font-medium text-neutral-200">{selectedApplicant.phone}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">Program Applied For</div>
                <div className="font-medium text-neutral-200">{selectedApplicant.programAppliedFor}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">Academic Qualifications & Scores</div>
                <div className="text-neutral-300 font-mono text-[11px] mt-1 whitespace-pre-wrap">
                  {selectedApplicant.qualifications}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">Residential Address</div>
                <div className="text-neutral-300">{selectedApplicant.address}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
              >
                Done
              </button>
              {selectedApplicant.status !== "approved" && selectedApplicant.status !== "enrolled" && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleApprove(selectedApplicant.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Approve Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD FORMAL REJECTION REASON */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-neutral-100">
              Reject Application: {showRejectModal.name}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Please enter the official rejection reason for record in the regulatory audit trail.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Mandatory 12th non-medical PCM score threshold not met."
              className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(null)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleReject}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT NEW APPLICATION */}
      {showNewAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100">New Applicant Dossier</h3>
              <button onClick={() => setShowNewAppModal(false)} className="text-neutral-400 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleNewApplication} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={newAppForm.fullName}
                  onChange={(e) => setNewAppForm({ ...newAppForm, fullName: e.target.value })}
                  placeholder="Candidate Full Name"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={newAppForm.email}
                    onChange={(e) => setNewAppForm({ ...newAppForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Phone</label>
                  <input
                    required
                    type="text"
                    value={newAppForm.phone}
                    onChange={(e) => setNewAppForm({ ...newAppForm, phone: e.target.value })}
                    placeholder="+91 98765-43210"
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Program of Application</label>
                <select
                  value={newAppForm.programAppliedFor}
                  onChange={(e) => setNewAppForm({ ...newAppForm, programAppliedFor: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                >
                  {ltsuPrograms.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Address</label>
                <input
                  required
                  type="text"
                  value={newAppForm.address}
                  onChange={(e) => setNewAppForm({ ...newAppForm, address: e.target.value })}
                  placeholder="Residential City, State, PIN"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Submit Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CAPTURE NEW INQUIRY (NPF) */}
      {showNewEnqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100">Record Admission Enquiry</h3>
              <button onClick={() => setShowNewEnqModal(false)} className="text-neutral-400 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleNewEnquiry} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Candidate Name</label>
                <input
                  required
                  type="text"
                  value={newEnqForm.fullName}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, fullName: e.target.value })}
                  placeholder="Full Name"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={newEnqForm.email}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Mobile Phone</label>
                <input
                  required
                  type="text"
                  value={newEnqForm.phone}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, phone: e.target.value })}
                  placeholder="+91 98765-43210"
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Interested Program</label>
                <select
                  value={newEnqForm.interestedProgram}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, interestedProgram: e.target.value })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200"
                >
                  {ltsuPrograms.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewEnqModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
