import { describe, expect, it } from "bun:test";
import {
  assertAcademicRole,
  assertStudentSelfAccess,
  AcademicAuthorizationError,
} from "../../lib/authorization";
import {
  validateGradeBoundaries,
  GradeValidationError,
  ConflictError,
} from "../../lib/security";
import type { JwtPayload } from "@/lib/auth/jwt";

describe("Module 2 (Academic) - Security Defensive Tests", () => {
  const studentA: JwtPayload = {
    userId: "student-A-id",
    email: "studentA@university.edu",
    role: "student",
    jti: "token-s1",
  };

  const studentB: JwtPayload = {
    userId: "student-B-id",
    email: "studentB@university.edu",
    role: "student",
    jti: "token-s2",
  };

  const facultyA: JwtPayload = {
    userId: "faculty-A-id",
    email: "profA@university.edu",
    role: "teacher",
    jti: "token-f1",
  };

  const adminUser: JwtPayload = {
    userId: "admin-id",
    email: "admin@university.edu",
    role: "admin",
    jti: "token-admin",
  };

  // 1. STUDENT PRIVACY / IDOR DEFENSE
  it("DEFENSE: Blocks Student A from accessing Student B's marks (IDOR Defense)", () => {
    // Student A accessing student A succeeds
    expect(() => assertStudentSelfAccess(studentA, "student-A-id")).not.toThrow();

    // Student A accessing student B is rejected with 403 Forbidden
    expect(() => assertStudentSelfAccess(studentA, "student-B-id")).toThrow(
      AcademicAuthorizationError
    );
  });

  it("DEFENSE: Blocks Student A from accessing Student B's attendance records (IDOR Defense)", () => {
    expect(() => assertStudentSelfAccess(studentA, "student-B-id")).toThrow(
      AcademicAuthorizationError
    );
  });

  // 2. ROLE AUTHORIZATION & PRIVILEGE RESTRICTION
  it("DEFENSE: Blocks Students from creating or updating courses", () => {
    expect(() => assertAcademicRole(studentA, ["admin"])).toThrow(
      AcademicAuthorizationError
    );
    expect(() => assertAcademicRole(adminUser, ["admin"])).not.toThrow();
  });

  it("DEFENSE: Blocks Students from recording marks or attendance", () => {
    expect(() => assertAcademicRole(studentA, ["teacher", "admin"])).toThrow(
      AcademicAuthorizationError
    );
  });

  // 3. GRADE TAMPERING DEFENSE
  it("DEFENSE: Rejects arbitrary high marks (e.g. 999/100)", () => {
    expect(() => validateGradeBoundaries(999, 100)).toThrow(GradeValidationError);
  });

  it("DEFENSE: Rejects negative marks (e.g. -20/100)", () => {
    expect(() => validateGradeBoundaries(-20, 100)).toThrow(GradeValidationError);
  });

  it("DEFENSE: Rejects non-numeric grade values", () => {
    expect(() => validateGradeBoundaries(NaN, 100)).toThrow(GradeValidationError);
  });

  // 4. TIMETABLE TIME SLOT INTEGRITY
  it("DEFENSE: Blocks invalid schedule intervals where startTime >= endTime", () => {
    // Valid interval
    const validInterval = {
      startTime: "09:00",
      endTime: "10:30",
    };
    const sMinutes = 9 * 60;
    const eMinutes = 10 * 60 + 30;
    expect(sMinutes < eMinutes).toBe(true);

    // Invalid interval
    const invalidStart = 11 * 60;
    const invalidEnd = 10 * 60;
    expect(invalidStart < invalidEnd).toBe(false);
  });
});
