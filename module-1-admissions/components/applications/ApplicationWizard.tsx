"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";

interface ApplicationWizardProps {
  onSubmitted?: () => void;
  userEmail?: string;
}

export function ApplicationWizard({ onSubmitted, userEmail }: ApplicationWizardProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: userEmail || "",
    phone: "",
    dateOfBirth: "",
    address: "",
    programAppliedFor: "B.Tech Computer Science",
    qualifications: {
      tenthMarks: "92%",
      twelfthMarks: "89%",
      entranceRank: "1420",
    },
  });

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.address) {
        setErrorMsg("Please complete all personal profile fields before advancing.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.programAppliedFor) {
        setErrorMsg("Please select an academic program.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (submitDirectly: boolean) => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create draft application
      const createRes = await fetch("/api/admissions/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create application draft");
      }

      const appId = createData.data?.id;

      // 2. If requested submit directly, transition draft -> submitted
      if (submitDirectly && appId) {
        const submitRes = await fetch(`/api/admissions/application/${appId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!submitRes.ok) {
          const submitErr = await submitRes.json();
          throw new Error(submitErr.error || "Failed to submit application");
        }
      }

      setSuccessMsg(
        submitDirectly
          ? "Application successfully submitted for formal review. You can track status in your dashboard."
          : "Application draft successfully saved. You can submit when ready."
      );

      if (onSubmitted) onSubmitted();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error processing application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">Formal Admission Application</CardTitle>
            <CardDescription>Step {step} of 4: Comprehensive Applicant Verification</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            Step {step} / 4
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL PROFILE */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="appFullName">Legal Full Name</Label>
                <Input
                  id="appFullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Taylor Swift"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appEmail">Email Address (Read-only for Students)</Label>
                <Input
                  id="appEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="taylor@example.com"
                  disabled={!!userEmail}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appPhone">Contact Phone Number</Label>
                <Input
                  id="appPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555 902 4810"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appDOB">Date of Birth</Label>
                <Input
                  id="appDOB"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appAddress">Residential Address</Label>
              <Input
                id="appAddress"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="104 University Ave, Suite 300"
              />
            </div>
          </div>
        )}

        {/* STEP 2: COURSE PREFERENCE */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Academic Program Preference
            </h3>
            <div className="space-y-2">
              <Label htmlFor="programChoice">Select Desired Degree Program</Label>
              <Select
                value={formData.programAppliedFor}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, programAppliedFor: val });
                }}
              >
                <SelectTrigger id="programChoice" className="w-full">
                  <SelectValue placeholder="Choose Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech Computer Science">B.Tech Computer Science (4 Years)</SelectItem>
                  <SelectItem value="B.Tech Cybersecurity">B.Tech Cybersecurity (4 Years)</SelectItem>
                  <SelectItem value="B.Tech Artificial Intelligence">B.Tech Artificial Intelligence (4 Years)</SelectItem>
                  <SelectItem value="M.Tech Information Security">M.Tech Information Security (2 Years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* STEP 3: ACADEMIC QUALIFICATIONS */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Prior Academic Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tenthMarks">10th Grade Score (%)</Label>
                <Input
                  id="tenthMarks"
                  value={formData.qualifications.tenthMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualifications: { ...formData.qualifications, tenthMarks: e.target.value },
                    })
                  }
                  placeholder="90%"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="twelfthMarks">12th Grade Score (%)</Label>
                <Input
                  id="twelfthMarks"
                  value={formData.qualifications.twelfthMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualifications: { ...formData.qualifications, twelfthMarks: e.target.value },
                    })
                  }
                  placeholder="88%"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="entranceRank">Entrance Exam Rank</Label>
                <Input
                  id="entranceRank"
                  value={formData.qualifications.entranceRank}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualifications: { ...formData.qualifications, entranceRank: e.target.value },
                    })
                  }
                  placeholder="1250"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & VERIFICATION */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="p-4 rounded-lg bg-muted/40 border space-y-3 text-sm">
              <div className="flex items-center gap-2 text-primary font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Applicant:</span> {formData.fullName}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {formData.email}
                </div>
                <div>
                  <span className="text-muted-foreground">Program:</span> {formData.programAppliedFor}
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span> {formData.phone}
                </div>
                <div>
                  <span className="text-muted-foreground">10th Marks:</span> {formData.qualifications.tenthMarks}
                </div>
                <div>
                  <span className="text-muted-foreground">12th Marks:</span> {formData.qualifications.twelfthMarks}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              By submitting, you certify that all information submitted is accurate and subject to server validation.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        {step > 1 ? (
          <Button variant="outline" size="sm" onClick={handleBack} disabled={submitting}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button size="sm" onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
            >
              Save as Draft
            </Button>
            <Button size="sm" disabled={submitting} onClick={() => handleSubmit(true)}>
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
