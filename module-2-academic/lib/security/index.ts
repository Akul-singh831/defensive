import { db } from "@/lib/turso";
import { timetables, attendanceRecords, type courses } from "@/lib/schema";
import { eq, and, or } from "drizzle-orm";

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class GradeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GradeValidationError";
  }
}

/**
 * Convert time string "HH:MM" to minutes since midnight
 */
function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Check if two time intervals [startA, endA) and [startB, endB) overlap
 */
function intervalsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = toMinutes(startA);
  const eA = toMinutes(endA);
  const sB = toMinutes(startB);
  const eB = toMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

export interface TimetableEntry {
  courseId: string;
  teacherId: string;
  room: string;
  sectionCode: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  academicYear: string;
}

/**
 * Server-Side Timetable Conflict Detection (Section 17):
 * Prevents:
 * 1. Same faculty + same time + different classes
 * 2. Same classroom + same time + different classes
 * 3. Same class section + same time + different courses
 */
export async function assertNoTimetableConflicts(
  entry: TimetableEntry,
  excludeId?: string
): Promise<void> {
  const startMin = toMinutes(entry.startTime);
  const endMin = toMinutes(entry.endTime);

  if (startMin >= endMin) {
    throw new ConflictError("Invalid time slot: startTime must be earlier than endTime.");
  }

  // Fetch all existing timetable slots for the same day and academic year
  const existingSlots = await db.query.timetables.findMany({
    where: and(
      eq(timetables.dayOfWeek, entry.dayOfWeek),
      eq(timetables.academicYear, entry.academicYear)
    ),
  });

  for (const slot of existingSlots) {
    if (excludeId && slot.id === excludeId) continue;

    const overlaps = intervalsOverlap(entry.startTime, entry.endTime, slot.startTime, slot.endTime);
    if (!overlaps) continue;

    // Conflict 1: Faculty overlap
    if (slot.teacherId === entry.teacherId) {
      throw new ConflictError(
        `Faculty Conflict: Instructor is already scheduled for course '${slot.courseId}' in room '${slot.room}' from ${slot.startTime} to ${slot.endTime} on ${slot.dayOfWeek}.`
      );
    }

    // Conflict 2: Classroom overlap
    if (slot.room.toLowerCase().trim() === entry.room.toLowerCase().trim()) {
      throw new ConflictError(
        `Classroom Collision: Room '${entry.room}' is already reserved for course '${slot.courseId}' (Section ${slot.sectionCode}) from ${slot.startTime} to ${slot.endTime} on ${slot.dayOfWeek}.`
      );
    }

    // Conflict 3: Class section overlap
    if (slot.courseId === entry.courseId && slot.sectionCode === entry.sectionCode) {
      throw new ConflictError(
        `Section Conflict: Course section '${entry.courseId}-${entry.sectionCode}' already has a class scheduled from ${slot.startTime} to ${slot.endTime} on ${slot.dayOfWeek}.`
      );
    }
  }
}

/**
 * Grade Boundaries & Integrity Enforcement (Section 15):
 * Ensures marks are valid numbers within [0, maxMarks].
 */
export function validateGradeBoundaries(marksObtained: number, maxMarks: number): void {
  if (isNaN(marksObtained) || isNaN(maxMarks)) {
    throw new GradeValidationError("Marks must be valid numbers.");
  }

  if (maxMarks <= 0) {
    throw new GradeValidationError("Maximum marks must be greater than 0.");
  }

  if (marksObtained < 0) {
    throw new GradeValidationError(`Invalid marks: Marks obtained (${marksObtained}) cannot be negative.`);
  }

  if (marksObtained > maxMarks) {
    throw new GradeValidationError(
      `Grade tampering detected / boundary exceeded: Marks obtained (${marksObtained}) exceeds maximum allowable marks (${maxMarks}).`
    );
  }
}

/**
 * Calculate standard Letter Grade from percentage
 */
export function calculateLetterGrade(marksObtained: number, maxMarks: number): string {
  const pct = (marksObtained / maxMarks) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

/**
 * Check for duplicate attendance record on same classDate
 */
export async function assertNoDuplicateAttendance(
  studentId: string,
  courseId: string,
  classDate: string
): Promise<void> {
  const existing = await db.query.attendanceRecords.findFirst({
    where: and(
      eq(attendanceRecords.studentId, studentId),
      eq(attendanceRecords.courseId, courseId),
      eq(attendanceRecords.classDate, classDate)
    ),
  });

  if (existing) {
    throw new ConflictError(
      `Duplicate attendance detected: Attendance has already been recorded for student '${studentId}' on ${classDate}. Use update endpoint to modify existing records.`
    );
  }
}

export interface AcademicRiskReport {
  studentId: string;
  courseId: string;
  isAtRisk: boolean;
  attendanceRate: number;
  averageMarksPct: number;
  riskReasons: string[];
}

/**
 * Defensive AI / Assistive Academic Risk Analysis (Section 21):
 * Identifies students with low attendance or performance without auto-failing.
 */
export function analyzeAcademicRisk(
  studentId: string,
  courseId: string,
  totalClasses: number,
  attendedClasses: number,
  assessments: Array<{ marksObtained: number; maxMarks: number }>
): AcademicRiskReport {
  const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
  
  let totalObtained = 0;
  let totalMax = 0;
  for (const a of assessments) {
    totalObtained += a.marksObtained;
    totalMax += a.maxMarks;
  }
  const averageMarksPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 100;

  const riskReasons: string[] = [];
  if (attendanceRate < 75) {
    riskReasons.push(`Attendance rate is ${attendanceRate}% (below mandatory 75% threshold).`);
  }
  if (averageMarksPct < 40) {
    riskReasons.push(`Average assessment score is ${averageMarksPct}% (failing threshold).`);
  }

  return {
    studentId,
    courseId,
    isAtRisk: riskReasons.length > 0,
    attendanceRate,
    averageMarksPct,
    riskReasons,
  };
}
