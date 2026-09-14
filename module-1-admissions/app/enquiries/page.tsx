"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { EnquiryList, type EnquiryItem } from "../../components/enquiries/EnquiryList";
import { EnquiryForm } from "../../components/enquiries/EnquiryForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EnquiriesPage() {
  const { user, loading } = useAuth(["admin", "student"]);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);

  const isAdmin = user?.role === "admin";

  const fetchEnquiries = async () => {
    const res = await fetch("/api/admissions/enquiries", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setEnquiries(data.data || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEnquiries();
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EnquiryForm onSuccess={fetchEnquiries} />
        </div>
        <div className="lg:col-span-2">
          <EnquiryList
            enquiries={enquiries}
            isAdmin={isAdmin}
            onStatusChange={fetchEnquiries}
          />
        </div>
      </div>
    </div>
  );
}
