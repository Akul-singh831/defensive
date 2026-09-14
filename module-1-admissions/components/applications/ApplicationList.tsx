"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface ApplicationItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  programAppliedFor: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled";
  meritScore?: number | null;
  meritRank?: number | null;
  applicationDate: string;
}

interface ApplicationListProps {
  applications: ApplicationItem[];
  isAdmin: boolean;
  onRefresh?: () => void;
}

export function ApplicationList({ applications, isAdmin, onRefresh }: ApplicationListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (endpoint: string, payload: Record<string, unknown>) => {
    setProcessingId(String(payload.applicationId));
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Submitted</Badge>;
      case "under_review":
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400">Under Review</Badge>;
      case "approved":
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "enrolled":
        return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400">Enrolled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
        No admissions applications found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Merit Score</TableHead>
            <TableHead>Date</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="font-medium text-sm">{app.fullName}</div>
                <div className="text-xs text-muted-foreground">{app.email}</div>
              </TableCell>
              <TableCell className="text-sm">{app.programAppliedFor}</TableCell>
              <TableCell>{getStatusBadge(app.status)}</TableCell>
              <TableCell className="text-sm font-mono">
                {app.meritScore ? `${app.meritScore}%` : "Pending"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(app.applicationDate).toLocaleDateString()}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right space-x-1.5">
                  {(app.status === "submitted" || app.status === "under_review") && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        disabled={processingId === app.id}
                        onClick={() =>
                          handleAction("/api/admissions/approve", {
                            applicationId: app.id,
                            approvalNotes: "Approved by admissions officer",
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={processingId === app.id}
                        onClick={() =>
                          handleAction("/api/admissions/reject", {
                            applicationId: app.id,
                            rejectionReason: "Does not meet minimum entrance criteria",
                          })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {app.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10"
                      disabled={processingId === app.id}
                      onClick={() =>
                        handleAction("/api/admissions/enroll", {
                          applicationId: app.id,
                          email: app.email,
                          password: "TemporaryPassword123!",
                          firstName: app.fullName.split(" ")[0] || "Student",
                          lastName: app.fullName.split(" ")[1] || "Candidate",
                          program: app.programAppliedFor,
                          batch: "2026-2030",
                          rollNumber: `26CS${Math.floor(100 + Math.random() * 900)}`,
                        })
                      }
                    >
                      Enroll Now
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
