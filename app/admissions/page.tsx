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
} from "lucide-react";

export default function AdmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"applications" | "enquiries" | "merit" | "enrollment" | "audit">("applications");

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
  const [selectedProgram, setSelectedProgram] = useState("Computer Science");

  // Modals
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [showNewEnqModal, setShowNewEnqModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // New Application Form
  const [newAppForm, setNewAppForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "2005-01-01",
    address: "",
    programAppliedFor: "Computer Science",
    qualifications: JSON.stringify([{ degree: "High School Diploma", score: "90%", year: 2024 }]),
  });

  // New Enquiry Form
  const [newEnqForm, setNewEnqForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    interestedProgram: "Computer Science",
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

      // 4. Audit Logs (if admin)
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
          approvalNotes: "Approved by Admissions Board via ERP Portal",
          decisionNotes: "Approved by Admissions Board via ERP Portal",
        }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Approval failed");
      
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
      );
      notify("success", "Application approved successfully.");
      setSelectedApplicant(null);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    const targetId = showRejectModal.id;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admissions/applications/${targetId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: targetId,
          rejectionReason: rejectionReason || "Does not satisfy program minimum thresholds",
        }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Rejection failed");
      
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a.id === targetId ? { ...a, status: "rejected" } : a))
      );
      notify("success", "Application rejected with formal record.");
      setShowRejectModal(null);
      setRejectionReason("");
      setSelectedApplicant(null);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnroll = async (appItem: any) => {
    setActionLoading(true);
    try {
      const payload = {
        applicationId: appItem.id,
        program: appItem.programAppliedFor,
        batch: "2026-2030",
        rollNumber: `ROL${Date.now().toString().slice(-6)}`,
        email: appItem.email,
        studentEmail: appItem.email,
        password: "StudentPass123!",
        studentPassword: "StudentPass123!",
        firstName: appItem.fullName.split(" ")[0] || "Student",
        lastName: appItem.fullName.split(" ").slice(1).join(" ") || "Candidate",
      };

      const res = await fetch(`/api/admissions/applications/${appItem.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Enrollment failed");
      
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a.id === appItem.id ? { ...a, status: "enrolled" } : a))
      );
      notify("success", `Candidate officially enrolled with Roll Number ${d.data?.rollNumber || payload.rollNumber}.`);
      setSelectedApplicant(null);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Failed to enroll candidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
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
      if (!res.ok) throw new Error(d.error || "Failed to create application");
      notify("success", "Application dossier successfully registered in ERP.");
      setShowNewAppModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Submission failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admissions/create-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnqForm),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to log enquiry");
      notify("success", "Prospective student lead logged.");
      setShowNewEnqModal(false);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Lead registration failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCalculateMerit = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admissions/merit/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: selectedProgram, academicYear: "2026-2027" }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Merit calculation failed");
      notify("success", `Merit ranking executed. ${d.data?.rankedCount || d.data?.count || 0} candidates scored.`);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Ranking execution failed");
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
        body: JSON.stringify({ program: selectedProgram, academicYear: "2026-2027" }),
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Merit publish failed");
      notify("success", `Official merit list published for ${selectedProgram}.`);
      fetchData();
    } catch (err: any) {
      notify("error", err.message || "Publishing failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered lists
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.programAppliedFor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.interestedProgram?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "enrolled":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "under_review":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "submitted":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "rejected":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "converted":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "contacted":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      <ErpNav currentModule="admissions" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner notifications */}
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
                Admissions Management
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Module 1
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              End to end applicant lifecycle: Prospective leads, dossier review, merit ranking, and matriculation.
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
              onClick={() => setShowNewEnqModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400" />
              New Lead
            </button>
            <button
              onClick={() => setShowNewAppModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Applicant
            </button>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Total Applications</p>
              <p className="text-2xl font-bold text-white mt-1">{applications.length}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                {applications.filter((a) => a.status === "approved" || a.status === "enrolled").length} Qualified
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Active Enquiries</p>
              <p className="text-2xl font-bold text-white mt-1">{enquiries.length}</p>
              <p className="text-[11px] text-amber-400 mt-0.5">
                {enquiries.filter((e) => e.status === "converted").length} Converted leads
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Merit Qualified</p>
              <p className="text-2xl font-bold text-white mt-1">
                {applications.filter((a) => a.meritScore != null).length}
              </p>
              <p className="text-[11px] text-purple-400 mt-0.5">Automated scoring</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400">Final Enrolled</p>
              <p className="text-2xl font-bold text-white mt-1">{enrolledStudents.length}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Active registry</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab("applications");
              setStatusFilter("all");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "applications"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Applications Pipeline</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("enquiries");
              setStatusFilter("all");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "enquiries"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Enquiries & Leads</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {enquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("merit")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "merit"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>Merit & Ranking Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("enrollment")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "enrollment"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Enrolled Registry</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
              {enrolledStudents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "audit"
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Audit Governance</span>
          </button>
        </div>

        {/* TAB 1: APPLICATIONS PIPELINE */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by candidate name, email, program..."
                  className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["all", "submitted", "under_review", "approved", "rejected", "enrolled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                      statusFilter === s
                        ? "bg-neutral-800 text-white border border-neutral-700"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Table */}
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Program</th>
                      <th className="py-3 px-4">Merit Score</th>
                      <th className="py-3 px-4">Submission Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          No applications match current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{app.fullName}</div>
                            <div className="text-[11px] text-neutral-500">{app.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{app.programAppliedFor}</span>
                          </td>
                          <td className="py-3 px-4">
                            {app.meritScore ? (
                              <span className="font-mono text-emerald-400 font-semibold">
                                {app.meritScore}%
                              </span>
                            ) : (
                              <span className="text-neutral-500">Pending</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-neutral-400">{app.applicationDate}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                                app.status
                              )}`}
                            >
                              {app.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedApplicant(app)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                              title="Inspect full applicant dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {app.status !== "approved" && app.status !== "enrolled" && (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleApprove(app.id)}
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors"
                                title="Approve application"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {app.status !== "rejected" && app.status !== "enrolled" && (
                              <button
                                disabled={actionLoading}
                                onClick={() => setShowRejectModal({ id: app.id, name: app.fullName })}
                                className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors"
                                title="Reject application"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {app.status === "approved" && (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleEnroll(app)}
                                className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-colors"
                                title="Enroll student formally"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                              </button>
                            )}
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

        {/* TAB 2: ENQUIRIES & LEADS */}
        {activeTab === "enquiries" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prospective leads..."
                  className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {["all", "new", "contacted", "converted", "closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                      statusFilter === s
                        ? "bg-neutral-800 text-white border border-neutral-700"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Prospective Student</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Interested Program</th>
                      <th className="py-3 px-4">Enquiry Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Conversion Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                    {filteredEnquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          No leads match current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEnquiries.map((enq) => (
                        <tr key={enq.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{enq.fullName}</div>
                            <div className="text-[11px] text-neutral-500">{enq.email}</div>
                          </td>
                          <td className="py-3 px-4 text-neutral-300">{enq.phone}</td>
                          <td className="py-3 px-4 font-medium">{enq.interestedProgram}</td>
                          <td className="py-3 px-4 text-neutral-400">{enq.enquiryDate?.slice(0, 10)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                                enq.status
                              )}`}
                            >
                              {enq.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {enq.status !== "converted" ? (
                              <button
                                onClick={() => {
                                  setNewAppForm({
                                    fullName: enq.fullName,
                                    email: enq.email,
                                    phone: enq.phone,
                                    dateOfBirth: "2005-01-01",
                                    address: "Address on file",
                                    programAppliedFor: enq.interestedProgram,
                                    qualifications: JSON.stringify([{ degree: "High School", score: "92%", year: 2024 }]),
                                  });
                                  setShowNewAppModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors inline-flex items-center gap-1"
                              >
                                <span>Convert to App</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-neutral-500 italic">Converted</span>
                            )}
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

        {/* TAB 3: MERIT & RANKING ENGINE */}
        {activeTab === "merit" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Automated Merit Scoring Engine</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Calculates composite candidate scores based on verified high school records and marks.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>

                <button
                  disabled={actionLoading}
                  onClick={handleCalculateMerit}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-purple-400" />
                  Calculate & Rank
                </button>

                <button
                  disabled={actionLoading}
                  onClick={handlePublishMerit}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow-md shadow-purple-900/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish List
                </button>
              </div>
            </div>

            {/* Merit Leaderboard */}
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  {selectedProgram} Merit Leaderboard
                </h4>
                <span className="text-xs text-neutral-500">Official ranking sorted by academic score</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Candidate Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Merit Percentage</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                    {applications
                      .filter((a) => a.programAppliedFor === selectedProgram && a.meritScore != null)
                      .sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0))
                      .map((cand, idx) => (
                        <tr key={cand.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                                idx === 0
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : idx === 1
                                  ? "bg-neutral-400/20 text-neutral-200 border border-neutral-400/40"
                                  : idx === 2
                                  ? "bg-amber-700/20 text-amber-500 border border-amber-700/40"
                                  : "text-neutral-500"
                              }`}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{cand.fullName}</td>
                          <td className="py-3 px-4 text-neutral-400">{cand.email}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-emerald-400 font-bold text-sm">
                              {cand.meritScore}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                                cand.status
                              )}`}
                            >
                              {cand.status.replace("_", " ")}
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

        {/* TAB 4: ENROLLED REGISTRY */}
        {activeTab === "enrollment" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Officially Matriculated Students
                </h4>
                <span className="text-xs text-emerald-400 font-medium">
                  {enrolledStudents.length} Active Matriculations
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Enrollment ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Program & Batch</th>
                      <th className="py-3 px-4">Date Enrolled</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                    {enrolledStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          No students enrolled yet.
                        </td>
                      </tr>
                    ) : (
                      enrolledStudents.map((enr) => (
                        <tr key={enr.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            {enr.rollNumber}
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-400">{enr.enrollmentNumber}</td>
                          <td className="py-3 px-4 font-medium text-white">
                            {enr.firstName} {enr.lastName}
                          </td>
                          <td className="py-3 px-4">
                            <div>{enr.program}</div>
                            <div className="text-[11px] text-neutral-500">Batch {enr.batch}</div>
                          </td>
                          <td className="py-3 px-4 text-neutral-400">{enr.enrollmentDate?.slice(0, 10)}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                              Active
                            </span>
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

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Immutable Security Audit Trail
                </h4>
                <span className="text-xs text-neutral-500">Chronological governance records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource Target</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          No audit entries available.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                            {log.timestamp?.slice(0, 19).replace("T", " ")}
                          </td>
                          <td className="py-3 px-4 font-medium text-white">
                            {log.actorId || "System"} ({log.actorRole || "Core"})
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400">{log.action}</td>
                          <td className="py-3 px-4 text-neutral-400">
                            {log.resourceType}:{log.resourceId}
                          </td>
                          <td className="py-3 px-4 text-neutral-500">{log.ipAddress || "127.0.0.1"}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {log.result}
                            </span>
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
      </main>

      {/* APPLICANT DOSSIER DRAWER / MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{selectedApplicant.fullName}</h3>
                <p className="text-xs text-neutral-400">{selectedApplicant.email}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500">Program Applied:</span>
                  <p className="font-medium text-white mt-0.5">{selectedApplicant.programAppliedFor}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Current Status:</span>
                  <p className="font-medium text-white mt-0.5 capitalize">
                    {selectedApplicant.status.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500">Contact Phone:</span>
                  <p className="font-medium text-white mt-0.5">{selectedApplicant.phone}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Date of Birth:</span>
                  <p className="font-medium text-white mt-0.5">{selectedApplicant.dateOfBirth}</p>
                </div>
              </div>

              <div>
                <span className="text-neutral-500">Residential Address:</span>
                <p className="font-medium text-white mt-0.5">{selectedApplicant.address}</p>
              </div>

              <div>
                <span className="text-neutral-500">Academic Qualifications:</span>
                <pre className="mt-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto">
                  {selectedApplicant.qualifications}
                </pre>
              </div>

              {selectedApplicant.meritScore && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 flex items-center justify-between">
                  <span className="text-purple-300">Computed Merit Score:</span>
                  <span className="font-mono text-base font-bold text-purple-300">
                    {selectedApplicant.meritScore}%
                  </span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
                {selectedApplicant.status !== "approved" && selectedApplicant.status !== "enrolled" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApprove(selectedApplicant.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Approve Candidate
                  </button>
                )}
                {selectedApplicant.status !== "rejected" && selectedApplicant.status !== "enrolled" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      setShowRejectModal({ id: selectedApplicant.id, name: selectedApplicant.fullName });
                      setSelectedApplicant(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
                  >
                    Reject Candidate
                  </button>
                )}
                {selectedApplicant.status === "approved" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleEnroll(selectedApplicant)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                  >
                    Enroll Candidate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW APPLICATION MODAL */}
      {showNewAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Register New Application Dossier</h3>
              <button onClick={() => setShowNewAppModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={newAppForm.fullName}
                  onChange={(e) => setNewAppForm({ ...newAppForm, fullName: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAppForm.email}
                  onChange={(e) => setNewAppForm({ ...newAppForm, email: e.target.value })}
                  placeholder="eleanor@example.com"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={newAppForm.phone}
                    onChange={(e) => setNewAppForm({ ...newAppForm, phone: e.target.value })}
                    placeholder="555-0199"
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newAppForm.dateOfBirth}
                    onChange={(e) => setNewAppForm({ ...newAppForm, dateOfBirth: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Program Applied For</label>
                <select
                  value={newAppForm.programAppliedFor}
                  onChange={(e) => setNewAppForm({ ...newAppForm, programAppliedFor: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Residential Address</label>
                <input
                  type="text"
                  required
                  value={newAppForm.address}
                  onChange={(e) => setNewAppForm({ ...newAppForm, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW ENQUIRY MODAL */}
      {showNewEnqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Log Prospective Student Lead</h3>
              <button onClick={() => setShowNewEnqModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newEnqForm.fullName}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEnqForm.email}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={newEnqForm.phone}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, phone: e.target.value })}
                  placeholder="555-0123"
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Interested Program</label>
                <select
                  value={newEnqForm.interestedProgram}
                  onChange={(e) => setNewEnqForm({ ...newEnqForm, interestedProgram: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEnqModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">
              Reject Application for {showRejectModal.name}
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Please state the formal rationale for rejecting this candidate application:
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Prerequisite mathematics threshold not met"
              className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowRejectModal(null)}
                className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-3 py-1.5 rounded-xl font-semibold bg-red-600 hover:bg-red-500 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
