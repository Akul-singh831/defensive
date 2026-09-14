"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { MeritManager } from "../../components/merit/MeritManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MeritPage() {
  const { user } = useAuth(["admin", "student"]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/admissions">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Admissions Hub
        </Button>
      </Link>

      <MeritManager isAdmin={user?.role === "admin"} />
    </div>
  );
}
