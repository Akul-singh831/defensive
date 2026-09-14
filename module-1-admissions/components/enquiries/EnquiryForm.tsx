"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema, type EnquiryInput } from "../../lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface EnquiryFormProps {
  onSuccess?: () => void;
}

export function EnquiryForm({ onSuccess }: EnquiryFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      interestedProgram: "B.Tech Computer Science",
    },
  });

  const onSubmit = async (data: EnquiryInput) => {
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admissions/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to submit enquiry");
      }

      setStatusMsg({
        type: "success",
        text: "Your admission enquiry has been submitted successfully. An admissions counselor will contact you.",
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error submitting enquiry",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">Prospective Student Enquiry</CardTitle>
        <CardDescription>
          Submit an enquiry to receive curriculum information, admissions criteria, and scheduling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {statusMsg && (
          <div
            className={`mb-5 p-3.5 rounded-lg flex items-start gap-2.5 text-sm ${
              statusMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Alex Morgan"
                {...register("fullName")}
                className="w-full focus-visible:ring-1"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                {...register("email")}
                className="w-full focus-visible:ring-1"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 555 019 2834"
                {...register("phone")}
                className="w-full focus-visible:ring-1"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interestedProgram" className="text-sm font-medium">Program of Interest</Label>
              <Select
                defaultValue="B.Tech Computer Science"
                onValueChange={(val) => {
                  if (val) setValue("interestedProgram", val);
                }}
              >
                <SelectTrigger className="w-full focus-visible:ring-1">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech Computer Science">B.Tech Computer Science</SelectItem>
                  <SelectItem value="B.Tech Cybersecurity">B.Tech Cybersecurity</SelectItem>
                  <SelectItem value="B.Tech Artificial Intelligence">B.Tech Artificial Intelligence</SelectItem>
                  <SelectItem value="M.Tech Information Security">M.Tech Information Security</SelectItem>
                </SelectContent>
              </Select>
              {errors.interestedProgram && (
                <p className="text-xs text-destructive">{errors.interestedProgram.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full mt-2">
            {submitting ? "Submitting..." : "Submit Admission Enquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
