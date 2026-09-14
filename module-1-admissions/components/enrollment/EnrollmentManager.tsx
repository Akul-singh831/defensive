"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, CheckCircle2, ShieldCheck } from "lucide-react";

interface EnrollmentManagerProps {
  approvedApplications: Array<{
    id: string;
    fullName: string;
    email: string;
    programAppliedFor: string;
    status: string;
  }>;
  isAdmin: boolean;
  onEnrolled?: () => void;
}

export function EnrollmentManager({
  approvedApplications,
  isAdmin,
  onEnrolled,
}: EnrollmentManagerProps) {
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEnroll = async (app: {
    id: string;
    fullName: string;
    email: string;
    programAppliedFor: string;
  }) => {
    setEnrollingId(app.id);
    setSuccessMsg(null);
    try {
      const parts = app.fullName.split(" ");
      const firstName = parts[0] || "Student";
      const lastName = parts.slice(1).join(" ") || "Candidate";
      const randomRoll = `26CS${Math.floor(100 + Math.random() * 900)}`;

      const res = await fetch("/api/admissions/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          email: app.email,
          password: "DefaultStudentPassword123!",
          firstName,
          lastName,
          program: app.programAppliedFor,
          batch: "2026-2030",
          rollNumber: randomRoll,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed");
      }

      setSuccessMsg(
        `Successfully enrolled ${app.fullName} with Roll Number ${randomRoll}. User credentials generated and audit event logged.`
      );
      if (onEnrolled) onEnrolled();
    } catch (err) {
      console.error(err);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">Student Enrollment Authority</CardTitle>
        <CardDescription>
          Approved candidates transitioning into university student roster with generated roll number and credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Enrollment Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                    No approved applications waiting for enrollment.
                  </TableCell>
                </TableRow>
              ) : (
                approvedApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{app.fullName}</div>
                      <div className="text-xs text-muted-foreground">{app.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{app.programAppliedFor}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        Approved
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={enrollingId === app.id}
                          onClick={() => handleEnroll(app)}
                        >
                          <GraduationCap className="w-4 h-4 mr-1.5" />
                          {enrollingId === app.id ? "Enrolling..." : "Enroll Student"}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
