export interface MeritCandidate {
  id: string;
  fullName: string;
  email: string;
  program: string;
  qualifications: Record<string, string | number>;
  calculatedScore?: number;
  rank?: number;
}

/**
 * Calculate merit score from academic qualifications
 * Normalizes scores into a 0 - 100 range.
 */
export function calculateCandidateMeritScore(qualifications: Record<string, string | number>): number {
  const scores: number[] = [];

  for (const [, val] of Object.entries(qualifications)) {
    let num = 0;
    if (typeof val === "number") {
      num = val;
    } else {
      num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    }

    if (!isNaN(num) && num > 0) {
      // If score is on 10-point GPA scale, convert to percentage
      if (num <= 10) {
        num = num * 9.5;
      }
      scores.push(Math.min(100, Math.max(0, num)));
    }
  }

  if (scores.length === 0) return 0;
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(avg * 100) / 100;
}

/**
 * Rank candidates in descending order of merit score
 */
export function rankCandidates<T extends { id: string; meritScore?: number | null }>(
  candidates: T[]
): (T & { rank: number })[] {
  const sorted = [...candidates].sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0));
  return sorted.map((c, index) => ({
    ...c,
    rank: index + 1,
  }));
}

/**
 * Generate a formatted student roll number
 */
export function generateRollNumber(program: string, batch: string, seq: number): string {
  const cleanProg = program.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5) || "CS";
  const cleanBatch = batch.slice(-2);
  const formattedSeq = String(seq).padStart(3, "0");
  return `${cleanBatch}${cleanProg}${formattedSeq}`;
}

/**
 * Generate a formatted enrollment number
 */
export function generateEnrollmentNumber(program: string, batch: string): string {
  const cleanProg = program.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "ADM";
  const randomHex = Math.floor(Math.random() * 0xfffff).toString(16).toUpperCase().padStart(5, "0");
  return `ENR-${batch}-${cleanProg}-${randomHex}`;
}
