"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Enquiry {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  interestedProgram: string;
  enquiryDate: string;
  status: string;
}

export default function EnquiryDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const enquiryId = params.id as string;

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!authLoading && enquiryId) {
      const fetchEnquiry = async () => {
        try {
          const response = await fetch(`/api/admissions/enquiry/${enquiryId}`, {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch enquiry");
          }

          const data = (await response.json()) as { ok: boolean; data: Enquiry };
          setEnquiry(data.data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchEnquiry();
    }
  }, [authLoading, user, enquiryId, router]);

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

  if (!enquiry) {
    return (
      <div className="container mx-auto py-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-gray-600">Enquiry not found.</p>
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
          Enquiry Details
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>{enquiry.fullName}</CardTitle>
            <CardDescription>
              Enquiry submitted on {new Date(enquiry.enquiryDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg text-gray-900">{enquiry.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-lg text-gray-900">{enquiry.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Interested Program</p>
                <p className="text-lg text-gray-900">{enquiry.interestedProgram}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg text-gray-900 capitalize">{enquiry.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.role === "admin" && (
          <div className="mt-6 flex gap-4">
            <Button className="w-full">Process Application</Button>
          </div>
        )}
      </div>
    </div>
  );
}
