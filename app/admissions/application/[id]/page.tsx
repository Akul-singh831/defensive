"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const approveSchema = z.object({
  approvalNotes: z.string().optional(),
});

const rejectSchema = z.object({
  rejectionReason: z.string().min(5, "Rejection reason must be at least 5 characters"),
});

interface Application {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  programAppliedFor: string;
  applicationDate: string;
  status: string;
  approvalDate?: string | null;
  rejectionReason?: string | null;
}

export default function ApplicationDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const approveForm = useForm({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      approvalNotes: "",
    },
  });

  const rejectForm = useForm({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      rejectionReason: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!authLoading && applicationId) {
      const fetchApplication = async () => {
        try {
          const response = await fetch(`/api/admissions/application/${applicationId}`, {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch application");
          }

          const data = (await response.json()) as { ok: boolean; data: Application };
          setApplication(data.data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchApplication();
    }
  }, [authLoading, user, applicationId, router]);

  const handleApprove = async (data: z.infer<typeof approveSchema>) => {
    if (!applicationId) return;
    setActionInProgress(true);
    try {
      const response = await fetch("/api/admissions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          approvalNotes: data.approvalNotes,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to approve application");
      }

      // Refresh application
      const refreshResponse = await fetch(`/api/admissions/application/${applicationId}`, {
        method: "GET",
        credentials: "include",
      });
      const refreshData = (await refreshResponse.json()) as { data: Application };
      setApplication(refreshData.data);
      approveForm.reset();
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (data: z.infer<typeof rejectSchema>) => {
    if (!applicationId) return;
    setActionInProgress(true);
    try {
      const response = await fetch("/api/admissions/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          rejectionReason: data.rejectionReason,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to reject application");
      }

      // Refresh application
      const refreshResponse = await fetch(`/api/admissions/application/${applicationId}`, {
        method: "GET",
        credentials: "include",
      });
      const refreshData = (await refreshResponse.json()) as { data: Application };
      setApplication(refreshData.data);
      rejectForm.reset();
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setActionInProgress(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-gray-600">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">
          Application Details
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{application.fullName}</CardTitle>
            <CardDescription>
              Applied on {new Date(application.applicationDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{application.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900">{application.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                  <p className="text-gray-900">
                    {new Date(application.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Program Applied For</p>
                  <p className="text-gray-900">{application.programAppliedFor}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">{application.address}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {application.status}
                </p>
              </div>

              {application.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                  <p className="text-red-700">{application.rejectionReason}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {user?.role === "admin" && application.status === "pending" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approve Application</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...approveForm}>
                  <form
                    onSubmit={approveForm.handleSubmit(handleApprove)}
                    className="space-y-4"
                  >
                    <FormField
                      control={approveForm.control}
                      name="approvalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Add approval notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={actionInProgress} className="w-full">
                      {actionInProgress ? "Processing..." : "Approve"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reject Application</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...rejectForm}>
                  <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
                    <FormField
                      control={rejectForm.control}
                      name="rejectionReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rejection Reason</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter rejection reason..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={actionInProgress} variant="destructive" className="w-full">
                      {actionInProgress ? "Processing..." : "Reject"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
