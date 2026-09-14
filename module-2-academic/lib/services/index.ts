export interface GradeStats {
  averagePct: number;
  gradeDistribution: Record<string, number>;
  totalStudents: number;
  highestMarks: number;
  lowestMarks: number;
}

/**
 * Compute aggregate grade statistics across student marks
 */
export function calculateGradeStatistics(
  marksList: Array<{ marksObtained: number; maxMarks: number; grade?: string | null }>
): GradeStats {
  if (marksList.length === 0) {
    return {
      averagePct: 0,
      gradeDistribution: { "A+": 0, A: 0, "B+": 0, B: 0, C: 0, D: 0, F: 0 },
      totalStudents: 0,
      highestMarks: 0,
      lowestMarks: 0,
    };
  }

  const distribution: Record<string, number> = {
    "A+": 0,
    A: 0,
    "B+": 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  let totalPct = 0;
  let highest = 0;
  let lowest = Infinity;

  for (const m of marksList) {
    const pct = m.maxMarks > 0 ? (m.marksObtained / m.maxMarks) * 100 : 0;
    totalPct += pct;
    highest = Math.max(highest, m.marksObtained);
    lowest = Math.min(lowest, m.marksObtained);

    const grade = m.grade || "F";
    distribution[grade] = (distribution[grade] || 0) + 1;
  }

  return {
    averagePct: Math.round((totalPct / marksList.length) * 10) / 10,
    gradeDistribution: distribution,
    totalStudents: marksList.length,
    highestMarks: highest,
    lowestMarks: lowest === Infinity ? 0 : lowest,
  };
}

/**
 * Calculate overall attendance rate for a student
 */
export function calculateAttendancePercentage(
  records: Array<{ status: "present" | "absent" | "leave" }>
): number {
  if (records.length === 0) return 100;
  const attended = records.filter((r) => r.status === "present").length;
  return Math.round((attended / records.length) * 100);
}
