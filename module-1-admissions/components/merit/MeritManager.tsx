"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Award, CheckCircle2 } from "lucide-react";

interface MeritManagerProps {
  isAdmin: boolean;
}

export function MeritManager({ isAdmin }: MeritManagerProps) {
  const [program, setProgram] = useState("B.Tech Computer Science");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchMeritList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admissions/merit/list?program=${encodeURIComponent(program)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    fetchMeritList();
  }, [fetchMeritList]);

  const handleCalculate = async () => {
    setCalculating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admissions/merit/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, academicYear: "2026-2027" }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully evaluated and ranked ${data.data?.count || 0} candidates.`);
        fetchMeritList();
      }
    } finally {
      setCalculating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admissions/merit/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, academicYear: "2026-2027" }),
        credentials: "include",
      });
      if (res.ok) {
        setMessage("Merit list has been officially verified and published to prospective applicants.");
        fetchMeritList();
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">Merit Ranking & Publication</CardTitle>
            <CardDescription>
              Objective qualification scoring, automated rank computation, and controlled list publication.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={program} onValueChange={(val) => { if (val) setProgram(val); }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B.Tech Computer Science">B.Tech Computer Science</SelectItem>
                <SelectItem value="B.Tech Cybersecurity">B.Tech Cybersecurity</SelectItem>
                <SelectItem value="B.Tech Artificial Intelligence">B.Tech Artificial Intelligence</SelectItem>
                <SelectItem value="M.Tech Information Security">M.Tech Information Security</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin && (
              <>
                <Button size="sm" variant="outline" disabled={calculating} onClick={handleCalculate}>
                  <Calculator className="w-4 h-4 mr-1.5" />
                  {calculating ? "Calculating..." : "Compute Merit"}
                </Button>
                <Button size="sm" disabled={publishing} onClick={handlePublish}>
                  <Award className="w-4 h-4 mr-1.5" />
                  {publishing ? "Publishing..." : "Publish List"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {message && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Loading merit candidates...</div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground">
            No candidates ranked for {program} yet. {isAdmin && "Click 'Compute Merit' to evaluate submitted applications."}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Merit Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c, idx) => (
                  <TableRow key={c.id} className={c.isOwn ? "bg-primary/5 font-semibold" : ""}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        #{c.meritRank || idx + 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {c.fullName}
                        {c.isOwn && <span className="ml-2 text-xs text-primary font-normal">(You)</span>}
                      </div>
                      {isAdmin && c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{c.programAppliedFor}</TableCell>
                    <TableCell className="font-mono text-sm font-semibold text-primary">
                      {c.meritScore ? `${c.meritScore}%` : "Evaluating"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        Verified
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
