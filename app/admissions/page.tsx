"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnquiryForm } from "@/module-1-admissions/components/enquiries/EnquiryForm";
import { EnquiryList, type EnquiryItem } from "@/module-1-admissions/components/enquiries/EnquiryList";
import { ApplicationWizard } from "@/module-1-admissions/components/applications/ApplicationWizard";
import { ApplicationList, type ApplicationItem } from "@/module-1-admissions/components/applications/ApplicationList";
import { MeritManager } from "@/module-1-admissions/components/merit/MeritManager";
import { Users, FileText, CheckCircle, GraduationCap, ArrowRight, RefreshCw, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdmissionsDashboard() {
  const { user, loading } = useAuth(["admin", "teacher", "student"]);
  const [activeTab, setActiveTab] = useState("applications");
  const [metrics, setMetrics] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  const loadData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch metrics if admin
      if (isAdmin) {
        const metRes = await fetch("/api/admissions/metrics", { credentials: "include" });
        if (metRes.ok) {
          const metData = await metRes.json();
          setMetrics(metData.data);
        }
      }

      // 2. Fetch enquiries
      const enqRes = await fetch("/api/admissions/enquiries", { credentials: "include" });
      if (enqRes.ok) {
        const enqData = await enqRes.json();
        setEnquiries(enqData.data || []);
      }

      // 3. Fetch applications
      const appRes = await fetch("/api/admissions/applications", { credentials: "include" });
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.data || []);
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
          <span>Authenticating admissions portal...</span>
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
              Admissions Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-primary/10 text-primary border border-primary/20">
              Module 1
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Secure digital pipeline: Enquiry to Application, Merit Ranking, and Formal Enrollment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/academic">
            <Button variant="secondary" size="sm">
              Academic Portal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Role Notice & Security Context */}
      <div className="bg-muted/40 rounded-lg p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Authenticated as <strong className="font-semibold">{user?.email}</strong> ({user?.role?.toUpperCase()})
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Role-Based Access Control & Ownership Isolation Active
        </div>
      </div>

      {/* Metrics Row (Admin Only) */}
      {isAdmin && metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Enquiries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{metrics.totalEnquiries}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{metrics.newEnquiries} uncontacted</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{metrics.totalApplications}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{metrics.submittedApplications} submitted</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {metrics.approvedApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Ready for enrollment</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Enrolled
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {metrics.enrolledCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Active student records</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Conversion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{metrics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-0.5">Enquiry to enrollment</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="apply">New Application</TabsTrigger>
          <TabsTrigger value="merit">Merit List</TabsTrigger>
          <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Formal Admission Applications</h2>
            {isStudent && (
              <Button size="sm" onClick={() => setActiveTab("apply")}>
                Start New Application
              </Button>
            )}
          </div>
          <ApplicationList
            applications={applications}
            isAdmin={isAdmin}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="apply">
          <ApplicationWizard
            userEmail={isStudent ? user?.email : undefined}
            onSubmitted={() => {
              loadData();
              setActiveTab("applications");
            }}
          />
        </TabsContent>

        <TabsContent value="merit">
          <MeritManager isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="enquiries" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <EnquiryForm onSuccess={loadData} />
            </div>
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Admission Enquiries Log</h2>
                <span className="text-xs text-muted-foreground">{enquiries.length} total records</span>
              </div>
              <EnquiryList
                enquiries={enquiries}
                isAdmin={isAdmin}
                onStatusChange={loadData}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
