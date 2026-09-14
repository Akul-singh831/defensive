import { describe, expect, it } from "bun:test";
import {
  calculateLetterGrade,
  validateGradeBoundaries,
  analyzeAcademicRisk,
  GradeValidationError,
} from "../../lib/security";
import { calculateGradeStatistics, calculateAttendancePercentage } from "../../lib/services";

describe("Module 2 (Academic) - Unit Validation & Services", () => {
  it("calculates accurate letter grades from percentage", () => {
    expect(calculateLetterGrade(95, 100)).toBe("A+");
    expect(calculateLetterGrade(85, 100)).toBe("A");
    expect(calculateLetterGrade(75, 100)).toBe("B+");
    expect(calculateLetterGrade(65, 100)).toBe("B");
    expect(calculateLetterGrade(55, 100)).toBe("C");
    expect(calculateLetterGrade(45, 100)).toBe("D");
    expect(calculateLetterGrade(35, 100)).toBe("F");
  });

  it("validates marks within allowed bounds [0, maxMarks]", () => {
    expect(() => validateGradeBoundaries(85, 100)).not.toThrow();
    expect(() => validateGradeBoundaries(0, 100)).not.toThrow();
    expect(() => validateGradeBoundaries(100, 100)).not.toThrow();
  });

  it("rejects negative marks (Grade Tampering Defense)", () => {
    expect(() => validateGradeBoundaries(-5, 100)).toThrow(GradeValidationError);
  });

  it("rejects marks exceeding maximum allowable marks (Grade Tampering Defense)", () => {
    expect(() => validateGradeBoundaries(105, 100)).toThrow(GradeValidationError);
    expect(() => validateGradeBoundaries(999, 100)).toThrow(GradeValidationError);
  });

  it("computes aggregate grade statistics accurately", () => {
    const marks = [
      { marksObtained: 90, maxMarks: 100, grade: "A+" },
      { marksObtained: 80, maxMarks: 100, grade: "A" },
      { marksObtained: 70, maxMarks: 100, grade: "B+" },
    ];
    const stats = calculateGradeStatistics(marks);
    expect(stats.averagePct).toBe(80);
    expect(stats.totalStudents).toBe(3);
    expect(stats.highestMarks).toBe(90);
    expect(stats.lowestMarks).toBe(70);
    expect(stats.gradeDistribution["A+"]).toBe(1);
  });

  it("computes student attendance rate percentage", () => {
    const records = [
      { status: "present" as const },
      { status: "present" as const },
      { status: "present" as const },
      { status: "absent" as const },
    ];
    const pct = calculateAttendancePercentage(records);
    expect(pct).toBe(75);
  });

  it("detects students at academic risk for attendance < 75%", () => {
    const risk = analyzeAcademicRisk("student-1", "course-1", 10, 6, [
      { marksObtained: 80, maxMarks: 100 },
    ]);
    expect(risk.isAtRisk).toBe(true);
    expect(risk.attendanceRate).toBe(60);
    expect(risk.riskReasons[0]).toContain("below mandatory 75% threshold");
  });
});
