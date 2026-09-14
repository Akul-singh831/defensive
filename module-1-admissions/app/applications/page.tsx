"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { ApplicationList, type ApplicationItem } from "../../components/applications/ApplicationList";
import { ApplicationWizard } from "../../components/applications/ApplicationWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
  const { user, loading } = useAuth(["admin", "student"]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  const isAdmin = user?.role === "admin";

  const fetchApplications = async () => {
    const res = await fetch("/api/admissions/applications", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setApplications(data.data || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admissions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Admissions Hub
          </Button>
        </Link>
        <Button size="sm" onClick={() => setShowWizard(!showWizard)}>
          <Plus className="w-4 h-4 mr-1.5" />
          {showWizard ? "View Applications" : "New Application"}
        </Button>
      </div>

      {showWizard ? (
        <ApplicationWizard
          userEmail={user?.role === "student" ? user.email : undefined}
          onSubmitted={() => {
            setShowWizard(false);
            fetchApplications();
          }}
        />
      ) : (
        <ApplicationList
          applications={applications}
          isAdmin={isAdmin}
          onRefresh={fetchApplications}
        />
      )}
    </div>
  );
}
