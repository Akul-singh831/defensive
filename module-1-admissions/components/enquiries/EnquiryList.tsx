"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface EnquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interestedProgram: string;
  status: "new" | "contacted" | "converted" | "closed";
  enquiryDate: string;
}

interface EnquiryListProps {
  enquiries: EnquiryItem[];
  isAdmin: boolean;
  onStatusChange?: (id: string, newStatus: "new" | "contacted" | "converted" | "closed") => void;
}

export function EnquiryList({ enquiries, isAdmin, onStatusChange }: EnquiryListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, status: "new" | "contacted" | "converted" | "closed") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admissions/enquiry/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (res.ok && onStatusChange) {
        onStatusChange(id, status);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">New</Badge>;
      case "contacted":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">Contacted</Badge>;
      case "converted":
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Converted</Badge>;
      case "closed":
        return <Badge variant="outline" className="text-muted-foreground">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
        No admissions enquiries found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {enquiries.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">{e.fullName}</TableCell>
              <TableCell>
                <div className="text-xs space-y-0.5">
                  <p>{e.email}</p>
                  <p className="text-muted-foreground">{e.phone}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{e.interestedProgram}</TableCell>
              <TableCell>{getStatusBadge(e.status)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(e.enquiryDate).toLocaleDateString()}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right space-x-1.5">
                  {e.status === "new" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === e.id}
                      onClick={() => handleUpdate(e.id, "contacted")}
                    >
                      Mark Contacted
                    </Button>
                  )}
                  {e.status === "contacted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === e.id}
                      onClick={() => handleUpdate(e.id, "converted")}
                    >
                      Convert
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
