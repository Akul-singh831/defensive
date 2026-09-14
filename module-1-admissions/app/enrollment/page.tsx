"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { EnrollmentManager } from "../../components/enrollment/EnrollmentManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EnrollmentPage() {
  const { user } = useAuth(["admin"]);
  const [approvedApps, setApprovedApps] = useState<any[]>([]);

  const fetchApproved = async () => {
    const res = await fetch("/api/admissions/applications", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      const all = data.data || [];
      setApprovedApps(all.filter((a: any) => a.status === "approved"));
    }
  };

  useEffect(() => {
    if (user) {
      fetchApproved();
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/admissions">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Admissions Hub
        </Button>
      </Link>

      <EnrollmentManager
        approvedApplications={approvedApps}
        isAdmin={user?.role === "admin"}
        onEnrolled={fetchApproved}
      />
    </div>
  );
}
